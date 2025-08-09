import { ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useIsAuthenticated } from '@/lib/hooks';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthed = useIsAuthenticated();
  const [location] = useLocation();
  if (!isAuthed) {
    return <Redirect to="/auth" state={{ from: location }} /> as any;
  }
  return <>{children}</>;
}



