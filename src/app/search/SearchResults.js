"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebaseConfig';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchEpisodes() {
      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch all episodes and filter client-side for case-insensitive search
        const episodesRef = collection(db, 'episodes');
        const querySnapshot = await getDocs(episodesRef);
        
        const searchResults = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(episode => 
            episode.title?.toLowerCase().includes(searchQuery) ||
            episode.guest?.toLowerCase().includes(searchQuery)
          );

        setResults(searchResults);
      } catch (error) {
        console.error('Error searching episodes:', error);
      } finally {
        setLoading(false);
      }
    }

    searchEpisodes();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Searching...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for &quot;{searchQuery || ''}&quot;
      </h1>

      {results.length === 0 ? (
        <p className="text-gray-600">No episodes found matching your search.</p>
      ) : (
        <div className="grid gap-6">
          {results.map((episode) => (
            <Link
              href={`/episode/${episode.id}`}
              key={episode.id}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{episode.title}</h2>
              <p className="text-gray-600">
                Guest: {episode.guest}
              </p>
              <p className="text-gray-500 text-sm">
                Date: {new Date(episode.date).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}