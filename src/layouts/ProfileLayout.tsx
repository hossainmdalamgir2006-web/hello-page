import { Outlet, Navigate, useLocation } from "react-router-dom";

export default function ProfileLayout() {
  const location = useLocation();
  const basePath = location.pathname.match(/^\/(admin|manager|support)\/profile/)?.[0] || "/admin/profile";

  if (location.pathname === basePath || location.pathname === `${basePath}/`) {
    return <Navigate to={`${basePath}/personal`} replace />;
  }

  return <Outlet />;
}
