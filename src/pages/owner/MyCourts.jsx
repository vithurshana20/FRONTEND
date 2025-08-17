

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Eye, MapPin, Pencil, Star, X, Calendar } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AddCourtForm from "../../components/AddCourtForm"; // Assuming this path is correct
import OwnerNavbar from "./OwnerNavbar.jsx";
import "react-toastify/dist/ReactToastify.css";

// IMPORTANT: Configure your axios base URL if you don't have an 'api' interceptor
// This should match your backend server's address.
axios.defaults.baseURL = 'http://localhost:5000'; // Make sure this matches your backend URL

export default function MyCourts() {
  const [courts, setCourts] = useState([]);
  const [viewCourt, setViewCourt] = useState(null);
  const [editCourt, setEditCourt] = useState(null);
  const [bookingsForViewCourt, setBookingsForViewCourt] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookings, setBookings] = useState([]); // State to hold all relevant bookings (booked/blocked)
  const [loading, setLoading] = useState(true); // Added for initial data loading
  const [blockingSlot, setBlockingSlot] = useState(null); // Track which slot is being blocked
  const token = localStorage.getItem("token");

  // Helper function to generate default time slots (e.g., if no specific slots are configured)
  const generateFallbackTimeSlots = useCallback(() => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM (up to 21:00 slot ending at 22:00)
    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start, end, status: "available" });
    }
    return slots;
  }, []); // No dependencies, so can be memoized

  // Helper function to normalize date to YYYY-MM-DD
  const normalizeDate = useCallback((date) => {
    if (!date) return null;
    const d = new Date(date);
    // Ensure the date is parsed correctly, especially for different timezones
    return d.toISOString().split('T')[0];
  }, []);

  // Helper function to normalize time to HH:MM (e.g., "9:0" to "09:00")
  const normalizeTime = useCallback((time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }, []);

  // Consolidated function to fetch initial data (courts and all owner-related bookings/blocks)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch courts owned by the current user
      const courtRes = await axios.get("/api/courts/my-courts", { headers });
      setCourts(courtRes.data);

      // Fetch all bookings/blocks relevant to the user's courts
      // Assuming this endpoint gets all bookings (including 'blocked' ones if they are stored as bookings)
      // for courts owned by the user or relevant ones.
      const bookingRes = await axios.get("/api/bookings/court-bookings", { headers });

      const ownerCourtIds = courtRes.data.map((c) => c._id);
      // Filter for bookings/blocks related to the owner's courts and normalize data
      const myBookingsAndBlocks = bookingRes.data
        .filter((b) => ownerCourtIds.includes(b.court?._id) && (b.status === 'booked' || b.status === 'blocked'))
        .map((b) => ({
          ...b,
          bookingDate: normalizeDate(b.bookingDate),
          start: normalizeTime(b.start),
          end: normalizeTime(b.end)
        }))
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

      setBookings(myBookingsAndBlocks); // Store all relevant bookings and blocks
    } catch (err) {
      console.error("Error loading MyCourts data:", err);
      toast.error(err.response?.data?.message || "Failed to load courts and bookings.");
    } finally {
      setLoading(false);
    }
  }, [token, normalizeDate, normalizeTime]);

  // Fetch all initial data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch bookings specifically for the 'View' modal
  // useEffect(() => {
  //   if (viewCourt) {
  //     const fetchBookingsForCourt = async (courtId) => {
  //       try {
  //         const res = await axios.get(`/api/bookings/court/${courtId}`, { // Endpoint might be specific to public view
  //           headers: { Authorization: `Bearer ${token}` },
  //         });
  //         setBookingsForViewCourt(res.data);
  //       } catch (err) {
  //         toast.error("Error loading bookings for view");
  //         console.error("Error loading bookings for view:", err);
  //       }
  //     };
  //     fetchBookingsForCourt(viewCourt._id);
  //   }
  // }, [viewCourt, token]);


  useEffect(() => {
    if (viewCourt) {
      const fetchBookingsForCourt = async (courtId) => {
        try {
          const res = await axios.get(`/api/bookings/slots?courtId=${courtId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("🎾 Court-specific bookings:", res.data);

          // Ensure it's an array, fallback to res.data.bookings or []
          const bookingsArray = Array.isArray(res.data) ? res.data : res.data.bookings || [];
          setBookingsForViewCourt(bookingsArray);
        } catch (err) {
          toast.error("Error loading bookings for view");
          console.error("Error loading bookings for view:", err);
          setBookingsForViewCourt([]); // fallback to avoid crash
        }
      };

      fetchBookingsForCourt(viewCourt._id);
    }
  }, [viewCourt, token]);


  // Main useEffect for editing court slots: fetches and processes time slots for a selected court and date
  useEffect(() => {
    if (editCourt && selectedDate) {
      const fetchAndProcessTimeSlots = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };

          let fetchedSlots = [];
          try {
            const res = await axios.get(`/api/courts/${editCourt._id}/timeslots?date=${selectedDate}`, { headers });
            fetchedSlots = res.data && res.data.length > 0 ? res.data : generateFallbackTimeSlots();
          } catch {
            fetchedSlots = generateFallbackTimeSlots();
          }

          // Fetch blocked slots from backend
          const blockedRes = await axios.get(`/api/bookings/blocks/court/${editCourt._id}`, { headers });
          const blockedSlots = blockedRes.data.blockedSlots.filter(b => b.date === selectedDate);

          const courtBookingsAndBlocksForDate = bookings.filter(
            (b) => b.court?._id === editCourt._id && b.bookingDate === selectedDate
          );

          const processedSlots = fetchedSlots.map((slot) => {
            const normalizedSlotStart = normalizeTime(slot.start);
            const normalizedSlotEnd = normalizeTime(slot.end);

            const isBooked = courtBookingsAndBlocksForDate.some(
              (b) => normalizeTime(b.start) === normalizedSlotStart &&
                normalizeTime(b.end) === normalizedSlotEnd &&
                b.status === 'booked'
            );

            const isBlocked = blockedSlots.some(
              (s) => normalizeTime(s.start) === normalizedSlotStart &&
                normalizeTime(s.end) === normalizedSlotEnd
            );

            let currentStatus = slot.status || "available";
            if (isBooked) currentStatus = "booked";
            else if (isBlocked) currentStatus = "blocked";

            return {
              ...slot,
              status: currentStatus
            };
          });

          setTimeSlots(processedSlots);
        } catch (err) {
          console.error("Error fetching time slots or blocked data:", err);
          setTimeSlots(generateFallbackTimeSlots());
          toast.error("Failed to load time slots. Showing defaults.");
        }
      };



      fetchAndProcessTimeSlots();
    } else {
      setTimeSlots([]); // Clear time slots if no court is being edited or date isn't selected
    }
  }, [editCourt, selectedDate, token, bookings, generateFallbackTimeSlots, normalizeTime]); // Added 'bookings' to dependencies


  const handleBlockSlot = async (start, end) => {
    const slotKey = `${start}-${end}`;
    setBlockingSlot(slotKey);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        courtId: editCourt._id,
        date: selectedDate,
        start,
        end,
        status: 'blocked',
      };

      let response;
      try {
        response = await axios.post("/api/block-slot", payload, { headers });
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await axios.post("/api/bookings/block-slot", payload, { headers });
          } catch (err2) {
            if (err2.response?.status === 404) {
              response = await axios.post("/api/slots/block", payload, { headers });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }

      toast.success(response.data.message || "Slot blocked successfully!");

      // ✅ Instantly reflect slot change in UI
      setTimeSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.start === start && slot.end === end
            ? { ...slot, status: 'blocked' }
            : slot
        )
      );

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error blocking time slot";
      toast.error(errorMessage);
      console.error('Error blocking slot:', err);
    } finally {
      setBlockingSlot(null);
    }
  };
  const handleDeleteCourt = async (courtId) => {
    if (!window.confirm("Are you sure you want to delete this court? This action cannot be undone.")) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/courts/delete/${courtId}`, { headers });
      toast.success("Court deleted successfully!");
      fetchData(); // Refresh courts list
    } catch (err) {
      console.error("Error deleting court:", err);
      toast.error(err.response?.data?.message || "Failed to delete court");
    }
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading your Courts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OwnerNavbar />
      <div className="p-4 font-sans antialiased bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] min-h-screen">



        <h2 className="text-xl font-extrabold text-gray-900 mt-20 text-center">Get started on EZCO by subscribing first, then register your court and manage bookings with ease.

        </h2>

        <AddCourtForm onCourtAdded={fetchData} /> {/* Call fetchData after adding a court */}

        {/* COURT CARDS DISPLAY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
          {courts.length === 0 ? (
            <p className="col-span-full text-center text-gray-600 p-8 bg-white rounded-xl shadow-md">
              You haven't added any courts yet. Add one to get started!
            </p>
          ) : (
            courts.map((court) => (
              <div
                key={court._id}
                className="border border-gray-200 rounded-xl bg-white p-5 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {/* Court Image */}
                <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden shadow-inner">
                  <img
                    src={court.images?.[0] || 'https://placehold.co/600x400/E0E0E0/616161?text=No+Image+Available'}
                    alt={court.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E0E0/616161?text=Image+Load+Error'; }}
                  />
                </div>

                {/* Court Info */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h3>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin size={16} className="mr-1 text-[#004030]" />
                      {court.location}
                    </div>
                  </div>
                  {/* Approval Status */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${court.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {court.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
                <div className="text-[#004030] font-extrabold text-2xl mb-3">Rs{court.pricePerHour} <span className="text-base font-medium text-gray-500">/ hour</span></div>
                <div className="flex justify-between text-sm text-gray-700">
                  {/* <div className="flex items-center">
                    <Calendar size={16} className="inline mr-1 text-blue-500" />
                    <span className="font-medium">{court.bookingCount || 0} bookings</span>
                  </div> */}
                  {/* <div className="flex items-center">
                  <Star size={16} className="inline mr-1 text-yellow-500" />
                  <span className="font-medium">{court.rating ? court.rating.toFixed(1) : 'N/A'}</span>
                </div> */}
                </div>

                {/* Action Buttons */}
                {/* <div className="flex mt-5 space-x-3">
                <button
                  onClick={() => setViewCourt(court)}
                  className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg border border-gray-300 text-gray-700 text-base font-medium hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                >
                   View Bookings
                </button>
                <button
                  onClick={() => setEditCourt(court)}
                  className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-orange-500 text-white text-base font-medium hover:bg-orange-600 transition-colors duration-200 shadow-md"
                >
                  <Pencil size={18} className="mr-2" /> Manage Slots
                </button>
              </div> */}
                <div className="flex mt-5 space-x-3">
                  <button
                    onClick={() => handleDeleteCourt(court._id)}
                    className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg border border-red-400 text-red-700 text-base font-medium hover:bg-red-100 transition-colors duration-200 shadow-sm"
                  >
                    Delete Court
                  </button>
                  <button
                    onClick={() => setEditCourt(court)}
                    className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-[#004030] text-white text-base font-medium hover:bg-[#4A9782] transition-colors duration-200 shadow-md"
                  >
                    <Pencil size={18} className="mr-2" /> Manage Slots
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* View Bookings Modal */}
        {viewCourt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setViewCourt(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setViewCourt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
                <X size={28} />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Bookings for {viewCourt.name}</h2>
              {bookingsForViewCourt.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings found for this court yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-700 border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Date</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Time</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Player</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsForViewCourt.map((b) => (
                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">{normalizeDate(b.bookingDate)}</td>
                          <td className="py-3 px-4">{normalizeTime(b.start)} - {normalizeTime(b.end)}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{b.player?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{b.player?.phone || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${b.status === "booked" ? "bg-green-100 text-green-700" :
                                b.status === "pending" ? "bg-blue-100 text-blue-700" :
                                  b.status === "cancelled" ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700" // Default for 'blocked' or other statuses
                              }`}>
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
        )}

        {/* Edit Slot Calendar Modal */}
        {editCourt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setEditCourt(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setEditCourt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
                <X size={28} />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Manage Slots for {editCourt.name}</h2>

              {/* Date Picker */}
              <div className="mb-6 relative">
                <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="relative">
                  <input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 pl-12 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Time Slots for {selectedDate}</h3>
              {timeSlots.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No time slots configured for this date or court. Showing default available slots if applicable.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeSlots.map((slot, index) => {
                    const slotKey = `${slot.start}-${slot.end}`;
                    const isBlocking = blockingSlot === slotKey;

                    return (
                      <div
                        key={`${slot.start}-${slot.end}-${index}`} // More robust key
                        className={`p-4 rounded-lg flex justify-between items-center transition-all duration-200 ease-in-out shadow-sm
                        ${slot.status === "booked"
                            ? "bg-red-50 text-red-700 border border-red-200 cursor-not-allowed opacity-80"
                            : slot.status === "blocked"
                              ? "bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed opacity-80"
                              : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer"
                          }`}
                      >
                        <div>
                          <span className="font-semibold text-lg">{normalizeTime(slot.start)} - {normalizeTime(slot.end)}</span>
                          <div className={`text-sm font-medium ${slot.status === "booked" ? "text-red-600" :
                              slot.status === "blocked" ? "text-gray-500" :
                                "text-green-600"
                            }`}>{slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}</div>
                        </div>
                        {slot.status === "available" && (
                          <button
                            onClick={() => handleBlockSlot(slot.start, slot.end)}
                            disabled={isBlocking}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-md ${isBlocking
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-400"
                              }`}
                          >
                            {isBlocking ? "Blocking..." : "Block Slot"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </>
  );
}
