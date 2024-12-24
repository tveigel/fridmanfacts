"use client";

import EpisodeHeader from '../../../components/episodes/EpisodeHeader';
import TableOfContents from '../../../components/episodes/TableOfContents';
import Transcript from '../../../components/transcript/Transcript';

interface EpisodeData {
  id: string;
  thumbnail: string;
  title: string;
  guest: string;
  date: string;
  video_link: string;
  timestamps: any[];
  transcript: any[];
  factChecks: Record<string, any[]>;
}

interface EpisodeContentProps {
  episodeData: EpisodeData;
  selectedFactCheckId?: string;
}

export default function EpisodeContent({ 
  episodeData, 
  selectedFactCheckId 
}: EpisodeContentProps) {
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