"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseConfig';
import { ChevronRight, ChevronLeft, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { MESSAGES } from '../lib/utils/constants';
import FlagIcon from '../components/fact-checks/FlagIcon';
import MainPagePanels from '../components/MainPagePanels';
import MainPageLayout from '../components/MainPageLayout';

// Calculate trending score based on recent activity
const calculateTrendingScore = (episode) => {
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;
  const factChecks = episode.factChecks || [];
  let score = 0;
  
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
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col transform hover:scale-[1.02]"
    >
      {episode.thumbnail && (
        <div className="w-full h-36 overflow-hidden rounded-t-xl relative">
          <Image
            src={episode.thumbnail}
            alt={episode.title}
            fill
            className="object-contain bg-black transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {episode.title}
        </h3>
        <p className="text-gray-600 mb-4">
          Guest: {episode.guest}
        </p>
        <div className="mt-auto">
          <div className="text-sm text-gray-500 mb-2">
            {new Date(episode.date).toLocaleDateString()}
          </div>
          <div className="flex flex-wrap gap-2">
            {stats?.VALIDATED_TRUE > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                <FlagIcon status="VALIDATED_TRUE" size={14} />
                <span>{stats.VALIDATED_TRUE}</span>
              </div>
            )}
            {stats?.VALIDATED_FALSE > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                <FlagIcon status="VALIDATED_FALSE" size={14} />
                <span>{stats.VALIDATED_FALSE}</span>
              </div>
            )}
            {stats?.VALIDATED_CONTROVERSIAL > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                <FlagIcon status="VALIDATED_CONTROVERSIAL" size={14} />
                <span>{stats.VALIDATED_CONTROVERSIAL}</span>
              </div>
            )}
            {stats?.UNVALIDATED > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">
                <FlagIcon status="UNVALIDATED" size={14} />
                <span>{stats.UNVALIDATED}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const RecentEpisodeCard = ({ episode }) => (
  <Link
    href={`/episode/${episode.id}`}
    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 flex gap-6 transform hover:scale-[1.01]"
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
        <span>{new Date(episode.date).toLocaleDateString()}</span>
        <span>•</span>
        <span>{episode.factChecks?.length || 0} fact checks</span>
      </div>
    </div>
    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight className="w-6 h-6 text-blue-600" />
    </div>
  </Link>
);

const SectionHeader = ({ icon: Icon, title, actionText, onAction }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <div className="bg-black text-white p-2 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {actionText && (
      <button
        onClick={onAction}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
      >
        {actionText}
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </button>
    )}
  </div>
);

export default function Home() {
  const [trendingEpisodes, setTrendingEpisodes] = useState([]);
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const episodesPerPage = 5; // Show 4 episodes per row * 2 rows

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const episodesSnapshot = await getDocs(collection(db, "episodes"));
        let allEpisodes = [];

        for (const episodeDoc of episodesSnapshot.docs) {
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

          allEpisodes.push({
            id: episodeId,
            ...episodeData,
            factChecks
          });
        }

        const trendingEpisodes = [...allEpisodes]
          .sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));

        const recentEpisodes = [...allEpisodes]
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTrendingEpisodes(trendingEpisodes);
        setRecentEpisodes(recentEpisodes);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const handlePrevious = () => {
    if (isAnimating || currentTrendingIndex === 0) return;
    setIsAnimating(true);
    setCurrentTrendingIndex(current => Math.max(0, current - episodesPerPage));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating || currentTrendingIndex >= trendingEpisodes.length - episodesPerPage) return;
    setIsAnimating(true);
    setCurrentTrendingIndex(current => 
      Math.min(current + episodesPerPage, Math.max(0, trendingEpisodes.length - episodesPerPage))
    );
    setTimeout(() => setIsAnimating(false), 500);
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

  const pageCount = Math.ceil(trendingEpisodes.length / episodesPerPage);
  const currentPage = Math.floor(currentTrendingIndex / episodesPerPage);
  const displayedTrendingEpisodes = trendingEpisodes.slice(
    currentTrendingIndex,
    currentTrendingIndex + episodesPerPage
  );

  return (
    <MainPageLayout>
      <div className="space-y-16">
        {/* Trending Episodes Section */}
        <section>
          <SectionHeader 
            icon={TrendingUp}
            title="Trending Episodes"
          />
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={handlePrevious}
                disabled={currentTrendingIndex === 0 || isAnimating}
                className="p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous episodes"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={handleNext}
                disabled={currentTrendingIndex >= trendingEpisodes.length - episodesPerPage || isAnimating}
                className="p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Next episodes"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Episodes Grid */}
            <div className="overflow-hidden px-2">
              <div 
                className="grid grid-cols-4 gap-4 transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${(currentPage * 100)}%)`,
                  width: `${pageCount * 100}%`
                }}
              >
                {displayedTrendingEpisodes.map((episode) => (
                  <TrendingEpisodeCard key={episode.id} episode={episode} />
                ))}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentTrendingIndex(index * episodesPerPage);
                      setTimeout(() => setIsAnimating(false), 500);
                    }
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
          <SectionHeader 
            icon={Clock}
            title="Recent Episodes"
          />
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