"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseConfig';
import { ChevronRight, ChevronLeft, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { MESSAGES } from '../lib/utils/constants';
import FlagIcon from '../components/fact-checks/FlagIcon';
import MainPageLayout from '../components/MainPageLayout';

const GRID_ROWS = 2;
const GRID_COLS = 3;
const EPISODES_PER_PAGE = GRID_ROWS * GRID_COLS;
const EPISODES_TO_FETCH = EPISODES_PER_PAGE * 2; // Fetch two pages worth for smooth transition

// Modified to prioritize episode number for equal scores
const calculateTrendingScore = (episode) => {
  const factChecks = episode.factChecks || [];
  let score = 0;
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  factChecks.forEach(check => {
    const checkDate = check.createdAt?.toDate?.() || new Date(check.createdAt);
    const daysAgo = Math.max(1, (now - checkDate) / dayInMs);
    let interactionScore = 1;
    interactionScore += (check.upvotes || 0) * 0.5;
    interactionScore += (check.downvotes || 0) * 0.3;
    score += interactionScore / Math.sqrt(daysAgo);
  });
  
  return score;
};

const TrendingEpisodeCard = ({ episode }) => {
  const stats = episode.factChecks?.reduce((acc, check) => {
    const status = check.moderatorValidation || check.status || 'UNVALIDATED';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Link
      href={`/episode/${episode.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {episode.thumbnail && (
        <div className="relative w-full pt-[56.25%]">
          <Image
            src={episode.thumbnail}
            alt={episode.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {episode.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Guest: {episode.guest}
        </p>
        <div className="mt-auto space-y-4">
          <div className="text-sm text-gray-500">
            Episode #{episode.episodeNumber}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats || {}).map(([status, count]) => count > 0 && (
              <div key={status} 
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                  status === 'VALIDATED_TRUE' ? 'bg-green-50 text-green-700' :
                  status === 'VALIDATED_FALSE' ? 'bg-red-50 text-red-700' :
                  status === 'VALIDATED_CONTROVERSIAL' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-50 text-gray-700'
                }`}
              >
                <FlagIcon status={status} size={14} />
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

const RecentEpisodeCard = ({ episode }) => (
  <Link
    href={`/episode/${episode.id}`}
    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 flex gap-6"
  >
    {episode.thumbnail && (
      <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-md relative">
        <Image
          src={episode.thumbnail}
          alt={episode.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    )}
    <div className="flex-1">
      <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
        {episode.title}
      </h3>
      <p className="text-gray-600 mb-4">
        Guest: {episode.guest}
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Episode #{episode.episodeNumber}</span>
        <span>•</span>
        <span>{episode.factChecks?.length || 0} fact checks</span>
      </div>
    </div>
    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight className="w-6 h-6 text-blue-600" />
    </div>
  </Link>
);

const NavigationButton = ({ direction, onClick, disabled }) => {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 md:p-3 rounded-full bg-white text-gray-900 shadow-lg 
        hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed 
        transition-all duration-200 z-10 focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-2
      `}
      aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} episodes`}
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default function Home() {
  const [trendingEpisodes, setTrendingEpisodes] = useState([]);
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        // Initial fetch with limit
        const episodesQuery = query(
          collection(db, "episodes"),
          orderBy("episodeNumber", "desc"),
          limit(EPISODES_TO_FETCH)
        );
        
        const episodesSnapshot = await getDocs(episodesQuery);
        let episodesWithFactChecks = [];

        // Fetch fact checks in parallel for better performance
        const factCheckPromises = episodesSnapshot.docs.map(async (episodeDoc) => {
          const episodeData = episodeDoc.data();
          const episodeId = episodeDoc.id;

          const factChecksQuery = query(
            collection(db, "factChecks"),
            where("episodeId", "==", episodeId)
          );
          const factChecksSnapshot = await getDocs(factChecksQuery);
          const factChecks = factChecksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          return {
            id: episodeId,
            ...episodeData,
            factChecks,
            trendingScore: 0 // Will be calculated after all data is fetched
          };
        });

        episodesWithFactChecks = await Promise.all(factCheckPromises);

        // Calculate trending scores and sort
        episodesWithFactChecks.forEach(episode => {
          episode.trendingScore = calculateTrendingScore(episode);
        });

        const sortedByTrending = [...episodesWithFactChecks].sort((a, b) => {
          if (a.trendingScore === b.trendingScore) {
            // Use episode number for secondary sorting
            return b.episodeNumber - a.episodeNumber;
          }
          return b.trendingScore - a.trendingScore;
        });

        const sortedByEpisodeNumber = [...episodesWithFactChecks].sort((a, b) => 
          b.episodeNumber - a.episodeNumber
        );

        setTrendingEpisodes(sortedByTrending);
        setRecentEpisodes(sortedByEpisodeNumber);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const totalPages = Math.ceil(trendingEpisodes.length / EPISODES_PER_PAGE);

  const handleNavigation = (direction) => {
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, totalPages - 1)
      : Math.max(0, currentPage - 1);
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <MainPageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-black text-white px-6 py-3 rounded-lg shadow-lg">
            {MESSAGES.LOADING}
          </div>
        </div>
      </MainPageLayout>
    );
  }

  if (error) {
    return (
      <MainPageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg shadow-lg border border-red-200">
            Error loading episodes: {error}
          </div>
        </div>
      </MainPageLayout>
    );
  }

  return (
    <MainPageLayout>
      <div className="space-y-8 md:space-y-16 max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Trending Episodes Section */}
        <section>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-2 md:p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trending Episodes</h2>
            </div>
          </div>

          <div className="relative px-8 md:px-12">
            <div className="absolute left-0 top-0 bottom-0 flex items-center">
              <NavigationButton
                direction="prev"
                onClick={() => handleNavigation('prev')}
                disabled={currentPage === 0}
              />
            </div>
            
            <div className="absolute right-0 top-0 bottom-0 flex items-center">
              <NavigationButton
                direction="next"
                onClick={() => handleNavigation('next')}
                disabled={currentPage >= totalPages - 1}
              />
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
                {trendingEpisodes
                  .slice(currentPage * EPISODES_PER_PAGE, (currentPage + 1) * EPISODES_PER_PAGE)
                  .map((episode) => (
                    <TrendingEpisodeCard key={episode.id} episode={episode} />
                  ))}
              </div>
            </div>

            <div className="flex justify-center mt-6 md:mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleNavigation(index > currentPage ? 'next' : 'prev');
                    setCurrentPage(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentPage === index
                      ? 'w-8 bg-black'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Recent Episodes Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-black text-white p-2.5 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Episodes</h2>
          </div>
          <div className="space-y-4">
            {recentEpisodes.slice(0, 5).map((episode) => (
              <RecentEpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        </section>
      </div>
    </MainPageLayout>
  );
}