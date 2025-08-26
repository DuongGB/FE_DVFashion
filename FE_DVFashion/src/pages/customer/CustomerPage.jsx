import React from "react";
import { useAuth } from "../hooks/useAuth";

const CustomerPage = () => {
  const { user } = useAuth();
  console.log("CustomerPage user:", user);
  return <div>CustomerPage {user?.email}</div>;
};

export default CustomerPage;
