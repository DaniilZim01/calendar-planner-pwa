import { ReactNode, useMemo } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useIsAuthenticated } from '@/lib/hooks';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthed = useIsAuthenticated();
  const [location] = useLocation();
  const onAuthPage = location === '/auth';
  const shouldRedirect = useMemo(() => !isAuthed && !onAuthPage, [isAuthed, onAuthPage]);
  if (shouldRedirect) {
    return <Redirect to="/auth" state={{ from: location }} /> as any;
  }
  return <>{children}</>;
}



