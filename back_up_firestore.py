import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime

def convert_timestamp(obj):
    """Convert Firestore timestamps to string format."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Object of type {obj.__class__.__name__} is not JSON serializable')

def backup_firestore():
    """Creates a backup of all documents in the episodes collection."""
    # Initialize Firebase if not already initialized
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    print("Starting backup process...")
    
    # Get all documents
    docs = db.collection("episodes").stream()
    
    # Convert documents to dictionaries, handling timestamp conversion
    backup_data = []
    for doc in docs:
        doc_dict = doc.to_dict()
        # Convert any timestamp fields to strings
        if 'createdAt' in doc_dict and doc_dict['createdAt']:
            doc_dict['createdAt'] = doc_dict['createdAt'].isoformat()
        if 'updatedAt' in doc_dict and doc_dict['updatedAt']:
            doc_dict['updatedAt'] = doc_dict['updatedAt'].isoformat()
        backup_data.append(doc_dict)
    
    # Save to backup file with custom JSON encoder
    backup_filename = f"firestore_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_filename, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, default=convert_timestamp, ensure_ascii=False, indent=4)
    
    print(f"Backup completed successfully! Saved to {backup_filename}")
    print(f"Total documents backed up: {len(backup_data)}")

if __name__ == "__main__":
    backup_firestore()