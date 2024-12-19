import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
import re
from datetime import datetime

def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

def create_collections(db):
    """Create necessary collections with example documents."""
    # Example admin user
    admin_data = {
        'email': 'admin@example.com',  # Replace with real admin email
        'role': 'admin',
        'displayName': 'Admin User',
        'preferences': {
            'validationThreshold': 10,
            'showControversialFlags': True,
            'showUnvalidatedFlags': True
        },
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    }
    
    try:
        # Create users collection with admin user
        db.collection('users').document('admin').set(admin_data)
        print("✓ Created admin user")
        
        # Create fact checks collection (empty for now)
        # We'll let users create fact checks through the app
        print("✓ Initialized factChecks collection")
        
    except Exception as e:
        print(f"Error creating collections: {e}")

def update_episodes_structure(db, json_file):
    """Update existing episodes with new structure elements."""
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        # Generate a sanitized document ID
        doc_id = re.sub(r"[^a-zA-Z0-9_-]", "", item["title"].replace(" ", "_").lower())
        
        # Add new fields to the episode structure
        enhanced_item = {
            **item,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now(),
            'factCheckCount': 0,  # Will be updated as fact checks are added
            'validatedFactCheckCount': 0,
            'controversialFactCheckCount': 0,
            'totalFactCheckScore': 0,  # Sum of all fact check votes
            'topFactChecks': []  # Array of top 3 fact check IDs for quick access
        }

        try:
            print(f"Uploading: {item['title']}...")
            db.collection('episodes').document(doc_id).set(enhanced_item)
            print(f"✓ Uploaded: {item['title']} with ID: {doc_id}")
        except Exception as e:
            print(f"✗ Failed to upload {item['title']}: {e}")

def setup_firebase():
    """Main function to set up Firebase with new structure."""
    print("Starting Firebase setup...")
    
    # Initialize Firebase
    db = initialize_firebase()
    print("✓ Firebase initialized")
    
    # Create new collections
    create_collections(db)
    print("✓ Collections created")
    
    # Update episodes
    json_file = "podcast_data.json"
    update_episodes_structure(db, json_file)
    print("✓ Episodes updated")
    
    print("\nFirebase setup completed!")

if __name__ == "__main__":
    setup_firebase()