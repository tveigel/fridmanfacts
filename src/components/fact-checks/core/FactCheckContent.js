import React from 'react';
import UserLevelDisplay from './UserLevelDisplay';

export default function FactCheckContent({ factCheck }) {
  return (
    <div className="flex-1">
      {/* Replace double username display with UserLevelDisplay component */}
      <div className="mb-4">
        <UserLevelDisplay 
          userId={factCheck.submittedBy}
          className="text-lg"
        />
      </div>

      <div className="mb-6">
        <div className="font-medium text-2xl mb-2">Flagged text:</div>
        <q className="fact-check-text italic text-gray-800">{factCheck.flaggedText}</q>
      </div>

      <div className="mb-6">
        <div className="font-medium text-2xl mb-2">Context:</div>
        <p className="fact-check-text text-gray-800">{factCheck.context}</p>
      </div>

      <div className="mb-4">
        <div className="font-medium text-2xl mb-2">Source:</div>
        <a 
          href={factCheck.source} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline break-all text-xl"
        >
          {factCheck.source}
        </a>
      </div>

      {factCheck.moderatorNote && (
        <div className="mt-4 p-4 bg-white bg-opacity-50 rounded">
          <div className="font-medium text-2xl mb-2">Moderator note:</div>
          <p className="fact-check-text text-gray-800">{factCheck.moderatorNote}</p>
          {factCheck.moderatorSourceLink && (
            <div className="mt-2">
              <a 
                href={factCheck.moderatorSourceLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline text-xl"
              >
                Source
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}