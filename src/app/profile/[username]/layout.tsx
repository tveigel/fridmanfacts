"use client";

import React, { Suspense } from 'react';

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<ProfileSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
}