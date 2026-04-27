def verify_document(extracted_features):
    score = extracted_features.get('simulated_anomaly_score', 0.90)
    is_verified = bool(score >= 0.85)
    confidence_percentage = round(score * 100, 2)
    return {
        'verified': is_verified,
        'similarity_score': round(score, 3),
        'confidence_percentage': confidence_percentage
    }
