import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function SessionsPage() {
  const location = useLocation();
  const basePath = location.pathname.match(/^\/(admin|manager|support)\/profile\/sessions/)?.[0];
  
  if (basePath && (location.pathname === basePath || location.pathname === `${basePath}/`)) {
    return <Navigate to={`${basePath}/active`} replace />;
  }

  return <Outlet />;
}
