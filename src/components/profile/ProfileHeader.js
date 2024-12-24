import React from 'react';
import Image from 'next/image';
import { ListChecks, MessageSquare } from 'lucide-react';

export default function ProfileHeader({ 
  profile, 
  isOwnProfile,
  factCheckCount,
  commentCount
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center gap-6">
        {/* Profile Image */}
        {profile?.photoURL ? (
          <div className="relative w-24 h-24">
            <Image
              src={profile.photoURL}
              alt={`${profile.displayName || 'User'}'s profile`}
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-400">
              {(profile?.displayName || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Profile Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {profile?.displayName || 'Anonymous User'}
            {isOwnProfile && <span className="text-gray-500 text-lg ml-2">(You)</span>}
          </h1>
          
          {/* Stats */}
          <div className="flex gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <ListChecks size={20} />
              <span>{factCheckCount} Fact Checks</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <span>{commentCount} Comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}