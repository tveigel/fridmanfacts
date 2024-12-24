'use client';

import { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebaseConfig';
import { generateUsername } from '../../lib/utils/userUtils';

export default function UserMigration() {
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const migrateUsers = async () => {
    setIsLoading(true);
    setError(null);
    setMigrationStatus('Starting migration...');

    try {
      // Get all users from Firestore
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let updated = 0;
      let skipped = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Skip if user already has a username
        if (userData.username) {
          skipped++;
          continue;
        }

        // Generate and set username
        const username = await generateUsername();
        await setDoc(doc(db, 'users', userDoc.id), {
          ...userData,
          username,
          updatedAt: new Date()
        }, { merge: true });

        updated++;
        setMigrationStatus(`Processed ${updated + skipped} users (${updated} updated, ${skipped} skipped)...`);
      }

      setMigrationStatus(`Migration completed: ${updated} users updated, ${skipped} users skipped`);
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h2 className="font-semibold mb-4">User Migration Tool</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          This tool will generate usernames for all users who don&apos;t have one yet.
          Existing usernames will not be modified.
        </p>
        
        <button
          onClick={migrateUsers}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "Migrating..." : "Start Migration"}
        </button>
      </div>

      {migrationStatus && (
        <div className="mt-4 p-2 bg-blue-100 text-blue-700 rounded">
          {migrationStatus}
        </div>
      )}

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          Error during migration: {error}
        </div>
      )}
    </div>
  );
}