import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { listChildren } from '../services/store.js';
import AppLoadingScreen from '../components/AppLoadingScreen.jsx';

const ChildApp = lazy(() => import('./ChildApp.jsx'));

export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function ChildBySlug() {
  const { childSlug } = useParams();
  const { user } = useAuth();
  const [childId, setChildId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user?.uid || !childSlug) return;
    const unsub = listChildren(user.uid, (list) => {
      const match = list.find(c => slugify(c.name) === childSlug);
      if (match) {
        setChildId(match.id);
      } else {
        setNotFound(true);
      }
    });
    return unsub;
  }, [user?.uid, childSlug]);

  if (notFound) return <Navigate to="/parent" replace />;
  if (!childId) return <AppLoadingScreen />;
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <ChildApp childIdOverride={childId} />
    </Suspense>
  );
}
