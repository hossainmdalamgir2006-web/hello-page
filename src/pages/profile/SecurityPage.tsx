import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function SecurityPage() {
  const location = useLocation();
  const basePath = location.pathname.match(/^\/(admin|manager|support)\/profile\/security/)?.[0];
  
  if (basePath && (location.pathname === basePath || location.pathname === `${basePath}/`)) {
    return <Navigate to={`${basePath}/2fa`} replace />;
  }

  return <Outlet />;
}
