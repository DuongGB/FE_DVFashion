import React from "react";
import { useAuth } from "../../hooks/useAuth";

const StaffPage = () => {
  const { user } = useAuth();
  return <div>StaffPage {user?.email}</div>;
};

export default StaffPage;
