
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, addDays } from "date-fns";

const CalendarGrid = ({ courtId, token }) => {
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
      const res = await axios.get(`/api/bookings/slots?courtId=${courtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      // Update slots locally to reflect booking
      setSlotsByDate((prev) => {
        const newSlots = { ...prev };
        newSlots[date] = newSlots[date].map((slot) =>
          slot.start === start && slot.end === end
            ? { ...slot, status: "booked" }
            : slot
        );
        return newSlots;
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate next 7 days labels
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const dateObj = addDays(new Date(), i);
    next7Days.push({
      dateStr: format(dateObj, "yyyy-MM-dd"),
      label: format(dateObj, "EEE, MMM d"),
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Book a Court Slot</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>
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
            {!slotsByDate || Object.keys(slotsByDate).length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">Loading slots...</td>
              </tr>
            ) : (
              Array.from({ length: 16 }).map((_, i) => {
                const startHour = 6 + i;
                const start = `${startHour.toString().padStart(2, "0")}:00`;
                const end = `${(startHour + 1).toString().padStart(2, "0")}:00`;
                const timeLabel = `${start} - ${end}`;

                return (
                  <tr key={timeLabel}>
                    <td className="border border-black px-3 py-2 font-semibold">{timeLabel}</td>
                    {next7Days.map(({ dateStr }) => {
                      const slots = slotsByDate && typeof slotsByDate === "object" ? slotsByDate[dateStr] || [] : [];
                      const slot = slots.find((s) => s.start === start && s.end === end);
                      const status = slot?.status || "available";

                      return (
                        <td key={dateStr} className="border border-black px-2 py-1">
                          {status === "available" ? (
                            <button
                              disabled={bookingLoading}
                              className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded"
                              onClick={() => {
                                setSelectedSlot({ date: dateStr, start, end });
                                setShowModal(true);
                              }}
                            >
                              Available
                            </button>
                          ) : (
                            <button disabled className="bg-gray-400 text-black px-2 py-1 rounded cursor-not-allowed">
                              Booked
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Modal should be outside the table */}
     {showModal && selectedSlot && (
<div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backdropFilter: "blur(5px)" }}
  >    <div className="bg-[#00332e]  text-white rounded-lg shadow-xl p-6 w-full max-w-md">
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




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { format, addDays } from "date-fns";
// import { loadStripe } from "@stripe/stripe-js";
// // ✅ Use your publishable key here, NOT secret key
// const stripePromise = loadStripe("pk_test_51RYhzmQrTfa5cfnqwZaro0xjtztIzWsE1MRV0WoWEck3s8qHWG3dvVIYtHsbph9tjbVBrT4vKWY1lRnlYwFzQpcL00wcRaHEjk");

// const CalendarGrid = ({ courtId, token }) => {
//   const [slotsByDate, setSlotsByDate] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);

//   useEffect(() => {
//     const fetchSlots = async () => {
//       if (!courtId) return;
//       setLoading(true);
//       try {
//         const res = await axios.get(`/api/bookings/slots?courtId=${courtId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setSlotsByDate(res.data.slotsByDate);
//       } catch (err) {
//         setMessage("Error fetching slots");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSlots();
//   }, [courtId]);

//   const handleStripePayment = async () => {
//     setMessage("Starting payment...");
//     try {
//       const res = await axios.post(
//         "/api/create-payment-intent",
//         {
//           courtId,
//           bookingDate: selectedSlot.date,
//           start: selectedSlot.start,
//           end: selectedSlot.end,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const stripe = await stripePromise;
//       const result = await stripe.confirmCardPayment(res.data.clientSecret, {
//         payment_method: {
//           card: { token: "tok_visa" }, // For testing only. Replace with real card UI later.
//         },
//       });

//       if (result.error) {
//         setMessage(`Payment failed: ${result.error.message}`);
//       } else if (result.paymentIntent.status === "succeeded") {
//         setMessage("Payment successful! Booking confirmed.");

//         // Update slot status
//         setSlotsByDate((prev) => {
//           const updated = { ...prev };
//           updated[selectedSlot.date] = updated[selectedSlot.date].map((slot) =>
//             slot.start === selectedSlot.start && slot.end === selectedSlot.end
//               ? { ...slot, status: "booked" }
//               : slot
//           );
//           return updated;
//         });
//       }
//     } catch (err) {
//       console.error("Stripe error:", err);
//       setMessage("Payment failed. Try again.");
//     } finally {
//       setShowModal(false);
//       setSelectedSlot(null);
//     }
//   };

//   const next7Days = Array.from({ length: 7 }, (_, i) => {
//     const dateObj = addDays(new Date(), i);
//     return {
//       dateStr: format(dateObj, "yyyy-MM-dd"),
//       label: format(dateObj, "EEE, MMM d"),
//     };
//   });

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Book a Court Slot</h2>

//       {message && (
//         <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>
//       )}

//       {loading ? (
//         <p>Loading slots...</p>
//       ) : (
//         <table className="table-auto border-collapse border border-gray-300 w-full text-center">
//           <thead>
//             <tr>
//               <th className="border border-gray-300 px-2 py-1">Time</th>
//               {next7Days.map(({ label }) => (
//                 <th key={label} className="border border-gray-300 px-2 py-1">
//                   {label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {Array.from({ length: 16 }).map((_, i) => {
//               const startHour = 6 + i;
//               const start = `${startHour.toString().padStart(2, "0")}:00`;
//               const end = `${(startHour + 1).toString().padStart(2, "0")}:00`;
//               const timeLabel = `${start} - ${end}`;

//               return (
//                 <tr key={timeLabel}>
//                   <td className="border border-gray-300 px-2 py-1 font-semibold">{timeLabel}</td>
//                   {next7Days.map(({ dateStr }) => {
//                     const slots = slotsByDate[dateStr] || [];
//                     const slot = slots.find((s) => s.start === start && s.end === end);
//                     const status = slot?.status || "available";

//                     return (
//                       <td key={dateStr} className="border border-gray-300 px-2 py-1">
//                         {status === "available" ? (
//                           <button
//                             onClick={() => {
//                               setSelectedSlot({ date: dateStr, start, end });
//                               setShowModal(true);
//                             }}
//                             className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
//                           >
//                             Book
//                           </button>
//                         ) : (
//                           <span className="bg-gray-400 text-white px-2 py-1 rounded">
//                             Booked
//                           </span>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}

//       {/* Modal */}
//       {showModal && selectedSlot && (
//         <div
//           className="fixed inset-0 flex items-center justify-center z-50"
//           style={{ backdropFilter: "blur(5px)" }}
//         >
//           <div className="bg-white text-black rounded-lg shadow-xl p-6 w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
//             <p className="mb-6">
//               Pay and book this slot:{" "}
//               <strong>{selectedSlot.start} - {selectedSlot.end}</strong> on{" "}
//               <strong>{selectedSlot.date}</strong>?
//             </p>
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setSelectedSlot(null);
//                 }}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleStripePayment}
//                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
//               >
//                 Pay & Book
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CalendarGrid;
