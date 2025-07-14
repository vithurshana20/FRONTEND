// // src/components/admin/AllBookings.jsx
// import React, { useState } from 'react'; // Import useState

// export default function AllBookings({ bookings }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 12; // Display 12 bookings per page

//   // Calculate the total number of pages
//   const totalPages = Math.ceil(bookings.length / itemsPerPage);

//   // Calculate the bookings to display on the current page
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem); // Use currentBookings

//   // Function to change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <section>
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">All Court Bookings</h2>
//       {bookings.length === 0 ? (
//         <p className="text-gray-600">No bookings found.</p>
//       ) : (
//         <> {/* Use a React Fragment to wrap the table and pagination */}
//           <table className="w-full text-left border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-3 border border-gray-300 text-gray-700">Court Name</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Location</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Player Name</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Player Email</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Booking Date</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Start Time</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">End Time</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentBookings.map((b) => ( // Render only currentBookings
//                 <tr key={b._id} className="border-t border-gray-300 hover:bg-gray-50">
//                   <td className="p-3 border border-gray-300">{b.court?.name || "N/A"}</td>
//                   <td className="p-3 border border-gray-300">{b.court?.location || "N/A"}</td>
//                   <td className="p-3 border border-gray-300">{b.player?.name || "N/A"}</td>
//                   <td className="p-3 border border-gray-300">{b.player?.email || "N/A"}</td>
//                   <td className="p-3 border border-gray-300">{b.bookingDate}</td>
//                   <td className="p-3 border border-gray-300">{b.start}</td>
//                   <td className="p-3 border border-gray-300">{b.end}</td>
//                   <td className="p-3 border border-gray-300 capitalize">{b.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination Controls */}
//           {totalPages > 1 && ( // Only show controls if there's more than 1 page
//             <div className="flex justify-center mt-6 space-x-2">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Previous
//               </button>
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i + 1}
//                   onClick={() => paginate(i + 1)}
//                   className={`px-4 py-2 rounded-md ${
//                     currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// }




// src/components/admin/AllBookings.jsx
import React, { useState } from 'react';

export default function AllBookings({ bookings }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Display 12 bookings per page

  // Helper function to format date/time for display
  const formatDateTimeDisplay = (dateString, timeString) => {
    if (!dateString || !timeString) return "N/A";
    try {
      // Create a Date object assuming local time if no timezone is provided
      // If your backend provides ISO strings with 'Z' or timezone offset,
      // Date.parse will handle it correctly.
      const combinedDateTimeString = `${dateString}T${timeString}:00`;
      const date = new Date(combinedDateTimeString);
      if (isNaN(date.getTime())) {
          return "Invalid Date";
      }
      return date.toLocaleString(); // Formats to local date and time
    } catch (error) {
      console.error("Error formatting date/time:", error);
      return "N/A";
    }
  };

  // Helper function to get a comparable Date object for status check
  // Assumes booking has 'bookingDate' (e.g., 'YYYY-MM-DD') and 'end' (e.g., 'HH:MM')
  const getBookingEndDateObject = (booking) => {
    if (!booking.bookingDate || !booking.end) return null;
    try {
      // Combine date and end time to create a full datetime string
      const combinedEndDateTimeString = `${booking.bookingDate}T${booking.end}:00`;
      const endDate = new Date(combinedEndDateTimeString);
      if (isNaN(endDate.getTime())) {
        return null;
      }
      return endDate;
    } catch (error) {
      console.error("Error creating end date object:", error);
      return null;
    }
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  // Calculate the bookings to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">All Court Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border border-gray-300 text-gray-700">Court Name</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Location</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Player Name</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Player Email</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Booking Date</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Start Time</th>
                  <th className="p-3 border border-gray-300 text-gray-700">End Time</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((b) => {
                  const bookingEndDateObj = getBookingEndDateObject(b);
                  const isExpired = bookingEndDateObj ? bookingEndDateObj < new Date() : false;
                  const isCancelled = b.status?.toLowerCase() === 'cancelled';

                  let rowClass = "text-green-600 font-medium"; // Default: Active/Upcoming (Green)
                  if (isCancelled) {
                    rowClass = "text-red-600 font-medium"; // Cancelled (Red)
                  } else if (isExpired) {
                    rowClass = "text-gray-500"; // Expired (Ash/Gray)
                  }

                  return (
                    <tr key={b._id} className={`border-t border-gray-300 hover:bg-gray-50 ${rowClass}`}>
                      <td className="p-3 border border-gray-300">{b.court?.name || "N/A"}</td>
                      <td className="p-3 border border-gray-300">{b.court?.location || "N/A"}</td>
                      <td className="p-3 border border-gray-300">{b.player?.name || "N/A"}</td>
                      <td className="p-3 border border-gray-300">{b.player?.email || "N/A"}</td>
                      <td className="p-3 border border-gray-300">{b.bookingDate}</td>
                      <td className="p-3 border border-gray-300">{b.start}</td>
                      <td className="p-3 border border-gray-300">{b.end}</td>
                      <td className="p-3 border border-gray-300 capitalize">{b.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
                    currentPage === i + 1 ? 'bg-[#FF7D29] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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