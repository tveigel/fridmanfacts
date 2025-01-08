import firebase_admin
from firebase_admin import credentials, firestore
import re
from datetime import datetime

def generate_correct_doc_id(title):
    """Generates the correct document ID by replacing all special characters with a single underscore."""
    # Convert to lowercase
    title = title.lower()
    # Replace all special characters (anything that's not alphanumeric) with underscore
    doc_id = re.sub(r'[^a-z0-9]', '_', title)
    # Replace multiple underscores with a single underscore
    doc_id = re.sub(r'_+', '_', doc_id)
    # Remove leading/trailing underscores
    return doc_id.strip('_')

def get_timestamp_value(data):
    """Safely get a comparable timestamp value from document data."""
    created_at = data.get('createdAt')
    if isinstance(created_at, datetime):
        return created_at
    if isinstance(created_at, str):
        try:
            return datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        except ValueError:
            return datetime.min
    return datetime.min

def cleanup_firestore():
    """Cleans up duplicate documents in Firestore by merging them under the correct ID format."""
    # Initialize Firebase Admin
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    collection_ref = db.collection('episodes')
    
    # Get all documents
    print("Fetching all documents...")
    docs = collection_ref.get()
    
    # Group documents by their correct ID
    doc_groups = {}
    for doc in docs:
        data = doc.to_dict()
        correct_id = generate_correct_doc_id(data['title'])
        if correct_id not in doc_groups:
            doc_groups[correct_id] = []
        doc_groups[correct_id].append((doc.id, data))

    # Print analysis summary
    print("\n=== Analysis Summary ===")
    print(f"Total unique titles: {len(doc_groups)}")
    duplicate_groups = sum(1 for docs in doc_groups.values() if len(docs) > 1)
    print(f"Groups with duplicates: {duplicate_groups}")
    incorrect_singles = sum(1 for docs in doc_groups.values() if len(docs) == 1 and docs[0][0] != generate_correct_doc_id(docs[0][1]['title']))
    print(f"Single documents with incorrect IDs: {incorrect_singles}")

    print("\n=== Starting Cleanup ===\n")

    # Process each group
    for correct_id, doc_list in doc_groups.items():
        if len(doc_list) > 1:
            print(f"\nProcessing duplicate group for: {correct_id}")
            print(f"Found {len(doc_list)} duplicates with IDs: {[doc[0] for doc in doc_list]}")
            
            # Sort by createdAt timestamp
            try:
                doc_list.sort(key=lambda x: get_timestamp_value(x[1]))
                oldest_id, keep_data = doc_list[0]
                print(f"Keeping oldest document with ID: {oldest_id}")
                
                # If the oldest document doesn't have the correct ID format, create new document
                if oldest_id != correct_id:
                    print(f"Creating new document with correct ID: {correct_id}")
                    collection_ref.document(correct_id).set(keep_data)
                
                # Delete all other documents (including the oldest if its ID was incorrect)
                for old_id, _ in doc_list:
                    if old_id != correct_id:
                        print(f"Deleting document: {old_id}")
                        collection_ref.document(old_id).delete()
                        
            except Exception as e:
                print(f"Error processing group {correct_id}: {str(e)}")
                continue
                
        elif len(doc_list) == 1:
            # Handle single documents with incorrect IDs
            old_id, data = doc_list[0]
            if old_id != correct_id:
                print(f"\nFixing single document ID from {old_id} to {correct_id}")
                try:
                    collection_ref.document(correct_id).set(data)
                    collection_ref.document(old_id).delete()
                except Exception as e:
                    print(f"Error fixing {old_id}: {str(e)}")

    print("\n=== Cleanup Complete ===")

if __name__ == "__main__":
    cleanup_firestore()