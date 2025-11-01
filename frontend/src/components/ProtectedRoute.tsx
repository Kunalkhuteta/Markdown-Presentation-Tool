import { useSelector  } from "react-redux";
import {  Navigate } from "react-router-dom";
import type { RootState } from "../app/store";
import { Outlet } from "react-router-dom";

export default function ProtectedRoute() {
const { isLoggedIn, isEmailVerified, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}