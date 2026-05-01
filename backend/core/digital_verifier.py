import os
import json
import hashlib
import cv2
import requests
from PyPDF2 import PdfReader
from PIL import Image, ExifTags
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AFFINDA_API_KEY = os.getenv("AFFINDA_API_KEY", "aff_0137439bc98d9dc0ca5a1754147da4f480244450")
AFFINDA_API_URL = "https://api.affinda.com/v3/documents"

# MongoDB Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/digitaldoc")
DB_NAME = "digitaldoc"

# Mock Trusted Database (Fallback)
TRUSTED_DB = [
    {
        "document_id": "DOC123",
        "name": "John Doe",
        "dob": "1990-01-01",
        "issuer": "UIDAI",
        "status": "Verified"
    },
    {
        "document_id": "CBSE456",
        "name": "Alice Smith",
        "dob": "2005-05-15",
        "issuer": "CBSE",
        "status": "Verified"
    }
]

def extract_metadata(filepath):
    metadata = {
        "creation_date": "Unknown",
        "modification_date": "Unknown",
        "software": "Unknown",
        "suspicious_edits_detected": False
    }
    ext = filepath.lower().split('.')[-1]
    
    try:
        if ext == 'pdf':
            reader = PdfReader(filepath)
            info = reader.metadata
            if info:
                metadata["creation_date"] = info.get('/CreationDate', 'Unknown')
                metadata["modification_date"] = info.get('/ModDate', 'Unknown')
                metadata["software"] = info.get('/Producer', info.get('/Creator', 'Unknown'))
                
                # Simple check for common editing software
                suspicious_tools = ['photoshop', 'illustrator', 'gimp', 'acrobat', 'pdfedit']
                for tool in suspicious_tools:
                    if tool in str(metadata["software"]).lower():
                        metadata["suspicious_edits_detected"] = True
                        
        elif ext in ['jpg', 'jpeg', 'png']:
            image = Image.open(filepath)
            exifdata = image.getexif()
            if exifdata:
                for tag_id in exifdata:
                    tag = ExifTags.TAGS.get(tag_id, tag_id)
                    data = exifdata.get(tag_id)
                    if tag == 'Software':
                        metadata["software"] = str(data)
                        suspicious_tools = ['photoshop', 'illustrator', 'gimp', 'canva']
                        for tool in suspicious_tools:
                            if tool in metadata["software"].lower():
                                metadata["suspicious_edits_detected"] = True
                    elif tag == 'DateTime':
                        metadata["modification_date"] = str(data)
                    elif tag == 'DateTimeOriginal':
                        metadata["creation_date"] = str(data)
    except Exception as e:
        print(f"Metadata extraction error: {e}")
        
    return metadata

