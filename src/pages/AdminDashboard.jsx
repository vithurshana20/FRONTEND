import React, { useEffect, useState, useCallback } from "react"; // Added useCallback for fetchData
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
      { text: "Priority Support", excluded: true }, // Example of an excluded feature
      { text: "Advanced Reporting", excluded: true } // Example of an excluded feature
    ]
  },
  yearly: {
    name: "Yearly Plan",
    price: "Rs.4800", // This price is typically for 12 months, saving money
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
  const token = localStorage.getItem("token"); // Get authentication token from local storage
  const courtsPerPage = 6; // Number of courts to display per page

  // --- Helper Functions ---

  /**
   * Generates a default set of time slots if none are fetched from the backend.
   * Assumes hourly slots from 6 AM to 10 PM.
   * @returns {Array<Object>} An array of time slot objects.
   */
  const generateFallbackTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM (meaning last slot is 21:00-22:00)
    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start, end, status: "available" });
    }
    return slots;
  };

  /**
   * Normalizes a date string to YYYY-MM-DD format for consistency.
   * @param {string|Date} date - The date to normalize.
   * @returns {string} The normalized date string.
   */
  const normalizeDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  /**
   * Normalizes a time string to HH:MM format for consistency.
   * @param {string} time - The time string to normalize (e.g., "9:0", "14:30").
   * @returns {string} The normalized time string (e.g., "09:00", "14:30").
   */
  const normalizeTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // --- Data Fetching ---

  /**
   * Fetches all necessary dashboard data: owner's courts, bookings, and owner profile.
   * Updates state variables upon successful fetch.
   */
  const fetchData = useCallback(async () => {
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Use Promise.all to fetch data concurrently for efficiency
      const [courtRes, bookingRes, ownerRes] = await Promise.all([
        axios.get("http://localhost:5000/api/courts/my-courts", { headers }),
        axios.get("http://localhost:5000/api/bookings/court-bookings", { headers }),
        axios.get("http://localhost:5000/api/auth/profile", { headers }) // Fetch owner profile to get subscription status
      ]);

      setCourts(courtRes.data);
      setOwner(ownerRes.data); // Update owner state, which should include `hasActiveSubscription`

      // Filter and normalize bookings relevant to the owner's courts
      const ownerCourtIds = courtRes.data.map((c) => c._id);
      const myBookings = bookingRes.data
        .filter((b) => ownerCourtIds.includes(b.court?._id) && b.status === 'booked')
        .map((b) => ({
          ...b,
          bookingDate: normalizeDate(b.bookingDate), // Normalize booking date
          start: normalizeTime(b.start), // Normalize start time
          end: normalizeTime(b.end)     // Normalize end time
        }))
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)); // Sort by date

      setBookings(myBookings);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error(err.message || "Failed to load dashboard data. Please log in.");
      // Optionally, redirect to login page if authentication fails consistently
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  }, [token]); // fetchData depends only on `token`

  // --- Main Effect Hook for Initial Load and Stripe Redirect Handling ---
  useEffect(() => {
    // Only proceed if an authentication token is available
    if (token) {
      // Always fetch fresh data when the component mounts or the token changes
      // This is crucial to get the latest `hasActiveSubscription` status
      fetchData();

      // Parse URL parameters to check for Stripe payment redirect status
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment_status');
      const sessionId = params.get('session_id'); // Capture Stripe session ID for verification

      // Handle successful payment redirect
      if (paymentStatus === 'success' && sessionId) {
        toast.success("Payment successful! You can now register your court.");
        setStripeSessionId(sessionId); // Store the session ID in state

        // CRITICAL: Directly set the Add Court modal to open after successful payment.
        // The modal will only *visually render* if 'owner?.hasActiveSubscription'
        // becomes true, which is updated by the `fetchData()` call above.
        setIsAddModalOpen(true);

        // Clear URL parameters to prevent re-triggering this logic on subsequent refreshes
        window.history.replaceState({}, document.title, window.location.pathname);

      } else if (paymentStatus === 'cancelled') {
        // Handle cancelled payment redirect
        toast.warn("Payment cancelled. You can try again.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // If no token is found, inform the user and stop loading
      toast.error("Please log in to access the dashboard.");
      setLoading(false);
    }
  }, [token, fetchData]); // This effect re-runs when the authentication token or fetchData reference changes

  // --- Effect Hook for Time Slot Management (Dependent on editCourt and selectedDate) ---
  useEffect(() => {
    if (editCourt && selectedDate) {
      const fetchAndProcessTimeSlots = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          // Re-fetch all court bookings to ensure the most current data for slot status
          const bookingRes = await axios.get("http://localhost:5000/api/bookings/court-bookings", { headers });
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
          setBookings(myBookings); // Update the bookings state

          let slots = [];
          try {
            // Attempt to fetch specific time slots for the selected court and date from backend
            const res = await axios.get(`http://localhost:5000/api/courts/${editCourt._id}/timeslots?date=${selectedDate}`, { headers });
            slots = res.data && res.data.length > 0 ? res.data : generateFallbackTimeSlots();
          } catch (apiErr) {
            console.warn("Error fetching specific time slots, falling back to default:", apiErr.message);
            slots = generateFallbackTimeSlots(); // Fallback to default if API call fails
          }

          // Merge fetched slots with existing bookings to determine 'booked' status
          const courtBookings = myBookings.filter(
            (b) => b.court?._id === editCourt._id && b.bookingDate === selectedDate && b.status === 'booked'
          );

          slots = slots.map((slot) => {
            const isBooked = courtBookings.some(
              (b) => normalizeTime(b.start) === normalizeTime(slot.start) && normalizeTime(b.end) === normalizeTime(slot.end)
            );
            return {
              ...slot,
              status: isBooked ? "booked" : slot.status || "available" // 'booked' status takes precedence
            };
          });

          setTimeSlots(slots);
        } catch (err) {
          console.error("Error processing time slots:", err);
          setTimeSlots(generateFallbackTimeSlots()); // Fallback on any processing error
          toast.error("Failed to fetch time slots. Showing default slots.");
        }
      };
      fetchAndProcessTimeSlots();
    } else {
      setTimeSlots([]); // Clear time slots if no court is being edited or date isn't selected
    }
  }, [editCourt, selectedDate, token, courts]); // Re-run this effect when these dependencies change

  // --- Slot Management (Blocking) ---

  /**
   * Handles blocking an available time slot for a court.
   * @param {string} start - Start time of the slot (e.g., "09:00").
   * @param {string} end - End time of the slot (e.g., "10:00").
   */
  const handleBlockSlot = async (start, end) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        "http://localhost:5000/api/block-slot", // Ensure this backend endpoint exists and is correctly configured
        { courtId: editCourt._id, date: selectedDate, start, end },
        { headers }
      );
      toast.success(res.data.message);
      
      // Re-fetch all dashboard data to update court and booking statuses accurately after blocking
      await fetchData(); 

    } catch (err) {
      console.error('Error blocking slot:', err);
      toast.error(err.response?.data?.message || "Error blocking time slot");
    }
  };

  // --- Subscription Flow (Initiating Stripe Checkout) ---

  /**
   * Handles selecting a subscription plan and initiating the Stripe Checkout process.
   * @param {string} planType - The type of plan selected ('monthly' or 'yearly').
   */
  const handleSubscriptionCheckout = async (planType) => {
    setShowSubscriptionModal(false); // Close the plan selection modal immediately

    try {
      toast.info("Redirecting to payment. Please do not close this window...");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Call the backend endpoint to create a Stripe Checkout Session.
      // We only send `planType` as the court is created AFTER the subscription is active.
      const res = await axios.post(
        "http://localhost:5000/api/subscribe/subscribe",
        { planType }, // Only send planType
        { headers }
      );

      // If the backend successfully returned a Stripe Checkout URL, redirect the user
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        // If no URL is returned, indicate a backend issue
        toast.error("Failed to get Stripe checkout URL from server.");
      }
    } catch (err) {
      console.error("Error creating subscription session:", err);
      // Display specific error from backend if available, otherwise a generic message
      toast.error(err.response?.data?.error || "Failed to initiate payment. Please try again.");
      // Re-open the plan selection modal if an error occurred before redirecting
      setShowSubscriptionModal(true); 
    }
  };

  // --- Conditional logic for "Register Court" button ---
  /**
   * Determines which modal to open when the "Register Court" button is clicked:
   * - Subscription modal if the owner does not have an active subscription.
   * - Add Court Form modal if the owner has an active subscription.
   */
  const handleRegisterCourtClick = () => {
    // Check `owner?.hasActiveSubscription` to determine which modal to show
    if (owner?.hasActiveSubscription) {
      setIsAddModalOpen(true); // Open Add Court Form
    } else {
      setShowSubscriptionModal(true); // Open Subscription Choice Modal
    }
  };

  // --- Dashboard Statistics & Pagination Calculations ---

  // Calculate total pages for court pagination
  const totalPages = Math.ceil(courts.length / courtsPerPage);
  // Determine start index for current page's courts
  const startIdx = (currentPage - 1) * courtsPerPage;
  // Slice the courts array to get courts for the current page
  const currentCourts = courts.slice(startIdx, startIdx + courtsPerPage);

  // Calculate total revenue from all bookings
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  
  // Calculate average rating of all owner's courts
  const avgRating =
    courts.length > 0
      ? (courts.reduce((sum, c) => sum + (c.rating || 0), 0) / courts.length).toFixed(1)
      : 0;

  // Filter bookings specifically for the currently viewed court in the view modal
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
              {/* Filter bookings for today's date */}
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
                  {/* Map over filtered bookings for today and limit to 6 */}
                  {bookings
                    .filter((b) => b.bookingDate === new Date().toISOString().split('T')[0])
                    .slice(0, 6) 
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
              onClick={handleRegisterCourtClick} // Calls the function that decides which modal to open
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-600"
            >
              Register Court
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentCourts.map((court) => (
              <div key={court._id} className="border rounded-xl bg-gray-50 p-4 shadow hover:shadow-md transition">
                {/* Court Image Display */}
                <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={court.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={court.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {/* Court Name, Location, Approval Status */}
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
                {/* Booking Count and Rating */}
                <div className="flex justify-between text-sm mt-2 text-gray-600">
                  <div><Calendar size={14} className="inline mr-1" />{court.bookingCount || 0} bookings</div>
                  <div><Star size={14} className="inline mr-1 text-yellow-500" />{court.rating || 0}</div>
                </div>
                {/* Action Buttons for each Court */}
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
        {/* The Add Court Form modal is shown only if `isAddModalOpen` is true AND the `owner` has an active subscription. */}
        {isAddModalOpen && owner?.hasActiveSubscription && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setIsAddModalOpen(false)} // Close modal when clicking outside
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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
                stripeSessionId={stripeSessionId} // Pass Stripe session ID if your AddCourtForm needs it for initial court linking/verification
                onSuccess={() => {
                  setIsAddModalOpen(false); // Close modal on successful court addition
                  setStripeSessionId(null); // Clear the session ID after successful form submission
                  fetchData(); // Re-fetch courts AND owner data to ensure subscription status is updated
                }}
              />
            </div>
          </div>
        )}

        {/* Modal for Viewing Bookings of a specific Court */}
        {viewCourt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setViewCourt(null)} // Close modal when clicking outside
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
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
            onClick={() => setEditCourt(null)} // Close modal when clicking outside
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button
                onClick={() => setEditCourt(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4">Manage Slots for {editCourt.name}</h2>

              {/* Date selection for time slot management */}
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
                    min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
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
                          ? "bg-red-100 text-red-700 cursor-not-allowed" // Booked slots are red and not clickable
                          : slot.status === "blocked"
                          ? "bg-gray-100 text-gray-700 cursor-not-allowed" // Blocked slots are gray and not clickable
                          : "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer" // Available slots are green and clickable
                      }`}
                    >
                      <div>
                        <span className="font-medium">{slot.start} - {slot.end}</span>
                        <div className="text-xs">
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)} {/* Capitalize first letter */}
                        </div>
                      </div>
                      {slot.status === "available" && ( // Only show block button for available slots
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
      <ToastContainer /> {/* Toast notifications container */}
    </div>
  );
}








// // src/pages/AdminDashboard.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { Link, Routes, Route, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Import the separated components for each section
// import AllUsers from "../components/admin/AllUsers";
// import AllCourts from "../components/admin/AllCourts";
// import AllBookings from "../components/admin/AllBookings";
// // Import the new EditUserModal component
// import EditUserModal from "../components/admin/EditUserModal";

// export default function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const [courts, setCourts] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for modal visibility
//   const [currentUserToEdit, setCurrentUserToEdit] = useState(null); // State to hold user data for editing

//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   // Fetches all admin-related data (users, courts, bookings)
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const headers = { Authorization: `Bearer ${token}` };

//       const [userRes, courtRes, bookingRes] = await Promise.all([
//         axios.get("http://localhost:5000/api/admin/users", { headers }),
//         axios.get("http://localhost:5000/api/admin/courts", { headers }),
//         axios.get("http://localhost:5000/api/bookings/court-bookings", { headers }),
//       ]);

//       setUsers(userRes.data);
//       setCourts(courtRes.data);

//       // --- NEW: Sort bookings by date in descending order (most recent first) ---
//       const sortedBookings = bookingRes.data.sort((a, b) => {
//         // Assuming your booking objects have a 'createdAt' or 'bookingDate' field
//         // If your date field is different, replace 'createdAt' with the correct field name
//         const dateA = new Date(a.createdAt || a.bookingDate);
//         const dateB = new Date(b.createdAt || b.bookingDate);
//         return dateB - dateA; // For descending order (newest first)
//       });
//       setBookings(sortedBookings);
//       // --- END NEW ---

//     } catch (error) {
//       console.error("Failed to load admin data:", error);
//       toast.error("Unauthorized or failed to load data. Please login as admin.");
//       navigate("/login");
//     } finally {
//       setLoading(false);
//     }
//   }, [token, navigate]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- Handlers for Court Actions ---
//   const handleApprove = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/admin/courts/approve/${id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setCourts(
//         courts.map((court) =>
//           court._id === id ? { ...court, isApproved: true } : court
//         )
//       );
//       toast.success("Court approved successfully! Owner has been notified via email.");
//     } catch (err) {
//       console.error("Approve failed:", err);
//       toast.error("Failed to approve court.");
//     }
//   };

//   const handleReject = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/admin/courts/reject/${id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setCourts(
//         courts.map((court) =>
//           court._id === id ? { ...court, isApproved: false } : court
//         )
//       );
//       toast.info("Court rejected successfully!");
//     } catch (err) {
//       console.error("Reject failed:", err);
//       toast.error("Failed to reject court.");
//     }
//   };

//   // --- Handlers for User Actions ---

//   // Modified handleDelete to use Toastify for confirmation
//   const handleDelete = (userId) => {
//     toast.warn(
//       (
//         <div>
//           <p className="mb-2">Are you sure you want to delete this user? This action cannot be undone.</p>
//           <button
//             onClick={async () => {
//               toast.dismiss(); // Dismiss the current toast
//               try {
//                 await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
//                   headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setUsers(users.filter((u) => u._id !== userId));
//                 toast.success("User deleted successfully!");
//               } catch (err) {
//                 console.error("Delete failed:", err);
//                 toast.error("Failed to delete user. Please try again.");
//               }
//             }}
//             className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mr-2"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => toast.dismiss()} // Dismiss the toast if canceled
//             className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
//           >
//             Cancel
//           </button>
//         </div>
//       ),
//       {
//         autoClose: false, // Don't auto-close, wait for user action
//         closeButton: false, // Hide the default close button
//         draggable: false, // Prevent dragging
//       }
//     );
//   };


//   // Modified handleEdit to open the modal
//   const handleEdit = (user) => {
//     setCurrentUserToEdit(user);
//     setIsEditModalOpen(true);
//   };

//   // Function to handle saving edited user data from the modal
//   const handleSaveEditedUser = async (updatedUser) => {
//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/admin/users/${updatedUser._id}`,
//         {
//           name: updatedUser.name,
//           email: updatedUser.email,
//           phone: updatedUser.phone,
//           role: updatedUser.role,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setUsers(users.map((u) => (u._id === updatedUser._id ? res.data.user : u)));
//       toast.success("User updated successfully!");
//       setIsEditModalOpen(false); // Close modal on success
//       setCurrentUserToEdit(null);
//     } catch (err) {
//       console.error("Update failed:", err.response ? err.response.data : err);
//       toast.error("Failed to update user. " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Close modal handler
//   const handleCloseEditModal = () => {
//     setIsEditModalOpen(false);
//     setCurrentUserToEdit(null);
//   };

//   if (loading) {
//     return <p className="text-center mt-10 text-lg font-medium">Loading admin dashboard data...</p>;
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100 mt-25">
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

//       {/* Render the EditUserModal if it's open */}
//       {isEditModalOpen && (
//         <EditUserModal
//           user={currentUserToEdit}
//           onClose={handleCloseEditModal}
//           onSave={handleSaveEditedUser}
//         />
//       )}

//       {/* Sidebar Navigation */}
//       <aside className="w-64 bg-gradient-to-r from-[#FF7D29] to-[#FFBF78] text-white p-6 shadow-lg">
//         <h1 className="text-3xl font-extrabold mb-10 text-center text-[#7B4019]">Admin Panel</h1>
//         <nav>
//           <ul>
//             <li className="mb-4">
//               <Link
//                 to="/admin-dashboard/users"
//                 className="block text-xl py-2 px-4 rounded transition duration-300 hover:bg-[#7B4019] text-[#7B4019] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 All Users
//               </Link>
//             </li>
//             <li className="mb-4">
//               <Link
//                 to="/admin-dashboard/courts"
//                 className="block text-xl py-2 px-4 rounded transition duration-300 hover:bg-[#7B4019] text-[#7B4019] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Court Approvals
//               </Link>
//             </li>
//             <li className="mb-4">
//               <Link
//                 to="/admin-dashboard/bookings"
//                 className="block text-xl py-2 px-4 rounded transition duration-300 hover:bg-[#7B4019] text-[#7B4019] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 All Bookings
//               </Link>
//             </li>
//             {/* Logout Button */}
//             {/* <li className="mt-8">
//               <button
//                 onClick={() => {
//                   localStorage.removeItem("token");
//                   navigate("/login");
//                   toast.info("You have been logged out.");
//                 }}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 Logout
//               </button>
//             </li> */}
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50 overflow-auto">
//         <div className="bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50 p-6 rounded-lg shadow-md min-h-full">
//           <Routes>
//             <Route path="/" element={
//               <div className="text-center py-10">
//                 <h2 className="text-3xl font-bold mb-4 text-[#7B4019]">Welcome to Admin Dashboard!</h2>
//                 <p className="text-lg text-[#FF7D29]">Select an option from the sidebar to manage users, courts, or bookings.</p>
//               </div>
//             } />
//             <Route path="users" element={<AllUsers users={users} handleDelete={handleDelete} handleEdit={handleEdit} />} />
//             <Route path="courts" element={<AllCourts courts={courts} handleApprove={handleApprove} handleReject={handleReject} />} />
//             <Route path="bookings" element={<AllBookings bookings={bookings} />} />
//           </Routes>
//         </div>
//       </main>
//     </div>
//   );
// }








// // src/pages/AdminDashboard.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { Link, Routes, Route, useNavigate } from "react-router-dom";

// // Import the separated components for each section
// import AllUsers from "../components/admin/AllUsers";
// import AllCourts from "../components/admin/AllCourts";
// import AllBookings from "../components/admin/AllBookings";

// export default function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const [courts, setCourts] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   // Fetches all admin-related data (users, courts, bookings)
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const headers = { Authorization: `Bearer ${token}` };

//       // Use Promise.all to fetch all data concurrently
//       const [userRes, courtRes, bookingRes] = await Promise.all([
//         axios.get("http://localhost:5000/api/admin/users", { headers }),
//         axios.get("http://localhost:5000/api/admin/courts", { headers }),
//         axios.get("http://localhost:5000/api/bookings/court-bookings", { headers }),
//       ]);

//       setUsers(userRes.data);
//       setCourts(courtRes.data);
//       setBookings(bookingRes.data);
//     } catch (error) {
//       console.error("Failed to load admin data:", error);
//       alert("Unauthorized or failed to load data. Please login as admin.");
//       // Redirect to login page if data fetching fails (e.g., unauthorized)
//       navigate("/login");
//     } finally {
//       setLoading(false);
//     }
//   }, [token, navigate]); // Dependencies for useCallback: re-create if token or navigate changes

//   // Call fetchData when the component mounts or its dependencies change
//   useEffect(() => {
//     fetchData();
//   }, [fetchData]); // Dependency for useEffect: re-run if fetchData function reference changes

//   // --- Handlers for Court Actions ---
//   const handleApprove = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/admin/courts/approve/${id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       // Update the state to reflect the approval
//       setCourts(
//         courts.map((court) =>
//           court._id === id ? { ...court, isApproved: true } : court
//         )
//       );
//       alert("Court approved successfully! Owner has been notified via email.");
//     } catch (err) {
//       console.error("Approve failed:", err);
//       alert("Failed to approve court.");
//     }
//   };

//   const handleReject = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/admin/courts/reject/${id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       // Update the state to reflect the rejection
//       setCourts(
//         courts.map((court) =>
//           court._id === id ? { ...court, isApproved: false } : court
//         )
//       );
//       alert("Court rejected successfully!");
//     } catch (err) {
//       console.error("Reject failed:", err);
//       alert("Failed to reject court.");
//     }
//   };

//   // --- Handlers for User Actions ---
//   const handleDelete = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // Remove the deleted user from state
//       setUsers(users.filter((u) => u._id !== userId));
//       alert("User deleted successfully!");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Failed to delete user. Please try again.");
//     }
//   };

//   const handleEdit = async (user) => {
//     const name = prompt("Enter new name:", user.name);
//     const email = prompt("Enter new email:", user.email);
//     const phone = prompt("Enter new phone:", user.phone);
//     const role = prompt("Enter new role (player/admin/court_owner):", user.role);

//     // Validate inputs
//     if (!name || !email || !phone || !role) {
//       alert("All fields are required for update.");
//       return;
//     }
//     if (!["player", "admin", "court_owner"].includes(role.toLowerCase())) {
//         alert("Invalid role. Please enter 'player', 'admin', or 'court_owner'.");
//         return;
//     }

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/admin/users/${user._id}`,
//         { name, email, phone, role: role.toLowerCase() }, // Ensure role is lowercase
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Update the user in state with the new data
//       setUsers(users.map((u) => (u._id === user._id ? res.data.user : u)));
//       alert("User updated successfully!");
//     } catch (err) {
//       console.error("Update failed:", err.response ? err.response.data : err);
//       alert("Failed to update user. " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Display a loading message while data is being fetched
//   if (loading) {
//     return <p className="text-center mt-10 text-lg font-medium">Loading admin dashboard data...</p>;
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100 mt-25"> {/* Note: mt-25 might not be a standard Tailwind class */}
//       {/* Sidebar Navigation */}
//       <aside className="w-64 bg-gray-800 text-white p-6 shadow-lg">
//         <h1 className="text-3xl font-extrabold mb-10 text-center text-blue-300">Admin Panel</h1>
//         <nav>
//           <ul>
//             <li className="mb-4">
//               {/* These links use absolute paths now to avoid nested URL issues */}
//               <Link
//                 to="/admin-dashboard/users"
//                 className="block text-lg py-2 px-4 rounded transition duration-300 hover:bg-gray-700 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 All Users
//               </Link>
//             </li>
//             <li className="mb-4">
//               <Link
//                 to="/admin-dashboard/courts"
//                 className="block text-lg py-2 px-4 rounded transition duration-300 hover:bg-gray-700 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Court Approvals
//               </Link>
//             </li>
//             <li className="mb-4">
//               <Link
//                 to="/admin-dashboard/bookings"
//                 className="block text-lg py-2 px-4 rounded transition duration-300 hover:bg-gray-700 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 All Bookings
//               </Link>
//             </li>
//             {/* Logout Button */}
//             <li className="mt-8">
//               <button
//                 onClick={() => {
//                   localStorage.removeItem("token");
//                   navigate("/login");
//                 }}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 Logout
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content Area where different sections will render */}
//       <main className="flex-1 p-8 bg-gray-100 overflow-auto">
//         <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
//           <Routes>
//             {/* Default route when at /admin-dashboard */}
//             <Route path="/" element={
//               <div className="text-center py-10">
//                 <h2 className="text-3xl font-bold mb-4 text-gray-700">Welcome to Admin Dashboard!</h2>
//                 <p className="text-lg text-gray-600">Select an option from the sidebar to manage users, courts, or bookings.</p>
//               </div>
//             } />

//             {/* These paths remain relative because they are within the <Routes> component */}
//             <Route path="users" element={<AllUsers users={users} handleDelete={handleDelete} handleEdit={handleEdit} />} />
//             <Route path="courts" element={<AllCourts courts={courts} handleApprove={handleApprove} handleReject={handleReject} />} />
//             <Route path="bookings" element={<AllBookings bookings={bookings} />} />
//           </Routes>
//         </div>
//       </main>
//     </div>
//   );
// }









