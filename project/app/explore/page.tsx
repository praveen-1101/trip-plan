'use client';

import { useSession } from 'next-auth/react';
import { ExploreContainer } from '@/components/explore/explore-container';

export default function ExplorePage() {
  const { data: session } = useSession();

  return (
    <ExploreContainer />
  );
}