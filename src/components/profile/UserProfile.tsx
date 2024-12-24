"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebaseConfig';
import { useAuth } from '../../lib/context/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileActivity from './ProfileActivity';
import KarmaAchievements from '../karma/KarmaAchievements';

interface UserProfileProps {
  username: string;
}

interface ProfileData {
  id: string;
  username?: string;
  [key: string]: any;
}

// Updated interfaces based on your Firebase data structure
interface FactCheckActivity {
  id: string;
  createdAt: any; // Firebase Timestamp
  episodeId: string;
  flaggedText: string;
  moderatedAt?: string;
  moderatedBy?: string;
  moderatorNote?: string;
  source?: string;
  status: string;
  submittedBy: string;
  transcriptTime: string;
  updatedAt: string;
  [key: string]: any;
}

interface CommentActivity {
  id: string;
  content: string;
  createdAt: any; // Firebase Timestamp
  downvotes: number;
  factCheckId: string;
  isDeleted: boolean;
  parentCommentId: string | null;
  updatedAt: string;
  upvotes: number;
  userId: string;
  [key: string]: any;
}

interface Activities {
  factChecks: FactCheckActivity[];
  comments: CommentActivity[];
}

function mapDocToActivity<T>(doc: any): T {
  return {
    id: doc.id,
    ...doc.data()
  } as T;
}

export default function UserProfile({ username }: UserProfileProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activities, setActivities] = useState<Activities>({
    factChecks: [],
    comments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        const userSnapshot = await getDocs(usersQuery);
        
        if (userSnapshot.empty) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userDoc = userSnapshot.docs[0];
        const userId = userDoc.id;
        const profileData = { id: userDoc.id, ...userDoc.data() } as ProfileData;
        setProfileData(profileData);

        try {
          const factChecksQuery = query(
            collection(db, 'factChecks'),
            where('submittedBy', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const factChecksSnapshot = await getDocs(factChecksQuery);
          const factChecks = factChecksSnapshot.docs.map(doc => 
            mapDocToActivity<FactCheckActivity>(doc)
          );
          setActivities(prev => ({ ...prev, factChecks }));
        } catch (indexError) {
          console.log('Falling back to unordered fact checks query');
          try {
            const fallbackQuery = query(
              collection(db, 'factChecks'),
              where('submittedBy', '==', userId)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const factChecks = fallbackSnapshot.docs
              .map(doc => mapDocToActivity<FactCheckActivity>(doc))
              .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
              });
            setActivities(prev => ({ ...prev, factChecks }));
          } catch (fallbackError) {
            console.error('Error in fallback fact checks query:', fallbackError);
            setError('Error loading fact checks. Please try again later.');
          }
        }

        try {
          const commentsQuery = query(
            collection(db, 'comments'),
            where('userId', '==', userId)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const comments = commentsSnapshot.docs
            .map(doc => mapDocToActivity<CommentActivity>(doc))
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(0);
              return dateB - dateA;
            });
          
          setActivities(prev => ({ ...prev, comments }));
        } catch (commentsError) {
          console.error('Error fetching comments:', commentsError);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err.message?.includes('index')) {
          setError(
            'Database index required. Please contact the administrator to set up the necessary indexes.'
          );
        } else {
          setError('Failed to load profile data. Please try again later.');
        }
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [username]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600 mb-2">{error}</p>
        {error.includes('index') && (
          <div className="bg-white p-4 rounded border border-red-200 mt-4">
            <p className="text-sm text-gray-600 mb-2">Administrator Instructions:</p>
            <p className="text-sm text-gray-600">Create the following index in Firebase:</p>
            <div className="bg-gray-50 p-3 rounded mt-2">
              <p className="text-sm font-mono">Collection: factChecks</p>
              <p className="text-sm font-mono">Fields:</p>
              <ul className="list-disc list-inside text-sm font-mono ml-4">
                <li>submittedBy (Ascending)</li>
                <li>createdAt (Descending)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading || !profileData) {
    return <ProfileSkeleton />;
  }

  const isOwnProfile = user?.uid === profileData.id;

  return (
    <div className="space-y-8">
      <ProfileHeader 
        profile={profileData} 
        isOwnProfile={isOwnProfile}
        factCheckCount={activities.factChecks.length}
        commentCount={activities.comments.length}
      />
      
      {isOwnProfile && <KarmaAchievements />}
      
      <ProfileActivity activities={activities} />
    </div>
  );
}

// Re-added ProfileSkeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}