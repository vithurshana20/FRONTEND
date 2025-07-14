// src/components/admin/AllUsers.jsx
import React, { useState } from 'react';

export default function AllUsers({ users, handleEdit, handleDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Display 12 users per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Calculate the users to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">All Users</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border border-gray-300 text-gray-700">Name</th>
                <th className="p-3 border border-gray-300 text-gray-700">Email</th>
                <th className="p-3 border border-gray-300 text-gray-700">Role</th>
                <th className="p-3 border border-gray-300 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => ( // Use currentUsers for rendering
                <tr key={user._id} className="border-t border-gray-300 hover:bg-gray-50">
                  <td className="p-3 border border-gray-300">{user.name}</td>
                  <td className="p-3 border border-gray-300">{user.email}</td>
                  <td className="p-3 border border-gray-300">{user.role}</td>
                  <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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