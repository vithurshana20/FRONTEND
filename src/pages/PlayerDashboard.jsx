import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CourtCard from '../components/court-card.jsx';
// import BookingModal from '../components/booking-modal.jsx';

const PlayerDashboard = () => {
  const [courts, setCourts] = useState([]);
  const [player, setPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourtsAndUser = async () => {
      try {
        if (!token) throw new Error('No auth token found');

        const headers = { Authorization: `Bearer ${token}` };

        const [courtRes, userRes] = await Promise.all([
          axios.get('/api/courts', { headers }),
          axios.get('http://localhost:5000/api/auth/profile', { headers }),
        ]);

        const courtData = Array.isArray(courtRes.data)
          ? courtRes.data
          : courtRes.data.data || [];

        setCourts(courtData);
        setPlayer(userRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        alert('Error loading dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourtsAndUser();
  }, [token]);

  const handleBookClick = async (court) => {
    try {
      const selectedDate = new Date().toISOString().split('T')[0];

      const res = await axios.get('/api/bookings/slots', {
        headers: { Authorization: `Bearer ${token}` },
        params: { courtId: court._id, date: selectedDate },
      });

      const availableSlots = res.data.slots?.filter((s) => s.status === 'available') || [];
      setBookingInfo({ court, date: selectedDate, slots: availableSlots });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching slots:', err);
      alert('Failed to fetch slots.');
    }
  };

  const handleConfirmBooking = async (slot) => {
    try {
      await axios.post(
        'http://localhost:5000/api/bookings/book',
        {
          courtId: bookingInfo.court._id,
          bookingDate: bookingInfo.date,
          start: slot.start,
          end: slot.end,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Booking successful!');
    } catch (err) {
      console.error('Booking failed:', err);
      alert(err?.response?.data?.message || 'Booking failed');
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading)
    return <div className="text-center text-white py-10">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-white text-black w-full">
    

      <section className="w-full px-4 md:px-10 py-25">
        <div className="bg-[#00332e] p-4 rounded shadow text-white mb-10 w-full">
          <h2 className="text-2xl font-bold">Welcome, {player?.name || 'Player'}</h2>
          <p>Book your courts and enjoy the game!</p>
        </div>

        <h3 className="text-xl font-semibold mb-4">Available Courts</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {courts.length > 0 ? (
            courts.map((court) => (
              <CourtCard key={court._id} court={court} onBook={() => handleBookClick(court)} />
            ))
          ) : (
            <p className="text-white col-span-full">No courts available.</p>
          )}
        </div>
      </section>

      {/* <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slots={bookingInfo?.slots || []}
        court={bookingInfo?.court}
        onConfirm={handleConfirmBooking}
      /> */}
    </div>
  );
};

export default PlayerDashboard;
