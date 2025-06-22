'use client';

import ComingSoonPage from '@/app/(container)/coming-soon/page';
import Loading from '@/components/Loading';

export default function LoadingScreen() {
  return (
    <Loading>
      <ComingSoonPage />
    </Loading>
  );
}
