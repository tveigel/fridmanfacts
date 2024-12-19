// src/components/episodes/TableOfContents.js
import { Clock, Flag, ThumbsUp, ThumbsDown } from 'lucide-react';
import FlagIcon from '../fact-checks/FlagIcon';

const formatTimeForComparison = (time) => {
  let cleanTime = time.replace(/[()]/g, '').trim();
  const parts = cleanTime.split(':').map(part => part.padStart(2, '0'));
  while (parts.length < 3) {
    parts.unshift('00');
  }
  return parts.join(':');
};

const isTimeBetween = (time, start, end) => {
  const timeSeconds = timeToSeconds(time);
  const startSeconds = timeToSeconds(start);
  const endSeconds = end ? timeToSeconds(end) : Infinity;
  return timeSeconds >= startSeconds && timeSeconds < endSeconds;
};

const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = formatTimeForComparison(time)
    .split(':')
    .map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

export default function TableOfContents({ timestamps, transcript, factChecks }) {
  const calculateStatsForChapter = (startTime, endTime) => {
    const stats = {
      total: 0,
      upvotes: 0,
      downvotes: 0,
      UNVALIDATED: 0,
      VALIDATED_TRUE: 0,
      VALIDATED_FALSE: 0,
      VALIDATED_CONTROVERSIAL: 0,
    };

    if (!factChecks) return stats;
    
    const factCheckEntries = Object.entries(factChecks);
    
    factCheckEntries.forEach(([time, checks]) => {
      const formattedTime = formatTimeForComparison(time);
      const formattedStart = formatTimeForComparison(startTime);
      const formattedEnd = endTime ? formatTimeForComparison(endTime) : null;

      if (isTimeBetween(formattedTime, formattedStart, formattedEnd)) {
        checks.forEach(check => {
          stats.total++;
          stats.upvotes += check.upvotes || 0;
          stats.downvotes += check.downvotes || 0;
          const status = check.moderatorValidation || check.status || 'UNVALIDATED';
          stats[status]++;
        });
      }
    });

    return stats;
  };

  const matchTranscriptTime = (timestamp) => {
    const formattedTimestamp = formatTimeForComparison(timestamp);
    const entry = transcript.find(entry => 
      formatTimeForComparison(entry.time) === formattedTimestamp
    );
    return entry ? entry.time : timestamp;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Table of Contents</h2>
      
      <div className="space-y-6">
        {timestamps.map((timestamp, index) => {
          const nextTimestamp = timestamps[index + 1];
          const chapterStats = calculateStatsForChapter(
            timestamp.time,
            nextTimestamp?.time
          );
          
          const matchingTime = matchTranscriptTime(timestamp.time);
          const sanitizedTime = matchingTime.replace(/[:()]/g, "");

          return (
            <div
              key={index}
              className="group hover:bg-gray-50 rounded-lg transition-colors duration-200 p-6"
            >
              <a
                href={`#transcript-${sanitizedTime}`}
                className="block"
              >
                <div className="flex items-center gap-6">
                  {/* Time */}
                  <div className="flex items-center text-gray-500 flex-shrink-0">
                    <Clock size={24} className="mr-3" />
                    <span className="font-mono text-xl font-bold">{timestamp.time}</span>
                  </div>

                  {/* Chapter title and stats in a row */}
                  <div className="flex flex-grow items-center justify-between min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {timestamp.chapter}
                    </h3>

                    {/* Enhanced stats */}
                    {chapterStats.total > 0 && (
                      <div className="flex items-center gap-6 flex-shrink-0 ml-6">
                        {/* Total fact checks - now more prominent */}
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
                          <Flag size={24} className="text-blue-600" />
                          <span className="text-xl font-bold text-blue-700">
                            {chapterStats.total}
                          </span>
                        </div>

                        {/* Vote stats - larger and more visible */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <ThumbsUp size={24} className="text-green-600" />
                            <span className="text-xl font-bold text-green-700">
                              {chapterStats.upvotes}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsDown size={24} className="text-red-600" />
                            <span className="text-xl font-bold text-red-700">
                              {chapterStats.downvotes}
                            </span>
                          </div>
                        </div>

                        {/* Status flags - now with pills for better visibility */}
                        <div className="flex items-center gap-3">
                          {Object.entries({
                            VALIDATED_TRUE: { color: 'green', label: 'Valid' },
                            VALIDATED_FALSE: { color: 'red', label: 'False' },
                            VALIDATED_CONTROVERSIAL: { color: 'yellow', label: 'Disputed' }
                          }).map(([status, { color, label }]) => (
                            chapterStats[status] > 0 && (
                              <div 
                                key={status} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-full 
                                bg-${color}-50 text-${color}-700`}
                              >
                                <FlagIcon status={status} size={24} />
                                <span className="text-lg font-bold">
                                  {chapterStats[status]} {label}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
  }