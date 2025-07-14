import React, { useEffect, useState } from "react";
import axios from "axios";
import AddCourtForm from "../components/AddCourtForm.jsx"; // Ensure this path is correct
import {
  Building2, Calendar, DollarSign, Star, MapPin, Eye, Pencil, X,
  BadgeDollarSign, Award, CheckCircle // Icons for your pricing modal
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define pricing details for display in the plan selection modal
const pricingPlans = {
  monthly: {
    name: "Monthly Plan",
    price: "Rs.500",
    interval: "/month",
    description: "Ideal for regular users. Billed monthly.",
    features: [
      "Unlimited Court Listings",
      "Real-time Booking Management",
      "Basic Analytics",
      { text: "Priority Support", excluded: true },
      { text: "Advanced Reporting", excluded: true }
    ]
  },
  yearly: {
    name: "Yearly Plan",
    price: "Rs.4800",
    interval: "/year",
    saveText: "SAVE 20%",
    description: "Best value! Save money with annual billing.",
    features: [
      "Unlimited Court Listings",
      "Real-time Booking Management",
      "All Basic Analytics",
      "Priority Customer Support",
      "Advanced Performance Reporting"
    ]
  }
};

export default function OwnerDashboard() {
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [owner, setOwner] = useState(null); // This will hold owner data including hasActiveSubscription
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false); // Controls the plan selection modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Controls the AddCourtForm modal

  const [stripeSessionId, setStripeSessionId] = useState(null); // Stores Stripe session ID after successful payment
  const [viewCourt, setViewCourt] = useState(null);
  const [editCourt, setEditCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const courtsPerPage = 6;

  // --- Helper Functions ---

  // Generates fallback time slots if none are fetched from the backend
  const generateFallbackTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start, end, status: "available" });
    }
    return slots;
  };

  // Normalizes a date string to YYYY-MM-DD format
  const normalizeDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Normalizes a time string to HH:MM format
  const normalizeTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // --- Data Fetching ---

  // Fetches courts, bookings, and owner profile from the backend
  const fetchData = async () => {
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [courtRes, bookingRes, ownerRes] = await Promise.all([
        axios.get("/api/courts/my-courts", { headers }),
        axios.get("/api/bookings/court-bookings", { headers }),
        axios.get("/api/auth/profile", { headers }) // Fetch owner profile to get subscription status
      ]);

      setCourts(courtRes.data);
      setOwner(ownerRes.data); // Update owner state, includes hasActiveSubscription

      const ownerCourtIds = courtRes.data.map((c) => c._id);
      const myBookings = bookingRes.data
        .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
        .map((b) => ({
          ...b,
          bookingDate: normalizeDate(b.bookingDate),
          start: normalizeTime(b.start),
          end: normalizeTime(b.end)
        }))
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

      setBookings(myBookings);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error(err.message || "Failed to load dashboard data. Please log in.");
      // Optionally redirect to login if token is missing or invalid
    } finally {
      setLoading(false);
    }
  };

  // --- Main Effect Hook for Initial Load and Stripe Redirect ---
  useEffect(() => {
    // Only proceed if a token is available
    if (token) {
      // Always fetch fresh data when the component mounts or token changes
      fetchData();

      // Check URL parameters for successful Stripe payment redirects
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment_status');
      const sessionId = params.get('session_id'); // Capture Stripe session ID

      if (paymentStatus === 'success' && sessionId) {
        // Payment was successful, and we have a session ID
        toast.success("Payment successful! You can now register your court.");
        setStripeSessionId(sessionId); // Store the session ID in state

        // IMPORTANT: Clear URL parameters to prevent re-triggering this logic on subsequent refreshes
        window.history.replaceState({}, document.title, window.location.pathname);

        // Re-fetch owner data immediately after successful payment
        // to get the updated `hasActiveSubscription` status.
        // This will then automatically open the AddCourtForm due to conditional rendering.
        fetchData(); 

      } else if (paymentStatus === 'cancelled') {
        // Payment was cancelled
        toast.warn("Payment cancelled. You can try again.");
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // If no token, log an error and stop loading
      toast.error("Please log in to access the dashboard.");
      setLoading(false);
    }
  }, [token]); // Rerun this effect only when the authentication token changes

  // --- Effect Hook for Time Slot Management (Dependent on editCourt and selectedDate) ---
  useEffect(() => {
    if (editCourt && selectedDate) {
      const fetchAndProcessTimeSlots = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          // Refresh bookings to ensure latest data (important for accurate slot status)
          const bookingRes = await axios.get("/api/bookings/court-bookings", { headers });
          const ownerCourtIds = courts.map((c) => c._id);
          const myBookings = bookingRes.data
            .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
            .map((b) => ({
              ...b,
              bookingDate: normalizeDate(b.bookingDate),
              start: normalizeTime(b.start),
              end: normalizeTime(b.end)
            }))
            .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
          setBookings(myBookings); // Update bookings state for merging

          let slots = [];
          try {
            // Attempt to fetch specific time slots for the court and date
            const res = await axios.get(`/api/courts/${editCourt._id}/timeslots?date=${selectedDate}`, { headers });
            slots = res.data && res.data.length > 0 ? res.data : generateFallbackTimeSlots();
          } catch (apiErr) {
            console.warn("Error fetching specific time slots, falling back to default:", apiErr.message);
            slots = generateFallbackTimeSlots(); // Fallback on API error
          }

          // Merge bookings with slots to determine 'booked' status
          const courtBookings = myBookings.filter(
            (b) => b.court?._id === editCourt._id && b.bookingDate === selectedDate && b.status === 'booked'
          );

          slots = slots.map((slot) => {
            const isBooked = courtBookings.some(
              (b) => normalizeTime(b.start) === normalizeTime(slot.start) && normalizeTime(b.end) === normalizeTime(slot.end)
            );
            return {
              ...slot,
              status: isBooked ? "booked" : slot.status || "available" // 'booked' overrides other statuses
            };
          });

          setTimeSlots(slots);
        } catch (err) {
          console.error("Error processing time slots:", err);
          setTimeSlots(generateFallbackTimeSlots()); // Fallback on any error
          toast.error("Failed to fetch time slots. Showing default slots.");
        }
      };
      fetchAndProcessTimeSlots();
    } else {
      setTimeSlots([]); // Clear time slots if no court is being edited or date isn't selected
    }
  }, [editCourt, selectedDate, token, courts]); // Rerun when these dependencies change

  // --- Slot Management (Blocking) ---

  // Handles blocking an available time slot
  const handleBlockSlot = async (start, end) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        "/api/block-slot", // Ensure this backend endpoint exists and is correct for blocking slots
        { courtId: editCourt._id, date: selectedDate, start, end },
        { headers }
      );
      toast.success(res.data.message);
      
      // Re-fetch all data to update court and booking statuses accurately
      await fetchData(); 

    } catch (err) {
      console.error('Error blocking slot:', err);
      toast.error(err.response?.data?.message || "Error blocking time slot");
    }
  };

  // --- Subscription Flow (Initiating Stripe Checkout) ---

  // Handles selecting a plan and initiating Stripe Checkout
  const handleSubscriptionCheckout = async (planType) => {
    setShowSubscriptionModal(false); // Close the plan selection modal immediately

    try {
      toast.info("Redirecting to payment. Please do not close this window...");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Call the backend endpoint to create a Stripe Checkout Session
      // This sends only the planType, as the court is created AFTER payment.
      const res = await axios.post(
        "/api/subscribe/subscribe",
        { planType }, // Only send planType
        { headers }
      );

      // Check if the backend successfully returned a Stripe Checkout URL
      if (res.data.url) {
        // Redirect the user's browser directly to the Stripe Checkout URL
        window.location.href = res.data.url;
      } else {
        // If no URL is returned, something went wrong on the backend
        toast.error("Failed to get Stripe checkout URL from server.");
      }
    } catch (err) {
      console.error("Error creating subscription session:", err);
      // Display specific error from backend if available, otherwise a generic message
      toast.error(err.response?.data?.error || "Failed to initiate payment. Please try again.");
      // Re-open the plan selection modal if there was an error before redirecting to Stripe
      setShowSubscriptionModal(true); 
    }
  };

  // --- Conditional logic for "Register Court" button ---
  // This function decides which modal to open based on subscription status
  const handleRegisterCourtClick = () => {
    if (owner?.hasActiveSubscription) {
      setIsAddModalOpen(true); // Open Add Court Form
    } else {
      setShowSubscriptionModal(true); // Open Subscription Choice Modal
    }
  };

  // --- Dashboard Statistics & Pagination ---

  // Pagination calculations for courts
  const totalPages = Math.ceil(courts.length / courtsPerPage);
  const startIdx = (currentPage - 1) * courtsPerPage;
  const currentCourts = courts.slice(startIdx, startIdx + courtsPerPage);

  // Calculate total revenue from bookings
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  
  // Calculate average rating of courts
  const avgRating =
    courts.length > 0
      ? (courts.reduce((sum, c) => sum + (c.rating || 0), 0) / courts.length).toFixed(1)
      : 0;

  // Bookings specifically for the currently viewed court
  const bookingsForViewCourt = viewCourt
    ? bookings.filter((b) => b.court?._id === viewCourt._id)
    : [];

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7D29] mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white min-h-screen p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#8B4513] to-orange-400 text-white p-6 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {owner?.name || 'Owner'}! 🏢</h1>
          <p className="text-lg mt-1">Manage your courts and track your business</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="text-2xl font-bold">{courts.length}</div>
            <div className="flex items-center text-gray-600 mt-1">
              <Building2 size={18} className="mr-2" />
              Total Courts
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar size={18} className="mr-2" />
              Total Bookings
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-gray-600 mt-1">
              <DollarSign size={18} className="mr-2" />
              Revenue
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="text-2xl font-bold">{avgRating}</div>
            <div className="flex items-center text-gray-600 mt-1">
              <Star size={18} className="mr-2 text-yellow-500" />
              Avg Rating
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
            <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              {bookings.filter((b) => b.bookingDate === new Date().toISOString().split('T')[0]).length} bookings Today
            </span>
          </div>

          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="text-left text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-2">Court</th>
                    <th className="py-2 px-2">Player</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Time</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter((b) => b.bookingDate === new Date().toISOString().split('T')[0])
                    .slice(0, 6) // Show only up to 6 recent bookings
                    .map((b) => (
                      <tr key={b._id} className="border-t">
                        <td className="py-2 px-2">{b.court?.name}</td>
                        <td className="py-2 px-2">
                          {b.player?.name}
                          <div className="text-xs text-gray-500">{b.player?.phone}</div>
                        </td>
                        <td className="py-2 px-2">{b.bookingDate}</td>
                        <td className="py-2 px-2">{b.start} - {b.end}</td>
                        <td className="py-2 px-2">Rs.{b.pricePerHour}</td>
                        <td className="py-2 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${b.status === "booked" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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

        {/* Court Cards Section */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Courts ({courts.length})</h2>
            <button
              onClick={handleRegisterCourtClick}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-600"
            >
              Register Court
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentCourts.map((court) => (
              <div key={court._id} className="border rounded-xl bg-gray-50 p-4 shadow hover:shadow-md transition">
                {/* Court Image */}
                <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={court.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={court.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {/* Court Details */}
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-md font-bold text-gray-800">{court.name}</h3>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {court.location}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${court.isApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
                    {court.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
                <div className="text-orange-600 font-bold text-lg">₹{court.pricePerHour}</div>
                <div className="flex justify-between text-sm mt-2 text-gray-600">
                  <div><Calendar size={14} className="inline mr-1" />{court.bookingCount || 0} bookings</div>
                  <div><Star size={14} className="inline mr-1 text-yellow-500" />{court.rating || 0}</div>
                </div>
                {/* Action Buttons */}
                <div className="flex mt-4 space-x-2">
                  <button
                    onClick={() => setViewCourt(court)}
                    className="flex-1 flex items-center justify-center px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
                  >
                    <Eye size={14} className="mr-1" /> View
                  </button>
                  <button
                    onClick={() => setEditCourt(court)}
                    className="flex-1 flex items-center justify-center px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
                  >
                    <Pencil size={14} className="mr-1" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md border font-semibold ${currentPage === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-orange-600 border-orange-600 hover:bg-orange-100"}`}
            >
              Previous
            </button>
            <span className="px-4 py-2 font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md border font-semibold ${currentPage === totalPages ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-orange-600 border-orange-600 hover:bg-orange-100"}`}
            >
              Next
            </button>
          </div>
        </div>

        {/* --- Subscription Choice Modal --- */}
        {showSubscriptionModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
            onClick={() => setShowSubscriptionModal(false)} // Close modal on overlay click
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 relative transform transition-all duration-300 scale-100 opacity-100"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold text-center mb-8 text-[#FF7D29]">
                Choose Your Plan
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Unlock full features by choosing a subscription plan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Monthly Plan Card */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 flex flex-col items-center text-center shadow-md">
                  <div className="text-orange-600 mb-4">
                    <BadgeDollarSign size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{pricingPlans.monthly.name}</h3>
                  <p className="text-4xl font-extrabold text-[#FF7D29] mb-4">
                    {pricingPlans.monthly.price}<span className="text-lg font-normal text-gray-600">{pricingPlans.monthly.interval}</span>
                  </p>
                  <ul className="text-gray-700 text-left space-y-2 mb-6">
                    {pricingPlans.monthly.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center ${feature.excluded ? 'opacity-60' : ''}`}>
                        {feature.excluded ? <X size={18} className="text-red-500 mr-2" /> : <CheckCircle size={18} className="text-green-500 mr-2" />}
                        {feature.text || feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscriptionCheckout('monthly')}
                    className="mt-auto bg-[#FF7D29] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition duration-300"
                  >
                    Subscribe Monthly
                  </button>
                </div>

                {/* Yearly Plan Card */}
                <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-6 flex flex-col items-center text-center shadow-xl relative">
                  <span className="absolute -top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full rotate-3 shadow-sm">
                    {pricingPlans.yearly.saveText}
                  </span>
                  <div className="text-orange-700 mb-4">
                    <Award size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{pricingPlans.yearly.name}</h3>
                  <p className="text-4xl font-extrabold text-[#7B4019] mb-4">
                    {pricingPlans.yearly.price}<span className="text-lg font-normal text-gray-600">{pricingPlans.yearly.interval}</span>
                  </p>
                  <ul className="text-gray-700 text-left space-y-2 mb-6">
                    {pricingPlans.yearly.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center ${feature.excluded ? 'opacity-60' : ''}`}>
                        {feature.excluded ? <X size={18} className="text-red-500 mr-2" /> : <CheckCircle size={18} className="text-green-500 mr-2" />}
                        {feature.text || feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscriptionCheckout('yearly')}
                    className="mt-auto bg-[#7B4019] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#A0522D] transition duration-300"
                  >
                    Go Yearly!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Add Court Form (Only visible if hasActiveSubscription is true) */}
        {isAddModalOpen && owner?.hasActiveSubscription && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Register New Court</h2>
              <AddCourtForm
                stripeSessionId={stripeSessionId} // Pass if AddCourtForm uses it for initial court linking
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  setStripeSessionId(null); // Clear session ID after successful form submission
                  fetchData(); // Re-fetch courts AND owner data to ensure subscription status is updated
                }}
              />
            </div>
          </div>
        )}

        {/* Modal for Viewing Bookings of a Court */}
        {viewCourt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setViewCourt(null)}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewCourt(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4">Bookings for {viewCourt.name}</h2>

              {bookingsForViewCourt.length === 0 ? (
                <p className="text-gray-500">No bookings found for this court.</p>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                        <thead className="border-b text-gray-600">
                            <tr>
                                <th className="py-2 px-2 text-left">Date</th>
                                <th className="py-2 px-2 text-left">Time</th>
                                <th className="py-2 px-2 text-left">Player</th>
                                <th className="py-2 px-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingsForViewCourt.map((b) => (
                                <tr key={b._id} className="border-b">
                                    <td className="py-2 px-2">{b.bookingDate}</td>
                                    <td className="py-2 px-2">{b.start} - {b.end}</td>
                                    <td className="py-2 px-2">
                                        {b.player?.name}
                                        <div className="text-xs text-gray-500">{b.player?.phone}</div>
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${b.status === "booked" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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

        {/* Modal for Editing Court Slots */}
        {editCourt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setEditCourt(null)}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditCourt(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4">Manage Slots for {editCourt.name}</h2>

              <div className="mb-4 relative z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <div className="relative z-10">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                    }}
                    className="w-full p-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white z-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-20" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Time Slots</h3>
              {timeSlots.length === 0 ? (
                <p className="text-gray-500">No time slots available for this date. Please try another date.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md flex justify-between items-center ${
                        slot.status === "booked"
                          ? "bg-red-100 text-red-700 cursor-not-allowed"
                          : slot.status === "blocked"
                          ? "bg-gray-100 text-gray-700 cursor-not-allowed"
                          : "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{slot.start} - {slot.end}</span>
                        <div className="text-xs">
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                        </div>
                      </div>
                      {slot.status === "available" && (
                        <button
                          onClick={() => handleBlockSlot(slot.start, slot.end)}
                          className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}














// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AddCourtForm from "../components/AddCourtForm.jsx";
// import {
//   Building2, Calendar, DollarSign, Star, MapPin, Eye, Pencil, X
// } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function OwnerDashboard() {
//   const [courts, setCourts] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [owner, setOwner] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [viewCourt, setViewCourt] = useState(null);
//   const [editCourt, setEditCourt] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const token = localStorage.getItem("token");
//   const courtsPerPage = 6;

//   // Generate fallback time slots
//   const generateFallbackTimeSlots = () => {
//     const slots = [];
//     const startHour = 6; // 6 AM
//     const endHour = 22; // 10 PM
//     for (let hour = startHour; hour < endHour; hour++) {
//       const start = `${hour.toString().padStart(2, '0')}:00`;
//       const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
//       slots.push({ start, end, status: "available" });
//     }
//     return slots;
//   };

//   // Normalize date to YYYY-MM-DD
//   const normalizeDate = (date) => {
//     return new Date(date).toISOString().split('T')[0];
//   };

//   // Normalize time to ensure consistent format (HH:MM)
//   const normalizeTime = (time) => {
//     const [hours, minutes] = time.split(':');
//     return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
//   };

//   // Fetch courts, bookings, and owner profile
//   const fetchData = async () => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const [courtRes, bookingRes, ownerRes] = await Promise.all([
//         axios.get("/api/courts/my-courts", { headers }),
//         axios.get("/api/bookings/court-bookings", { headers }),
//         axios.get("/api/auth/profile", { headers })
//       ]);

//       console.log('Fetched courts:', courtRes.data);
//       console.log('Fetched bookings:', bookingRes.data);
//       console.log('Fetched owner:', ownerRes.data);

//       setCourts(courtRes.data);
//       setOwner(ownerRes.data);

//       const ownerCourtIds = courtRes.data.map((c) => c._id);
//       const myBookings = bookingRes.data
//         .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
//         .map((b) => ({
//           ...b,
//           bookingDate: normalizeDate(b.bookingDate),
//           start: normalizeTime(b.start),
//           end: normalizeTime(b.end)
//         }))
//         .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

//       console.log('Filtered bookings:', myBookings);
//       setBookings(myBookings);
//     } catch (err) {
//       console.error("Error loading dashboard:", err);
//       toast.error("Failed to load dashboard data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchData();
//     } else {
//       toast.error("Please log in to access the dashboard.");
//       setLoading(false);
//     }
//   }, [token]);

//   // Fetch time slots and merge with bookings
//   useEffect(() => {
//     if (editCourt && selectedDate) {
//       const fetchTimeSlots = async () => {
//         try {
//           const headers = { Authorization: `Bearer ${token}` };
//           // Refresh bookings to ensure latest data
//           const bookingRes = await axios.get("/api/bookings/court-bookings", { headers });
//           const ownerCourtIds = courts.map((c) => c._id);
//           const myBookings = bookingRes.data
//             .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
//             .map((b) => ({
//               ...b,
//               bookingDate: normalizeDate(b.bookingDate),
//               start: normalizeTime(b.start),
//               end: normalizeTime(b.end)
//             }))
//             .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
//           setBookings(myBookings);
//           console.log('Refreshed bookings:', myBookings);

//           let slots = [];
//           try {
//             const res = await axios.get(`/api/courts/${editCourt._id}/timeslots?date=${selectedDate}`, { headers });
//             slots = res.data && res.data.length > 0 ? res.data : generateFallbackTimeSlots();
//             console.log('Fetched slots for court', editCourt._id, 'date', selectedDate, ':', slots);
//           } catch (apiErr) {
//             console.warn("Falling back to default slots:", apiErr.message);
//             slots = generateFallbackTimeSlots();
//           }

//           // Merge bookings with slots
//           const courtBookings = myBookings.filter(
//             (b) => b.court?._id === editCourt._id && b.bookingDate === selectedDate && b.status === 'booked'
//           );
//           console.log('Court bookings for date', selectedDate, ':', courtBookings);

//           slots = slots.map((slot) => {
//             const isBooked = courtBookings.some(
//               (b) => normalizeTime(b.start) === normalizeTime(slot.start) && normalizeTime(b.end) === normalizeTime(slot.end)
//             );
//             return {
//               ...slot,
//               status: isBooked ? "booked" : slot.status || "available"
//             };
//           });

//           console.log('Processed slots with bookings:', slots);
//           setTimeSlots(slots);
//         } catch (err) {
//           console.error("Error processing time slots:", err);
//           setTimeSlots(generateFallbackTimeSlots());
//           toast.error("Failed to fetch time slots. Showing default slots.");
//         }
//       };
//       fetchTimeSlots();
//     } else {
//       setTimeSlots([]);
//     }
//   }, [editCourt, selectedDate, token, courts]);

//   const handleBlockSlot = async (start, end) => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.post(
//         "/api/block-slot",
//         { courtId: editCourt._id, date: selectedDate, start, end },
//         { headers }
//       );
//       toast.success(res.data.message);
//       // Refresh bookings and time slots
//       const bookingRes = await axios.get("/api/bookings/court-bookings", { headers });
//       const ownerCourtIds = courts.map((c) => c._id);
//       const myBookings = bookingRes.data
//         .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
//         .map((b) => ({
//           ...b,
//           bookingDate: normalizeDate(b.bookingDate),
//           start: normalizeTime(b.start),
//           end: normalizeTime(b.end)
//         }))
//         .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
//       setBookings(myBookings);
//       console.log('Refreshed bookings after blocking:', myBookings);

//       const slotRes = await axios.get(`/api/courts/${editCourt._id}/timeslots?date=${selectedDate}`, { headers });
//       let slots = slotRes.data && slotRes.data.length > 0 ? slotRes.data : generateFallbackTimeSlots();
//       // Re-apply booking status
//       const courtBookings = myBookings.filter(
//         (b) => b.court?._id === editCourt._id && b.bookingDate === selectedDate && b.status === 'booked'
//       );
//       slots = slots.map((slot) => {
//         const isBooked = courtBookings.some(
//           (b) => normalizeTime(b.start) === normalizeTime(slot.start) && normalizeTime(b.end) === normalizeTime(slot.end)
//         );
//         return {
//           ...slot,
//           status: isBooked ? "booked" : slot.status || "available"
//         };
//       });
//       console.log('Re-fetched slots after blocking:', slots);
//       setTimeSlots(slots);
//     } catch (err) {
//       console.error('Error blocking slot:', err);
//       toast.error(err.response?.data?.message || "Error blocking time slot");
//     }
//   };

//   // Pagination calculations
//   const totalPages = Math.ceil(courts.length / courtsPerPage);
//   const startIdx = (currentPage - 1) * courtsPerPage;
//   const currentCourts = courts.slice(startIdx, startIdx + courtsPerPage);

//   const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
//   const avgRating =
//     courts.length > 0
//       ? (courts.reduce((sum, c) => sum + (c.rating || 0), 0) / courts.length).toFixed(1)
//       : 0;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7D29] mx-auto"></div>
//           <p className="text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   const bookingsForViewCourt = viewCourt
//     ? bookings.filter((b) => b.court?._id === viewCourt._id)
//     : [];

//   return (
//     <div className="bg-gradient-to-br from-yellow-50 to-white min-h-screen p-6 mt-20">
//       <div className="max-w-7xl mx-auto">
//       <div className="bg-gradient-to-r from-[#8B4513] to-orange-400 text-white p-6 rounded-xl shadow-lg mb-8">
//         <h1 className="text-3xl font-bold">Welcome back, {owner?.name || 'Owner'}! 🏢</h1>
//         <p className="text-lg mt-1">Manage your courts and track your business</p>
//       </div>

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
//         <div className="bg-white p-5 rounded-xl shadow">
//           <div className="text-2xl font-bold">{courts.length}</div>
//           <div className="flex items-center text-gray-600 mt-1">
//             <Building2 size={18} className="mr-2" />
//             Total Courts
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow">
//           <div className="text-2xl font-bold">{bookings.length}</div>
//           <div className="flex items-center text-gray-600 mt-1">
//             <Calendar size={18} className="mr-2" />
//             Total Bookings
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow">
//           <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
//           <div className="flex items-center text-gray-600 mt-1">
//             <DollarSign size={18} className="mr-2" />
//             Revenue
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow">
//           <div className="text-2xl font-bold">{avgRating}</div>
//           <div className="flex items-center text-gray-600 mt-1">
//             <Star size={18} className="mr-2 text-yellow-500" />
//             Avg Rating
//           </div>
//         </div>
//       </div>

//       {/* Recent Bookings */}
//      <div className="bg-white p-6 rounded-xl shadow mb-10">
//   <div className="flex justify-between items-center mb-4">
//     <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
//     <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
//       {bookings.filter((b) => b.bookingDate === new Date().toISOString().split('T')[0]).length} bookings
//     </span>
//   </div>

//   {bookings.length === 0 ? (
//     <p className="text-gray-500 text-center">No bookings yet.</p>
//   ) : (
//     <table className="w-full text-sm">
//       <thead className="text-left text-gray-600 border-b">
//         <tr>
//           <th className="py-2">Court</th>
//           <th>Player</th>
//           <th>Date</th>
//           <th>Time</th>
//           <th>Amount</th>
//           <th>Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {bookings
//           .filter((b) => b.bookingDate === new Date().toISOString().split('T')[0])
//           .slice(0, 6)
//           .map((b) => (
//             <tr key={b._id} className="border-t">
//               <td className="py-2">{b.court?.name}</td>
//               <td>
//                 {b.player?.name}
//                 <div className="text-xs text-gray-500">{b.player?.phone}</div>
//               </td>
//               <td>{b.bookingDate}</td>
//               <td>{b.start} - {b.end}</td>
//               <td>Rs.{b.pricePerHour}</td>
//               <td>
//                 <span className={`text-xs px-2 py-1 rounded-full font-semibold ${b.status === "booked" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//                   {b.status}
//                 </span>
//               </td>
//             </tr>
//           ))}
//       </tbody>
//     </table>
//   )}
// </div>

//       {/* Court Cards Section */}
//       <div className="bg-white p-6 rounded-xl shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Your Courts ({courts.length})</h2>
//           <button
//             onClick={() => setIsAddModalOpen(true)}
//             className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-600"
//           >
//             Register Court
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {currentCourts.map((court) => (
//             <div key={court._id} className="border rounded-xl bg-gray-50 p-4 shadow hover:shadow-md transition">
//               <div className="h-50 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
//                 <img
//                   src={court.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
//                   alt={court.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex justify-between items-center mb-2">
//                 <div>
//                   <h3 className="text-md font-bold text-gray-800">{court.name}</h3>
//                   <div className="text-sm text-gray-600 flex items-center">
//                     <MapPin size={14} className="mr-1" />
//                     {court.location}
//                   </div>
//                 </div>
//                 <span className={`text-xs px-2 py-1 rounded-full ${court.isApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
//                   {court.isApproved ? "Approved" : "Pending Approval"}
//                 </span>
//               </div>
//               <div className="text-orange-600 font-bold text-lg">₹{court.pricePerHour}</div>
//               <div className="flex justify-between text-sm mt-2 text-gray-600">
//                 <div><Calendar size={14} className="inline mr-1" />{court.bookingCount || 0} bookings</div>
//                 <div><Star size={14} className="inline mr-1 text-yellow-500" />{court.rating || 0}</div>
//               </div>
//               <div className="flex mt-4 space-x-2">
//                 <button
//                   onClick={() => setViewCourt(court)}
//                   className="flex-1 flex items-center justify-center px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
//                 >
//                   <Eye size={14} className="mr-1" /> View
//                 </button>
//                 <button
//                   onClick={() => setEditCourt(court)}
//                   className="flex-1 flex items-center justify-center px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
//                 >
//                   <Pencil size={14} className="mr-1" /> Edit
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex justify-center mt-6 space-x-4">
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//             disabled={currentPage === 1}
//             className={`px-4 py-2 rounded-md border font-semibold ${currentPage === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-orange-600 border-orange-600 hover:bg-orange-100"}`}
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2 font-semibold text-gray-700">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className={`px-4 py-2 rounded-md border font-semibold ${currentPage === totalPages ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-orange-600 border-orange-600 hover:bg-orange-100"}`}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Modal for Add Court Form */}
//       {isAddModalOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={() => setIsAddModalOpen(false)}
//         >
//           <div
//             className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setIsAddModalOpen(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//               aria-label="Close modal"
//             >
//               <X size={24} />
//             </button>
//             <h2 className="text-xl font-bold mb-4">Register New Court</h2>
//             <AddCourtForm
//               onSuccess={() => {
//                 setIsAddModalOpen(false);
//                 fetchData();
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Modal for Viewing Bookings of a Court */}
//       {viewCourt && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={() => setViewCourt(null)}
//         >
//           <div
//             className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setViewCourt(null)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//               aria-label="Close modal"
//             >
//               <X size={24} />
//             </button>

//             <h2 className="text-xl font-bold mb-4">Bookings for {viewCourt.name}</h2>

//             {bookingsForViewCourt.length === 0 ? (
//               <p className="text-gray-500">No bookings found for this court.</p>
//             ) : (
//               <table className="w-full text-sm border-collapse">
//                 <thead className="border-b text-gray-600">
//                   <tr>
//                     <th className="py-2 text-left">Date</th>
//                     <th className="py-2 text-left">Time</th>
//                     <th className="py-2 text-left">Player</th>
//                     <th className="py-2 text-left">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {bookingsForViewCourt.map((b) => (
//                     <tr key={b._id} className="border-b">
//                       <td className="py-2">{b.bookingDate}</td>
//                       <td className="py-2">{b.start} - {b.end}</td>
//                       <td className="py-2">
//                         {b.player?.name}
//                         <div className="text-xs text-gray-500">{b.player?.phone}</div>
//                       </td>
//                       <td className="py-2">
//                         <span className={`text-xs px-2 py-1 rounded-full font-semibold ${b.status === "booked" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//                           {b.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Modal for Editing Court Slots */}
//       {editCourt && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={() => setEditCourt(null)}
//         >
//           <div
//             className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setEditCourt(null)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//               aria-label="Close modal"
//             >
//               <X size={24} />
//             </button>

//             <h2 className="text-xl font-bold mb-4">Manage Slots for {editCourt.name}</h2>

//             <div className="mb-4 relative z-10">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Select Date
//               </label>
//               <div className="relative z-10">
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => {
//                     setSelectedDate(e.target.value);
//                     console.log('Date changed to:', e.target.value);
//                   }}
//                   className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white z-10"
//                   min={new Date().toISOString().split('T')[0]}
//                 />
//                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-20" />
//               </div>
//             </div>

//             <h3 className="text-lg font-semibold mb-2">Time Slots</h3>
//             {timeSlots.length === 0 ? (
//               <p className="text-gray-500">No time slots available for this date. Please try another date.</p>
//             ) : (
//               <div className="grid md:grid-cols-2 gap-4">
//                 {timeSlots.map((slot, index) => (
//                   <div
//                     key={index}
//                     className={`p-3 rounded-md flex justify-between items-center ${
//                       slot.status === "booked"
//                         ? "bg-red-100 text-red-700 cursor-not-allowed"
//                         : slot.status === "blocked"
//                         ? "bg-gray-100 text-gray-700 cursor-not-allowed"
//                         : "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
//                     }`}
//                   >
//                     <div>
//                       <span className="font-medium">{slot.start} - {slot.end}</span>
//                       <div className="text-xs">
//                         {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
//                       </div>
//                     </div>
//                     {slot.status === "available" && (
//                       <button
//                         onClick={() => handleBlockSlot(slot.start, slot.end)}
//                         className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
//                       >
//                         Block
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
// </div>
//       <ToastContainer />
//     </div>
//   );
// }