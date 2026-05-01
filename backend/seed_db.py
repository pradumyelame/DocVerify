from pymongo import MongoClient

def seed_database():
    MONGO_URI = "mongodb://localhost:27017/DigitalDocc"
    DB_NAME = "DigitalDocc"

    try:
        print("Connecting to MongoDB...")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = client[DB_NAME]
        collection = db.trusted_documents
        
        # Clear existing dummy data to avoid duplicates
        collection.delete_many({})
        
        # Add Trusted Records
        trusted_records = [
            {
                "document_id": "123456789",
                "name": "Jane Doe",
                "dob": "1995-08-12",
                "issuer": "UIDAI",
                "status": "Verified"
            },
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
        
        collection.insert_many(trusted_records)
        print("✅ Successfully seeded the MongoDB database with trusted records!")
        print(f"Inserted names: {[r['name'] for r in trusted_records]}")
        
    except Exception as e:
        print(f"❌ Failed to connect or seed MongoDB: {e}")

if __name__ == "__main__":
    seed_database()
