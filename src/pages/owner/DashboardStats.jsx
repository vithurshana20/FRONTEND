// // src/pages/owner/DashboardStats.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Building2, Calendar, DollarSign, Star } from "lucide-react";
// import OwnerNavbar from "../owner/ownerNavbar";

// export default function DashboardStats() {
//   const [courts, setCourts] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [owner, setOwner] = useState(null);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchData = async () => {
//       const headers = { Authorization: `Bearer ${token}` };
//       const [courtRes, bookingRes, ownerRes] = await Promise.all([
//         axios.get("/api/courts/my-courts", { headers }),
//         axios.get("/api/bookings/court-bookings", { headers }),
//         axios.get("/api/auth/profile", { headers })
//       ]);
//       setCourts(courtRes.data);
//       setBookings(bookingRes.data);
//       setOwner(ownerRes.data);
//     };
//     fetchData();
//   }, []);

//   const today = new Date().toISOString().split('T')[0];
//   const todayBookings = bookings.filter(b => b.bookingDate === today);
//   const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
//   const avgRating = courts.length > 0 ? (courts.reduce((sum, c) => sum + (c.rating || 0), 0) / courts.length).toFixed(1) : 0;

//   return (
//     <div className="p-6">
//       <OwnerNavbar />
//       <h1 className="text-2xl font-bold mb-4">Welcome {owner?.name || 'Owner'}!</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//         <StatCard icon={<Building2 />} label="Total Courts" value={courts.length} />
//         <StatCard icon={<Calendar />} label="Total Bookings" value={bookings.length} />
//         <StatCard icon={<DollarSign />} label="Revenue" value={`₹${totalRevenue}`} />
//         <StatCard icon={<Star />} label="Avg Rating" value={avgRating} />
//       </div>
//       <h2 className="text-xl font-semibold mt-10 mb-2">Today’s Bookings ({todayBookings.length})</h2>
//       {/* Show recent bookings table here... */}
//     </div>
//   );
// }

// function StatCard({ icon, label, value }) {
//   return (
//     <div className="bg-white p-4 rounded-xl shadow flex flex-col">
//       <div className="text-gray-700 text-sm flex items-center gap-2">
//         {icon}
//         <span>{label}</span>
//       </div>
//       <div className="text-xl font-bold">{value}</div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Calendar, DollarSign, Star } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OwnerNavbar from "./OwnerNavbar.jsx";

export default function DashboardStats() {
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Normalizes a date string to YYYY-MM-DD format
  const normalizeDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Normalizes a time string to HH:MM format
  const normalizeTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [courtRes, bookingRes, ownerRes] = await Promise.all([
          axios.get("/api/courts/my-courts", { headers }),
          axios.get("/api/bookings/court-bookings", { headers }),
          axios.get("/api/auth/profile", { headers }),
        ]);

        const courtsData = courtRes.data;
        setCourts(courtsData);
        setOwner(ownerRes.data);

        // Filter bookings to include only those for the owner's courts
        const ownerCourtIds = courtsData.map((c) => c._id);
        const filteredBookings = bookingRes.data
          .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
          .map((b) => ({
            ...b,
            bookingDate: normalizeDate(b.bookingDate),
            start: normalizeTime(b.start || b.startTime),
            end: normalizeTime(b.end || b.endTime),
          }))
          .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

        setBookings(filteredBookings);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error(error.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Calculate today's bookings
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.bookingDate === today);

  // Calculate total revenue
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || b.pricePerHour || 0), 0);

  // Calculate average rating
  const avgRating =
    courts.length > 0
      ? (courts.reduce((sum, c) => sum + (c.rating || 0), 0) / courts.length).toFixed(1)
      : 0;

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <OwnerNavbar />
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] mt-19">  
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#004030] text-[#FFF9E5] p-6 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {owner?.name || "Owner"}! 🏢</h1>
          <p className="text-lg mt-1 text-[#DCD0A8]">Manage your courts and track your business</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 ">
          <StatCard icon={<Building2 size={18} className="text-gray-600" />} label="Total Courts" value={courts.length} />
          <StatCard icon={<Calendar size={18} className="text-gray-600" />} label="Total Bookings" value={bookings.length} />
          <StatCard icon={<DollarSign size={18} className="text-gray-600" />} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
          {/* <StatCard icon={<Star size={18} className="text-yellow-500" />} label="Avg Rating" value={avgRating} /> */}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#004030]">Today’s Bookings ({todayBookings.length})</h2>
            <span className="text-sm bg-[#004030] text-white px-3 py-1 rounded-full">
              {todayBookings.length} bookings Today
            </span>
          </div>

          {todayBookings.length === 0 ? (
            <p className="text-gray-500 text-center">No bookings today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-3">Player</th>
                    <th className="py-2 px-3">Court</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Slot</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map((b) => (
                    <tr key={b._id} className="border-b">
                      <td className="py-2 px-3">
                        {b.player?.name}
                        <div className="text-xs text-gray-500">{b.player?.phone}</div>
                      </td>
                      <td className="py-2 px-3">{b.court?.name}</td>
                      <td className="py-2 px-3">{b.bookingDate}</td>
                      <td className="py-2 px-3">
                        {b.start} - {b.end}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            b.status === "booked" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
    </>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-gray-600 mt-1">
        {icon}
        <span className="ml-2">{label}</span>
      </div>
    </div>
  );
}