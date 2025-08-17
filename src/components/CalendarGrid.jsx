import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, addDays } from "date-fns";
// import emailjs from '@emailjs/browser';

const CalendarGrid = ({ courtId, token, isOwner = false }) => {
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchSlots = async () => {
    if (!courtId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/bookings/slots?courtId=${courtId}&asOwner=${isOwner}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlotsByDate(res.data.slotsByDate);
    } catch (err) {
      setMessage("Error fetching slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [courtId]);

  const bookSlot = async (date, start, end) => {
    setBookingLoading(true);
    setMessage("");
    try {
      await axios.post(
        "/api/bookings/book",
        { courtId, bookingDate: date, start, end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Your booking is confirmed!");
      updateSlotStatus(date, start, end, "booked");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const blockSlot = async (date, start, end) => {
    setBookingLoading(true);
    setMessage("");
    try {
      await axios.post(
        "/api/bookings/block-slot",
        { courtId, date, start, end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Slot blocked successfully!");
      // Fetch latest slots from backend to get updated status
      await fetchSlots();
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || "Failed to block slot");
    } finally {
      setBookingLoading(false);
    }
  };
      //cancel booking
  const cancelBooking = async (date, start, end) => {
    setBookingLoading(true);
    try {
      await axios.put( 
        "/api/bookings/cancel",
        { headers: { Authorization: `Bearer ${token}` } }
        );  }
    catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setBookingLoading(false);
      // Update the slot status to available after cancellation
      updateSlotStatus(date, start, end, "available");
    }
  };  


  const updateSlotStatus = (date, start, end, newStatus) => {
    setSlotsByDate((prev) => {
      const updated = { ...prev };
      updated[date] = updated[date].map((slot) =>
        slot.start === start && slot.end === end
          ? { ...slot, status: newStatus }
          : slot
      );
      return updated;
    });
  };

  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const dateObj = addDays(new Date(), i);
    return {
      dateStr: format(dateObj, "yyyy-MM-dd"),
      label: format(dateObj, "EEE, MMM d"),
    };
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">
        {isOwner ? "Manage Availability" : "Book a Court Slot"}
      </h2>

      {message && (
        <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading slots...</p>
      ) : (
        <table className="table-auto border-collapse border border-black w-full text-center text-black">
          <thead>
            <tr>
              <th className="border border-black px-3 py-2">Time</th>
              {next7Days.map(({ label }) => (
                <th key={label} className="border border-black px-3 py-2">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 16 }).map((_, i) => {
              const startHour = 6 + i;
              const start = `${startHour.toString().padStart(2, "0")}:00`;
              const end = `${(startHour + 1).toString().padStart(2, "0")}:00`;
              const label = `${start} - ${end}`;

              return (
                <tr key={label}>
                  <td className="border border-black px-3 py-2 font-semibold">
                    {label}
                  </td>
                  {next7Days.map(({ dateStr }) => {
                    const slots = slotsByDate[dateStr] || [];
                    const slot = slots.find(
                      (s) => s.start === start && s.end === end
                    );
                    const status = slot?.status || "available";

                    return (
                      <td key={dateStr} className="border border-black px-2 py-1">
                        {status === "available" ? (
                          isOwner ? (
                            <button
                              onClick={() => blockSlot(dateStr, start, end)}
                              disabled={bookingLoading}
                              className="bg-yellow-100 hover:bg-yellow-400 text-black px-2 py-1 rounded"
                            >
                              Block Slot
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSlot({ date: dateStr, start, end });
                                setShowModal(true);
                              }}
                              disabled={bookingLoading}
                              className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded"
                            >
                              Available
                            </button>
                          )
                        ) : status === "blocked" ? (
                          <span className="bg-red-500 text-white px-2 py-1 rounded" title="Blocked by court owner">
                            🔒 Blocked
                          </span>
                        ) : (
                          <span className="bg-gray-400 text-white px-2 py-1 rounded">
                            Booked
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Only players see modal */}
      {showModal && selectedSlot && !isOwner && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(5px)" }}
        >
          <div className="bg-[#00332e] text-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
            <p className="mb-6">
              Do you want to book this slot:{" "}
              <strong>{selectedSlot.start} - {selectedSlot.end}</strong> on{" "}
              <strong>{selectedSlot.date}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await bookSlot(selectedSlot.date, selectedSlot.start, selectedSlot.end);
                  setShowModal(false);
                  setSelectedSlot(null);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                disabled={bookingLoading}
              >
                {bookingLoading ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;




