import React, { useEffect, useState } from "react";
import axios from "axios";
import AddCourtForm from "../components/AddCourtForm.jsx";

export default function OwnerDashboard() {
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch courts owned by this user
        const courtRes = await axios.get("/api/courts/my-courts", { headers });
        setCourts(courtRes.data);

        // Fetch all bookings
        const bookingRes = await axios.get("/api/bookings/court-bookings", { headers });

        // Filter bookings for this owner's courts
        const ownerCourtIds = courtRes.data.map((c) => c._id);
        // const myBookings = bookingRes.data.filter((b) =>
        //   ownerCourtIds.includes(b.court._id)
        // );
const myBookings = bookingRes.data
  .filter((b) => ownerCourtIds.includes(b.court._id))
  .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)); // ascending

        setBookings(myBookings);
      } catch (err) {
        console.error("Error loading owner dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <p className="text-center text-gray-600 mt-12 text-lg">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 bg-[#f3f4f6] min-h-screen">
      <h1 className="text-3xl font-bold text-[#00332e] mb-8 text-center">
        🏟️ Court Owner Dashboard
      </h1>

      {/* Court Bookings Section */}
      <section className="bg-white p-6 rounded-2xl shadow-md mb-10">
        <h2 className="text-2xl font-semibold text-[#00332e] mb-4">
          📅 Your Court Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-[#00332e] text-white text-sm">
                <tr>
                  <th className="p-3 text-left">Court</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{b.court.name}</td>
                    <td className="p-3">{b.player?.name || "N/A"}</td>
                    <td className="p-3">{b.bookingDate}</td>
                    <td className="p-3">{b.start} - {b.end}</td>
                    <td className="p-3 capitalize text-green-700 font-medium">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Courts Section */}
      <section className="bg-white p-6 rounded-2xl shadow-md mb-10">
        <h2 className="text-2xl font-semibold text-[#00332e] mb-4">
          🎾 Your Courts ({courts.length})
        </h2>

        {courts.length === 0 ? (
          <p className="text-gray-500 text-center">You have not added any courts yet.</p>
        ) : (
          <ul className="space-y-3">
            {courts.map((court) => (
              <li
                key={court._id}
                className="flex justify-between items-center border rounded p-3"
              >
                <div>
                  <span className="text-[#00332e] font-medium">{court.name}</span>
                  <span className="text-gray-600 ml-2">({court.location})</span>
                </div>
                <div>
                  {court.isApproved === true && (
                    <span className="text-green-600 font-semibold">Approved</span>
                  )}
                  {court.isApproved === false && (
                    <span className="text-red-600 font-semibold">Pending</span>
                  )}
                  {/* {court.isApproved === undefined && (
                    <span className="text-yellow-600 font-semibold">Pending</span>
                  )} */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Court Form */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-[#00332e] mb-4">
          ➕ Add New Court
        </h2>
        <AddCourtForm />
      </section>
    </div>
  );
}
