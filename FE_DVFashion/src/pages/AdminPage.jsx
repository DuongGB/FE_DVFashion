import React from "react";
import { useAuth } from "../hooks/useAuth";

const AdminPage = () => {
  const { user } = useAuth();
  return <div className="text-amber-700">AdminPage {user?.email}</div>;
};

export default AdminPage;
