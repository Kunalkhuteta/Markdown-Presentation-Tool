import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import type { RootState } from "../app/store";

export default function GuestRoute() {
  const { isLoggedIn, isEmailVerified, loading } = useSelector(
      (state: RootState) => state.auth
    );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoggedIn && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{<Outlet />}</>;
}
