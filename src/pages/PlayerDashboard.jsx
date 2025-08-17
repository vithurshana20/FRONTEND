import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search, Filter, MapPin, Star, Heart,
  Calendar, Clock, X,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  addDays,
  format,
  isSameDay,
  isBefore,
} from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlayerDashboard = () => {
  const [courts, setCourts] = useState([]);
  const [player, setPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [justBooked, setJustBooked] = useState(null); // Track the last booked booking ID

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem('token');

  // Custom Confirm Toast Component
  const ConfirmToast = ({ closeToast, bookingId }) => (
    <div className="p-4">
      <p className="mb-4">Are you sure you want to cancel this booking? This action cannot be undone.</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => closeToast()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleCancelBookingConfirmed(bookingId);
            closeToast();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Yes
        </button>
      </div>
    </div>
  );

  // Fetch courts, player profile, and my bookings
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Parallel fetch for courts, player, and bookings
        const [courtsRes, playerRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/courts', { headers }),
          axios.get('http://localhost:5000/api/auth/profile', { headers }),
          axios.get('http://localhost:5000/api/bookings/my-bookings', { headers }),
        ]);

        setCourts(courtsRes.data || []);
        setPlayer(playerRes.data || null);
        setMyBookings(bookingsRes.data || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Date generation helpers
  const generateCurrentMonthDays = () => {
    const days = [];
    let day = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    while (day <= monthEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const isDateInPast = (date) => {
    const today = new Date();
    return isBefore(date, today) && !isSameDay(date, today);
  };

  const hasSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slotsByDate[dateStr] && slotsByDate[dateStr].length > 0;
  };

  // Open booking modal and fetch slots for court
  const handleBookClick = async (court) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/bookings/slots', {
        headers,
        params: { courtId: court._id },
      });
      console.log('Fetched slotsByDate:', res.data.slotsByDate); // Debug log
      setBookingInfo({ court, selectedDate: null });
      setSlotsByDate(res.data.slotsByDate || {});
      setSelectedSlot(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast.error('Failed to fetch slots. Showing default slots.');
      // Fallback to empty slots
      setSlotsByDate({});
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !bookingInfo) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        'http://localhost:5000/api/bookings/book',
        {
          courtId: bookingInfo.court._id,
          bookingDate: selectedSlot.date,
          start: selectedSlot.start,
          end: selectedSlot.end,
        },
        { headers }
      );

      // Re-fetch slots to ensure persistence
      const res = await axios.get('http://localhost:5000/api/bookings/slots', {
        headers,
        params: { courtId: bookingInfo.court._id },
      });
      console.log('Re-fetched slotsByDate after booking:', res.data.slotsByDate); // Debug log
      setSlotsByDate(res.data.slotsByDate || {});

      // Re-fetch my bookings to get the new booking
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/my-bookings', { headers });
      const newBookings = bookingsRes.data || [];
      setMyBookings(newBookings);

      // Set the just booked booking ID (assuming response contains _id or last booking)
      const lastBooking = newBookings.find(b => !myBookings.some(mb => mb._id === b._id));
      setJustBooked(lastBooking?._id || null);

      toast.success('Booking successful!');
      setSelectedSlot(null);
      setBookingInfo((prev) => ({ ...prev, selectedDate: null }));
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error?.response?.data?.message || 'Booking failed');
    }
  };

  // Cancel booking with confirmation via toast
  const handleCancelBooking = (bookingId) => {
    if (!token) {
      toast.error('Authentication required. Please login.');
      return;
    }

    toast.warn(<ConfirmToast bookingId={bookingId} />, {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  // Handle confirmed cancellation
  const handleCancelBookingConfirmed = async (bookingId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`http://localhost:5000/api/bookings/${bookingId}/cancel`, { headers });

      // Re-fetch my bookings to reflect the cancellation
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/my-bookings', { headers });
      setMyBookings(bookingsRes.data || []);

      // Clear justBooked if it was the cancelled booking
      if (justBooked === bookingId) setJustBooked(null);

      toast.success(response.data.message || 'Booking cancelled successfully!');
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking. Check if 30-minute window has passed.');
    }
  };

  // Toggle favorites
  const toggleFavorite = (courtId) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(courtId)) newFavs.delete(courtId);
    else newFavs.add(courtId);
    setFavorites(newFavs);
  };

  // Filter courts based on search term
  const filteredCourts = courts.filter((court) =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourts.length / itemsPerPage);
  const paginatedCourts = filteredCourts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const calendarDays = generateCurrentMonthDays();

  // Calculate active bookings (exclude cancelled)
  const activeBookingsCount = myBookings.filter(booking => booking.status !== 'cancelled').length;

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
    <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome & My Bookings */}
        <div className="bg-[#004030] rounded-2xl p-6 mb-8 text-white shadow-lg mt-20 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {player?.name || 'Player'}! 🏸🎾</h1>
            <p className="text-orange-100">Ready to book your next game?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{activeBookingsCount}</div>
              <div className="text-sm text-orange-100">Total Bookings</div>
            </div>
            <button
              onClick={() => setIsBookingsModalOpen(true)}
              className="bg-white text-[#004030] font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition"
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courts by name or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:[#004030] focus:border-transparent bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border border-[#004030] rounded-xl bg-white hover:bg-[#004030] transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourts.map((court) => {
            const isFullyBooked = court.slots?.length > 0 && court.slots.every((slot) => slot.status === 'booked');

            return (
              <div
                key={court._id}
                className="bg-white rounded-lg shadow-lg"
              >
                <div className="relative h-52 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={court.images?.[0] || 'https://via.placeholder.com/400x300?text=Available'}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl text-[#004030] font-bold mb-1">{court.name}</h3>
                      <div className="flex items-center text-gray-900 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{court.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#4A9782]">Rs.{court.pricePerHour}</div>
                      <div className="text-sm text-gray-900">per hour</div>
                    </div>
                  </div>

                  

                  <p className="text-gray-600 text-sm mb-4">{court.description}</p>

                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                      !isFullyBooked
                        ? 'bg-gradient-to-br from-[#004030] to-[#4A9782] hover:from-[#4A9782] hover:to-[#004030] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300'
                        : 'bg-orange-200 text-orange-400 cursor-not-allowed'
                    }`}
                    disabled={isFullyBooked}
                    onClick={() => handleBookClick(court)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {!isFullyBooked ? 'Book Now' : 'Fully Booked'}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1 ? 'text-gray-900 border-gray-600 cursor-not-allowed' : 'hover:bg-[#4A9782] border-[#4A9782] text-[#004030]'
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === pageNum
                    ? 'bg-[#004030] text-white'
                    : 'border-[#004030]  hover:bg-[#4A9782] text-[#004030]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages ? 'text-gray-900 border-gray-600 cursor-not-allowed' : 'hover:bg-[#4A9782] border-[#4A9782] text-[#004030]'
            }`}
          >
            Next
          </button>
        </div>

        {/* Booking Modal */}
        {isModalOpen && bookingInfo && (
          <div className="fixed inset-0 bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-6">
                <h2 className="text-xl font-bold text-[#004030]">Book {bookingInfo.court.name}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((day, idx) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const disabled = isDateInPast(day);
                    const isSelected = bookingInfo.selectedDate === dayStr;

                    return (
                      <button
                        key={idx}
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            setBookingInfo((prev) => ({ ...prev, selectedDate: dayStr }));
                            setSelectedSlot(null);
                          }
                        }}
                        className={`relative py-2 rounded ${
                          isSelected
                            ? 'bg-[#004030] text-white font-bold'
                            : disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-[#4A9782]'
                        }`}
                      >
                        {format(day, 'd')}

                        {hasSlots(day) && (
                          <span
                            className={`block mx-auto mt-1 w-2 h-2 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#004030]'
                            }`}
                            aria-label="Has available slots"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {bookingInfo.selectedDate && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Slots for {bookingInfo.selectedDate}</h3>
                  {(slotsByDate[bookingInfo.selectedDate] || []).length === 0 ? (
                    <p className="text-gray-500">No time slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {(slotsByDate[bookingInfo.selectedDate] || []).map((slot, idx) => (
                        <button
                          key={idx}
                          disabled={slot.status !== 'available'}
                          onClick={() => setSelectedSlot({ ...slot, date: bookingInfo.selectedDate })}
                          className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                            slot.status === 'booked'
                              ? 'bg-red-100 border-red-200 text-red-700 cursor-not-allowed'
                              : slot.status === 'blocked'
                              ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed'
                              : selectedSlot?.start === slot.start &&
                                selectedSlot?.end === slot.end &&
                                selectedSlot?.date === bookingInfo.selectedDate
                              ? 'bg-[#004030]  text-white'
                              : 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{`${slot.start} - ${slot.end}`}</span>
                          </div>
                          <div className="text-xs font-semibold capitalize">
                            {slot.status === 'booked' ? 'Booked' : slot.status}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedSlot
                      ? 'bg-[#004030] hover:bg-[#4A9782] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Book Now
                </button>
              </div>

              {/* Cancellation Option After Booking */}
              {justBooked && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">You can cancel this booking within 30 minutes (until 06:00 PM today).</p>
                  <button
                    onClick={() => handleCancelBooking(justBooked)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-[1.02] duration-200"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Bookings Modal */}
        {isBookingsModalOpen && (
          <div className="fixed inset-0 bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Bookings</h2>
                <button
                  onClick={() => setIsBookingsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {myBookings.length === 0 ? (
                <p className="text-center text-gray-500">No bookings yet.</p>
              ) : (
                <ul className="space-y-4">
                  {[...myBookings]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort from newest to oldest
                    .map((booking) => {
                      const createdAt = new Date(booking.createdAt);
                      const now = new Date();
                      const diffMinutes = (now - createdAt) / (1000 * 60); // Minutes since creation
                      const isCancellable = diffMinutes <= 30 && booking.status === 'booked';

                      return (
                        <li key={booking._id} className="border rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">{booking.court?.name || 'Unknown Court'}</h3>
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                booking.status === 'booked'
                                  ? 'bg-green-100 text-green-700'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <p>
                            <strong>Date:</strong> {booking.bookingDate}
                          </p>
                          <p>
                            <strong>Time:</strong> {booking.start} - {booking.end}
                          </p>
                          {isCancellable && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {!isCancellable && booking.status === 'booked' && (
                            <p className="mt-2 text-sm text-red-500">Cannot cancel (30 mins passed)</p>
                          )}
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default PlayerDashboard;



















// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';
// import CourtCard from '../components/court-card.jsx';

// const PlayerDashboard = () => {
//   const [courts, setCourts] = useState([]);
//   const [player, setPlayer] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     const fetchCourtsAndUser = async () => {
//       try {
//     const token = localStorage.getItem("token"); // 👈 this was missing
//     if (!token) throw new Error('No auth token found');

//     const headers = { Authorization: `Bearer ${token}` };

//     const [courtRes, userRes] = await Promise.all([
//       axios.get("http://localhost:5000/api/courts", { headers }),
//       axios.get("http://localhost:5000/api/auth/profile", { headers }),
//     ]);

//         const courtData = Array.isArray(courtRes.data)
//           ? courtRes.data
//           : courtRes.data.data || [];

//         setCourts(courtData);
//         setPlayer(userRes.data);
//       } catch (err) {
//         console.error('Failed to load dashboard data:', err);
//         alert('Error loading dashboard. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourtsAndUser();
//   }, [token]);

//   const handleBookClick = async (court) => {
//     try {
//       const selectedDate = new Date().toISOString().split('T')[0];

//       const res = await axios.get('/api/bookings/slots', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { courtId: court._id, date: selectedDate },
//       });

//       // const availableSlots = res.data.slots?.filter((s) => s.status === 'available') || [];
//       const allSlots = res.data.slots || [];
// setBookingInfo({ court, date: selectedDate, slots: allSlots });

//       // setBookingInfo({ court, date: selectedDate, slots: availableSlots });
//       setIsModalOpen(true);
//     } catch (err) {
//       console.error('Error fetching slots:', err);
//       alert('Failed to fetch slots.');
//     }
//   };

//   const handleConfirmBooking = async (slot) => {
//     try {
//       await axios.post(
//         'http://localhost:5000/api/bookings/book',
//         {
//           courtId: bookingInfo.court._id,
//           bookingDate: bookingInfo.date,
//           start: slot.start,
//           end: slot.end,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert('Booking successful!');
//     } catch (err) {
//       console.error('Booking failed:', err);
//       alert(err?.response?.data?.message || 'Booking failed');
//     } finally {
//       setIsModalOpen(false);
//     }
//   };

  

//   if (loading)
//     return <div className="text-center text-white py-10">Loading dashboard...</div>;

//   return (
//     <div className="min-h-screen bg-white text-black w-full">
    

//       <section className="w-full px-4 md:px-10 py-25">
//         <div className="bg-[#00332e] p-4 rounded shadow text-white mb-10 w-full">
//           <h2 className="text-2xl font-bold">Welcome, {player?.name || 'Player'}</h2>
//           <p>Book your courts and enjoy the game!</p>
//         </div>

//         <h3 className="text-xl font-semibold mb-4">Available Courts</h3>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
//           {courts.length > 0 ? (
//             courts.map((court) => (
//               <CourtCard key={court._id} court={court} onBook={() => handleBookClick(court)} />
//             ))
//           ) : (
//             <p className="text-white col-span-full">No courts available.</p>
//           )}
//         </div>
//       </section>

//     </div>
//   );
// };

// export default PlayerDashboard;



