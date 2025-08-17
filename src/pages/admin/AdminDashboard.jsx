
import React from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import AllUsers from "./AllUsers";
import AllCourts from "./AllCourts";
import AllBookings from "./AllBookings";
import CourtPayments from "./CourtPayments";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen bg-gray-100 mt-23">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004030]  text-white p-6 shadow-lg">
        <h1 className="text-3xl font-extrabold mb-10 text-center text-[#DCD0A8]">
          Admin Panel
        </h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Link
                to="/admin/users"
                className="block text-lg py-2 px-4 rounded hover:bg-[#4A9782] hover:text-[#004030]"
              >
                All Users
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/admin/courts"
                className="block text-lg py-2 px-4 rounded hover:bg-[#4A9782] hover:text-[#004030]"
              >
                Court Approvals
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/admin/bookings"
                className="block text-lg py-2 px-4 rounded hover:bg-[#4A9782] hover:text-[#004030]"
              >
                All Bookings
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/admin/payments" className="block text-lg py-2 px-4 rounded hover:bg-[#4A9782] hover:text-[#004030]">
                Court Payments
              </Link>


            </li>
            <li className="mt-8">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </li>

          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-100 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
          <Routes>
            <Route
              path="/"
              element={
                <div className="text-center py-10">
                  <h2 className="text-3xl font-bold mb-4 text-gray-700">
                    Welcome to Admin Dashboard!
                  </h2>
                  <p className="text-lg text-gray-600">
                    Use the sidebar to manage users, courts, and bookings.
                  </p>
                </div>
              }
            />
            <Route path="users" element={<AllUsers token={token} />} />
            <Route path="courts" element={<AllCourts token={token} />} />
            <Route path="bookings" element={<AllBookings token={token} />} />
            <Route path="payments" element={<CourtPayments token={token} />} />
          </Routes>
        </div>
      </main>
    </div>
    </>
  );
}
