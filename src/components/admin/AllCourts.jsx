// // src/components/admin/AllCourts.jsx
// import React, { useState } from 'react';
// import emailjs from '@emailjs/browser';

// export default function AllCourts({ courts, handleApprove, handleReject }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 12; // Display 12 courts per page

//   // Calculate the total number of pages
//   const totalPages = Math.ceil(courts.length / itemsPerPage);

//   // Calculate the courts to display on the current page
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentCourts = courts.slice(indexOfFirstItem, indexOfLastItem);

//   // Function to change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);


 

//   return (
//     <section className="mb-10">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">Court Approvals</h2>
//       {courts.length === 0 ? (
//         <p className="text-gray-600">No courts found requiring approval.</p>
//       ) : (
//         <>



//           <table className="w-full text-left border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-3 border border-gray-300 text-gray-700">Court Name</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Location</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Owner</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Status</th>
//                 <th className="p-3 border border-gray-300 text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentCourts.map((court) => ( // Use currentCourts for rendering
//                 <tr key={court._id} className="border-t border-gray-300 hover:bg-gray-50">
//                   <td className="p-3 border border-gray-300">{court.name}</td>
//                   <td className="p-3 border border-gray-300">{court.location}</td>
//                   <td className="p-3 border border-gray-300">{court.owner?.name || "N/A"}</td>
//                   <td className="p-3 border border-gray-300">
//                     {court.isApproved ? (
//                       <span className="text-green-600 font-bold">Approved</span>
//                     ) : (
//                       <span className="text-red-600 font-bold">Pending</span>
//                     )}
//                   </td>
//                   <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
//                     <button
//                       onClick={() => handleApprove(court._id)}
//                       className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
//                       disabled={court.isApproved}
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleReject(court._id)}
//                       className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
//                       disabled={!court.isApproved && court.isApproved !== undefined}
//                     >
//                       Reject
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
          
          
        

//           {/* Pagination Controls */}
//           {totalPages > 1 && (
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
//                   className={`px-4 py-2 rounded-md ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                     }`}
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


// src/components/admin/AllCourts.jsx
import React, { useState } from 'react';
// emailjs import is here but not used in this specific component for court actions.
// It's likely used in the handleApprove/handleReject in AdminDashboard.jsx
import emailjs from '@emailjs/browser'; // Keep if used elsewhere, remove if only here by mistake

export default function AllCourts({ courts, handleApprove, handleReject }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Display 12 courts per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(courts.length / itemsPerPage);

  // Calculate the courts to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourts = courts.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Court Approvals</h2>
      {courts.length === 0 ? (
        <p className="text-gray-600">No courts found requiring approval.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border border-gray-300 text-gray-700">Court Name</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Location</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Owner</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Status</th>
                  <th className="p-3 border border-gray-300 text-gray-700">Actions</th>
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
                        <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-bold">Approved</span> // Added bg-green-200 for badge look
                      ) : (
                        <span className="bg-orange-200 text-orange-800 py-1 px-3 rounded-full text-xs font-bold">Pending</span> // Using orange for Pending status
                      )}
                    </td>
                    <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
                      {/* Conditional Rendering of Buttons */}
                      {court.isApproved ? (
                        // If approved, show only the Reject button
                        <button
                          onClick={() => handleReject(court._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                        >
                          Reject
                        </button>
                      ) : (
                        // If not approved (pending/rejected), show only the Approve button
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
                  className={`px-4 py-2 rounded-md ${currentPage === i + 1 ? 'bg-[#FF7D29] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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