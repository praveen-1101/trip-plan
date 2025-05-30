import { ExploreContainer } from '@/components/explore/explore-container';
import { Suspense } from 'react';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContainer />
    </Suspense>
  );
}