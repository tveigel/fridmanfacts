// src/app/episode/[id]/page.tsx
import { episodeService } from '../../../lib/services/episodeService';
import EpisodeContent from './EpisodeContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReadonlyURLSearchParams } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ selectedFactCheck?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const episodeData = await episodeService.getEpisodeById(resolvedParams.id);
  
  if (!episodeData) {
    return {
      title: 'Episode Not Found',
    };
  }

  return {
    title: episodeData.title || 'Episode',
    description: `Guest: ${episodeData.guest || 'Unknown'}`,
  };
}

export default async function Page(props: PageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  try {
    const episodeData = await episodeService.getEpisodeById(resolvedParams.id);
    
    if (!episodeData) {
      notFound();
    }

    return (
      <EpisodeContent 
        episodeData={episodeData}
        selectedFactCheckId={resolvedSearchParams.selectedFactCheck}
      />
    );
  } catch (error) {
    console.error('Error loading episode data:', error);
    throw error;
  }
}