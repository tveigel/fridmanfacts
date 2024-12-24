// src/app/episode/[id]/EpisodeContent.tsx

"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EpisodeHeader from '../../../components/episodes/EpisodeHeader';
import TableOfContents from '../../../components/episodes/TableOfContents';
import Transcript from '../../../components/transcript/Transcript';
import type { FactCheck } from '../../../lib/types/types';

interface EpisodeData {
  id: string;
  thumbnail: string;
  title: string;
  guest: string;
  date: string;
  video_link: string;
  timestamps: any[];
  transcript: any[];
  factChecks: Record<string, FactCheck[]>;
}

interface EpisodeContentProps {
  episodeData: EpisodeData;
}

function TranscriptLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

function TranscriptSection({ episodeData }: { episodeData: EpisodeData }) {
  const searchParams = useSearchParams();
  const selectedFactCheckId = searchParams.get('factCheck');

  return (
    <Transcript 
      transcript={episodeData.transcript} 
      timestamps={episodeData.timestamps || []}
      episodeId={episodeData.id}
      initialSelectedFactCheckId={selectedFactCheckId || undefined}
    />
  );
}

export default function EpisodeContent({ episodeData }: EpisodeContentProps) {
  return (
    <div className="p-4">
      <EpisodeHeader
        thumbnail={episodeData.thumbnail}
        title={episodeData.title}
        guest={episodeData.guest}
        date={episodeData.date}
        videoLink={episodeData.video_link}
      />
      <TableOfContents
        timestamps={episodeData.timestamps}
        transcript={episodeData.transcript}
        factChecks={episodeData.factChecks}
      />
      <Suspense fallback={<TranscriptLoading />}>
        <TranscriptSection episodeData={episodeData} />
      </Suspense>
    </div>
  );
}