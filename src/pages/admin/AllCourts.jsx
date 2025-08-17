
/// src/components/admin/AllCourts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AllCourts({ token }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/courts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourts(res.data);
      } catch (err) {
        console.error("Failed to fetch courts", err);
        setError("Failed to load courts.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourts();
    } else {
      setError("Unauthorized. Please log in as admin.");
      setLoading(false);
    }
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/courts/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourts((prev) =>
        prev.map((court) =>
          court._id === id ? { ...court, isApproved: true } : court
        )
      );
      alert("Court approved and email sent to court owner.");
    } catch (err) {
      console.error("Approve failed:", err);
      alert(" Failed to approve court.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/courts/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourts((prev) =>
        prev.map((court) =>
          court._id === id ? { ...court, isApproved: false } : court
        )
      );
      alert("Court rejected and email sent to court owner.");
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject court.");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(courts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourts = courts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading All Courts...</p>
        </div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Court Approvals</h2>
      {courts.length === 0 ? (
        <p className="text-gray-600">No courts found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#4A9782]">
                  <th className="p-3 border border-gray-300 text-[#004030]">Court Name</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Location</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Owner</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Status</th>
                  <th className="p-3 border border-gray-300 text-[#004030]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourts.map((court) => (
                  <tr key={court._id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">{court.name}</td>
                    <td className="p-3 border border-gray-300">{court.location}</td>
                    <td className="p-3 border border-gray-300">{court.owner?.name || "N/A"}</td>
                    <td className="p-3 border border-gray-300">
                      {court.isApproved ? (
                        <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-bold">
                          Approved
                        </span>
                      ) : (
                        <span className="bg-[#DCD0A8] text-orange-800 py-1 px-3 rounded-full text-xs font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
                      {court.isApproved ? (
                        <button
                          onClick={() => handleReject(court._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(court._id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
