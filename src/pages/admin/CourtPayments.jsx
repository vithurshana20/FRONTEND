


import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CourtPayments() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authorization token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/admin/courts", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.data && Array.isArray(response.data.courts)) {
          setCourts(response.data.courts);
        } else if (Array.isArray(response.data)) {
          setCourts(response.data);
        } else {
          console.warn("Unexpected response structure:", response.data);
          setError("Unexpected data format from server.");
        }
      } catch (err) {
        console.error("Error fetching court data:", err);
        if (err.response) {
          setError(`Failed to fetch courts: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          setError("No response from server. Please check your network or server status.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const totalPages = Math.ceil(courts.length / itemsPerPage);
  const paginatedCourts = courts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading Payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
        <p>Please check your network connection or try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Court Payment Status</h2>
      <div className="overflow-x-auto">
        {paginatedCourts.length === 0 ? (
          <p className="text-gray-600">No court data available at the moment.</p>
        ) : (
          <>
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#4A9782]">
                  <th className="p-3 border border-gray-300 text-[#004030]">Court Name</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Owner</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Location</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourts.map((court) => (
                  <tr key={court._id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">{court.name}</td>
                    <td className="p-3 border border-gray-300">{court.owner?.name || 'N/A'}</td>
                    <td className="p-3 border border-gray-300">{court.location || 'N/A'}</td>
                    <td className="p-3 border border-gray-300">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          court.subscriptionStatus === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {court.subscriptionStatus === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === index + 1
                      ? "bg-[#004030] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
