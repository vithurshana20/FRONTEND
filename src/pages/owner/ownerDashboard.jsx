import React from "react";
import { Outlet } from "react-router-dom";
import OwnerNavbar from "../owner/OwnerNavbar.jsx";

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
