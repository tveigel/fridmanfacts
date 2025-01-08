import firebase_admin
from firebase_admin import credentials, firestore
import json
import re
from datetime import datetime

def generate_doc_id(title):
    """Generates the correct document ID by replacing all special characters with a single underscore."""
    # Convert to lowercase
    title = title.lower()
    # Replace all special characters (anything that's not alphanumeric) with underscore
    doc_id = re.sub(r'[^a-z0-9]', '_', title)
    # Replace multiple underscores with a single underscore
    doc_id = re.sub(r'_+', '_', doc_id)
    # Remove leading/trailing underscores
    return doc_id.strip('_')

def upload_to_firestore(json_file, collection_name):
    """Uploads JSON data to Firestore, overwriting existing documents."""
    # Initialize Firebase Admin
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)

    # Get Firestore client
    db = firestore.client()
    collection_ref = db.collection(collection_name)
    
    # Load JSON data
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    print(f"\nStarting upload of {len(data)} episodes...")
    
    # Track uploaded documents
    uploaded_ids = set()
    
    # Upload each podcast to Firestore
    for item in data:
        try:
            # Generate correct document ID
            doc_id = generate_doc_id(item["title"])
            
            # Add timestamps if they don't exist
            if 'createdAt' not in item:
                item['createdAt'] = datetime.utcnow().isoformat()
            if 'updatedAt' not in item:
                item['updatedAt'] = datetime.utcnow().isoformat()
            
            # Add missing fields with default values if they don't exist
            defaults = {
                'controversialFactCheckCount': 0,
                'factCheckCount': 0,
                'totalFactCheckScore': 0,
                'validatedFactCheckCount': 0
            }
            
            for key, value in defaults.items():
                if key not in item:
                    item[key] = value
            
            print(f"Writing document: {doc_id}")
            collection_ref.document(doc_id).set(item)
            uploaded_ids.add(doc_id)
                
        except Exception as e:
            print(f"Failed to process {item['title']}: {str(e)}")
    
    # Delete documents that weren't in the upload
    print("\nCleaning up old documents...")
    existing_docs = collection_ref.get()
    for doc in existing_docs:
        if doc.id not in uploaded_ids:
            print(f"Deleting old document: {doc.id}")
            doc.reference.delete()
    
    print("\nUpload complete!")

if __name__ == "__main__":
    json_file = "podcast_data.json"
    collection_name = "episodes"
    upload_to_firestore(json_file, collection_name)