def call_affinda_api(filepath):
    try:
        headers = {
            "Authorization": f"Bearer {AFFINDA_API_KEY}"
        }
        
        # 1. Use explicit workspace ID provided by user
        workspace_identifier = "VVHwKJZi"
        
        with open(filepath, 'rb') as f:
            files = {
                'file': (os.path.basename(filepath), f)
            }
            
            data = {}
            if workspace_identifier:
                data["workspace"] = workspace_identifier
            
            response = requests.post(AFFINDA_API_URL, headers=headers, files=files, data=data)
            
            if response.status_code == 200 or response.status_code == 201:
                result = response.json()
                extracted_data = {}
                if "data" in result:
                    data_obj = result["data"]
                    # Extract all fields dynamically regardless of the collection type
                    for key, val in data_obj.items():
                        if isinstance(val, dict) and "raw" in val:
                            if val["raw"]:  # Only add if it's not empty
                                extracted_data[key] = val["raw"]
                        elif isinstance(val, list) and len(val) > 0:
                            if isinstance(val[0], dict) and "raw" in val[0]:
                                extracted_data[key] = ", ".join([v.get("raw", "") for v in val if "raw" in v])
                            else:
                                extracted_data[key] = str(val)
                        elif isinstance(val, str) or isinstance(val, int):
                            extracted_data[key] = val
                            
                    # Fallback for name to ensure DB check has something to look for
                    if "name" not in extracted_data:
                        # Try to guess a name field if 'name' specifically isn't there
                        for possible_name in ["person_name", "customerName", "supplierName", "first_name", "fullName", "candidateName"]:
                            if possible_name in extracted_data:
                                extracted_data["name"] = extracted_data[possible_name]
                                break

                    extracted_data["raw_text"] = result.get("meta", {}).get("rawText", "")
                    return {"status": "success", "data": extracted_data}
            else:
                return {"status": "error", "message": f"Affinda API Error: {response.status_code} - {response.text}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

    return {"status": "error", "message": "Unknown error"}

def generate_fingerprint(text, visual_hash):
    raw_data = f"{text}_{visual_hash}"
    return hashlib.sha256(raw_data.encode('utf-8')).hexdigest()

def check_trusted_db(extracted_data):
    matched_doc = None
    
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.admin.command('ismaster') # force connection
        db = client[DB_NAME]
        collection = db.trusted_documents
        
        # 1. First, try to match against any Admin Uploads in the database
        admin_docs = list(collection.find({"source": "Admin Upload"}))
        best_match_score = 0
        best_doc = None
        
        for doc in admin_docs:
            raw_admin_data = doc.get("raw_data", {})
            match_count = 0
            total_keys = 0
            
            for key, val in extracted_data.items():
                if key == "raw_text": continue
                total_keys += 1
                admin_val = raw_admin_data.get(key)
                if admin_val and str(val).lower().strip() == str(admin_val).lower().strip():
                    match_count += 1
                    
            if total_keys > 0:
                score = match_count / total_keys
                if score > best_match_score:
                    best_match_score = score
                    best_doc = doc
                    
        # If at least 50% of the structured fields match the Admin document, consider it VERIFIED
        if best_match_score >= 0.5:
            matched_doc = {k: v for k, v in best_doc.items() if k != '_id'}
        else:
            # 2. Fallback to basic Name search if no robust match found
            found_name = extracted_data.get("name", "").lower()
            query = {"name": {"$regex": f"^{found_name}$", "$options": "i"}}
            doc = collection.find_one(query)
            if doc:
                matched_doc = {k: v for k, v in doc.items() if k != '_id'}
            
    except Exception as e:
        print(f"MongoDB error: {e}. Falling back to mock DB.")
        found_name = extracted_data.get("name", "").lower()
        for doc in TRUSTED_DB:
            if doc["name"].lower() in found_name:
                matched_doc = doc
                break
                
    if matched_doc:
        return {"status": "Verified", "matched_record": matched_doc}
    return {"status": "Unverified", "matched_record": None}

def process_digital_document(filepath, image):
    report = {
        "metadata_analysis": {},
        "affinda_extraction": {},
        "db_verification": {},
        "fingerprint": "",
        "decision": "PENDING",
        "confidence": 0.0,
        "explainable_reasons": []
    }
    
    score = 100.0
    
    # 1. Metadata
    meta = extract_metadata(filepath)
    report["metadata_analysis"] = meta
    if meta.get("suspicious_edits_detected"):
        score -= 30
        report["explainable_reasons"].append("Metadata Analysis: Suspicious editing software (e.g. Photoshop) detected.")
        
    # 2. Affinda Data
    affinda_res = call_affinda_api(filepath)
    report["affinda_extraction"] = affinda_res
    if affinda_res.get("status") == "error":
        report["explainable_reasons"].append(f"Affinda API: Failed to extract structured data ({affinda_res.get('message')}). Fallback used.")
        score -= 20
    else:
        report["explainable_reasons"].append("Affinda API: Successfully extracted structured text fields.")
        
    # 3. DB Verification (The Ultimate Source of Truth)
    aff_data = affinda_res.get("data", {}) if affinda_res.get("status") == "success" else {}
    db_res = check_trusted_db(aff_data)
    report["db_verification"] = db_res
    
    if db_res["status"] == "Verified":
        report["explainable_reasons"].append(f"DigiLocker-Trusted DB: Match found for {db_res['matched_record']['name']}.")
        # If the database matches exactly, we consider this document VERIFIED
        score = max(score, 100.0)
    else:
        report["explainable_reasons"].append("DigiLocker-Trusted DB: No matching record found in Trusted Document Database.")
        score -= 40 # Heavy penalty if not found in DB
        
    # 4. Fingerprint
    raw_text = aff_data.get("raw_text", "")
    report["fingerprint"] = generate_fingerprint(raw_text, "visual_hash_placeholder")
    report["explainable_reasons"].append(f"Fingerprinting: SHA-256 integrity hash generated ({report['fingerprint'][:10]}...).")

    # Final Decision
    if db_res["status"] == "Verified" or score >= 90:
        report["decision"] = "DOCUMENT IS OKAY"
    else:
        report["decision"] = "TAMPERED"
        
    return report
