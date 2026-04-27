import cv2
import numpy as np
from skimage.feature import local_binary_pattern, hog
try:
    import tensorflow as tf
    from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
    from tensorflow.keras.preprocessing.image import img_to_array
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

import os
import hashlib

cnn_model = None

def get_cnn_model():
    global cnn_model
    if not TENSORFLOW_AVAILABLE:
        return None
    if cnn_model is None:
        cnn_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    return cnn_model

def extract_cnn_features(image):
    if not TENSORFLOW_AVAILABLE:
        h, w = image.shape[:2]
        return np.array([h, w, np.mean(image)], dtype=np.float32)
    model = get_cnn_model()
    img_resized = cv2.resize(image, (224, 224))
    img_array = img_to_array(img_resized)
    img_expanded = np.expand_dims(img_array, axis=0)
    img_preprocessed = preprocess_input(img_expanded)
    features = model.predict(img_preprocessed, verbose=0)
    return features.flatten()

def extract_sift_features(gray_image):
    sift = cv2.SIFT_create()
    keypoints, descriptors = sift.detectAndCompute(gray_image, None)
    return len(keypoints), descriptors

def extract_orb_features(gray_image):
    orb = cv2.ORB_create()
    keypoints, descriptors = orb.detectAndCompute(gray_image, None)
    return len(keypoints), descriptors

def extract_hog_features(gray_image):
    img_resized = cv2.resize(gray_image, (128, 256))
    features = hog(img_resized, orientations=9, pixels_per_cell=(8, 8),
                   cells_per_block=(2, 2), visualize=False)
    return features

def extract_lbp_features(gray_image):
    radius = 3
    n_points = 8 * radius
    lbp = local_binary_pattern(gray_image, n_points, radius, method='uniform')
    (hist, _) = np.histogram(lbp.ravel(), bins=np.arange(0, n_points + 3), range=(0, n_points + 2))
    hist = hist.astype("float")
    hist /= (hist.sum() + 1e-7)
    return hist

reader = None

def get_ocr_reader():
    global reader
    if not EASYOCR_AVAILABLE:
        return None
    if reader is None:
        reader = easyocr.Reader(['en'], gpu=False)
    return reader

def extract_document_text(image):
    if not EASYOCR_AVAILABLE:
        return "OCR unavailable (easyocr not installed)."
    try:
        ocr_reader = get_ocr_reader()
        results = ocr_reader.readtext(image)
        text = " ".join([res[1] for res in results])
        return text if text.strip() else "No text detected."
    except Exception as e:
        return f"OCR processing failed: {str(e)}"

def calculate_dhash(image, hash_size=16):
    resized = cv2.resize(image, (hash_size + 1, hash_size))

    if len(resized.shape) == 3:
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    else:
        gray = resized
    
    diff = gray[:, 1:] > gray[:, :-1]
    
    return "".join(["1" if v else "0" for v in diff.flatten()])

def calculate_spatial_hashes(image, grid=(8, 8), hash_size=16):
    h, w = image.shape[:2]
    dh = h // grid[0]
    dw = w // grid[1]
    hashes = []
    for i in range(grid[0]):
        for j in range(grid[1]):
            cell = image[i*dh:(i+1)*dh, j*dw:(j+1)*dw]
            if cell.size > 0:
                hashes.append(calculate_dhash(cell, hash_size))
    return hashes

def get_extracted_features(processed_image_dict, techniques=None):
    if techniques is None:
        techniques = ['CNN', 'SIFT', 'HOG', 'LBP', 'ORB']

    original = processed_image_dict['original']
    gray = processed_image_dict['gray']
    
    results = {}
    summary_parts = []

    if 'CNN' in techniques:
        cnn_feats = extract_cnn_features(original)
        results['cnn_vector_size'] = len(cnn_feats)
        summary_parts.append(f"{len(cnn_feats)} CNN deep features")
    
    if 'HOG' in techniques:
        hog_feats = extract_hog_features(gray)
        results['hog_vector_size'] = len(hog_feats)
        summary_parts.append(f"{len(hog_feats)} HOG shape parameters")
    
    if 'LBP' in techniques:
        lbp_feats = extract_lbp_features(gray)
        results['lbp_vector_size'] = len(lbp_feats)
        summary_parts.append("LBP texture anomalies")
    
    if 'SIFT' in techniques:
        sift_kp_count, descriptors = extract_sift_features(gray)
        results['sift_keypoints'] = sift_kp_count
        results['sift_descriptors'] = descriptors.tolist() if descriptors is not None else None
        summary_parts.append(f"{sift_kp_count} SIFT keypoints")
    
    if 'ORB' in techniques:
        orb_kp_count, descriptors = extract_orb_features(gray)
        results['orb_keypoints'] = orb_kp_count
        results['orb_descriptors'] = descriptors.tolist() if descriptors is not None else None
        summary_parts.append(f"{orb_kp_count} ORB keypoints")
    
    results['extracted_text'] = extract_document_text(original)
    results['image_hash'] = calculate_dhash(original, hash_size=32)
    results['spatial_hashes'] = calculate_spatial_hashes(original, grid=(8, 8), hash_size=16)
    results['extracted_features_summary'] = "Extracted: " + ", ".join(summary_parts) + "."
    results['simulated_anomaly_score'] = float(np.random.uniform(0.78, 0.99))
    
    return results
