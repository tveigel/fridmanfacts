// src/app/episode/[id]/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/firebaseConfig';
import EpisodeHeader from '../../../components/episodes/EpisodeHeader';
import TableOfContents from '../../../components/episodes/TableOfContents';
import Transcript from '../../../components/transcript/Transcript';
import { factCheckService } from '../../../lib/services';

type PageProps = {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  const { id } = params;
  const searchParams = useSearchParams();
  const selectedFactCheckId = searchParams.get('selectedFactCheck');
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const docRef = doc(db, 'episodes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const factChecks = await factCheckService.getFactChecksForEpisode(id);
          const organizedFactChecks = factCheckService.organizeFactChecksByTime(factChecks);
          setEpisodeData({ 
            id, 
            ...docSnap.data(), 
            factChecks: organizedFactChecks 
          });
        } else {
          throw new Error("No such document!");
        }
      } catch (error) {
        console.error('Error loading episode data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!episodeData) return <div className="p-4 text-center">Episode not found</div>;

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
      <Transcript 
        transcript={episodeData.transcript} 
        timestamps={episodeData.timestamps || []}
        episodeId={episodeData.id}
        initialSelectedFactCheckId={selectedFactCheckId}
      />
    </div>
  );
}