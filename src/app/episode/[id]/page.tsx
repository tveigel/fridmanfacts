// src/app/episode/[id]/page.tsx
import { episodeService } from '../../../lib/services/episodeService';
import EpisodeContent from './EpisodeContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const episodes = await episodeService.getAllEpisodes();
  return episodes;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const episodeData = await episodeService.getEpisodeById(id);
  
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

export default async function Page({ params }: PageProps) {
  try {
    const { id } = await params;
    const episodeData = await episodeService.getEpisodeById(id);

    if (!episodeData) {
      notFound();
    }

    return <EpisodeContent episodeData={episodeData} />;
  } catch (error) {
    console.error("Error loading episode data:", error);
    throw error;
  }
}