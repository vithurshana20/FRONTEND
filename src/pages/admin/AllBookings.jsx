
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AllBookings({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/bookings/court-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
        setError("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    } else {
      setError("Unauthorized. Please log in as admin.");
      setLoading(false);
    }
  }, [token]);

  // Pagination logic
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading All Bookings...</p>
        </div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">All Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#4A9782]">
                <th className="p-3 border border-gray-300 text-[#004030]">Court Name</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Location</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Player Name</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Player Email</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Booking Date</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Start Time</th>
                <th className="p-3 border border-gray-300 text-[#004030]">End Time</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-3 border border-gray-300">{booking.court?.name || "N/A"}</td>
                  <td className="p-3 border border-gray-300">{booking.court?.location || "N/A"}</td>
                  <td className="p-3 border border-gray-300">{booking.player?.name || "N/A"}</td>
                  <td className="p-3 border border-gray-300">{booking.player?.email || "N/A"}</td>
                  <td className="p-3 border border-gray-300">{booking.bookingDate}</td>
                  <td className="p-3 border border-gray-300">{booking.start}</td>
                  <td className="p-3 border border-gray-300">{booking.end}</td>
                  <td className="p-3 border border-gray-300 capitalize">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? "bg-[#004030] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
