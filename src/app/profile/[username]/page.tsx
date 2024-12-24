// src/app/profile/[username]/page.tsx
import type { Metadata } from 'next';
import UserProfile from '@/components/profile/UserProfile';

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  return [
    { username: 'defaultuser' }
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Profile - ${username}`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <UserProfile username={username} />;
}