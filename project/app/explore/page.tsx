'use client';

import { useSession } from 'next-auth/react';
import { ExploreContainer } from '@/components/explore/explore-container';
import { Suspense } from 'react';

export default function ExplorePage() {
  const { data: session } = useSession();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContainer />
    </Suspense>
  );
}