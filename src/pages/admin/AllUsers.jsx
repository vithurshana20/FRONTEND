


// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function AllUsers({ token }) {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 12;

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(res.data);
//       } catch (err) {
//         console.error("Failed to fetch users", err);
//         setError("Failed to fetch users.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchUsers();
//     } else {
//       setError("Unauthorized. Please log in as admin.");
//       setLoading(false);
//     }
//   }, [token]);

//   const handleDelete = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers((prev) => prev.filter((u) => u._id !== userId));
//       alert("User deleted successfully!");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Failed to delete user.");
//     }
//   };

//   const handleEdit = async (user) => {
//     const name = prompt("Enter new name:", user.name);
//     const email = prompt("Enter new email:", user.email);
//     const phone = prompt("Enter new phone:", user.phone);
//     const role = prompt("Enter new role (player/admin/court_owner):", user.role);

//     if (!name || !email || !phone || !role) {
//       alert("All fields are required.");
//       return;
//     }

//     if (!["player", "admin", "court_owner"].includes(role.toLowerCase())) {
//       alert("Invalid role.");
//       return;
//     }

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/admin/users/${user._id}`,
//         { name, email, phone, role: role.toLowerCase() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setUsers((prev) =>
//         prev.map((u) => (u._id === user._id ? res.data.user : u))
//       );
//       alert("User updated successfully!");
//     } catch (err) {
//       console.error("Update failed:", err);
//       alert("Failed to update user.");
//     }
//   };

//   // Pagination logic
//   const totalPages = Math.ceil(users.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   if (loading) return (
//       <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
//           <p className="text-black text-xl font-bold">Loading Users...</p>
//         </div>
//       </div>
//     );
//   if (error) return <p className="text-center text-red-500">{error}</p>;

//   return (
//     <section className="mb-10">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">All Users</h2>
//       {users.length === 0 ? (
//         <p className="text-gray-600">No users found.</p>
//       ) : (
//         <>
//           <table className="w-full text-left border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-[#4A9782]">
//                 <th className="p-3 border border-gray-300 text-[#004030]">Name</th>
//                 <th className="p-3 border border-gray-300 text-[#004030]">Email</th>
//                 <th className="p-3 border border-gray-300 text-[#004030]">Role</th>
//                 <th className="p-3 border border-gray-300 text-[#004030]">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentUsers.map((user) => (
//                 <tr
//                   key={user._id}
//                   className="border-t border-gray-300 hover:bg-gray-50"
//                 >
//                   <td className="p-3 border border-gray-300">{user.name}</td>
//                   <td className="p-3 border border-gray-300">{user.email}</td>
//                   <td className="p-3 border border-gray-300">{user.role}</td>
//                   <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
//                     <button
//                       onClick={() => handleEdit(user)}
//                       className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(user._id)}
//                       className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
//                     >
//                       Delete
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
//                   className={`px-4 py-2 rounded-md ${
//                     currentPage === i + 1
//                       ? "bg-[#FF7D29] text-white"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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



import React, { useEffect, useState } from "react";
import axios from "axios";
import EditUserModal from "./EditUserModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AllUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 👈 for delete modal

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    } else {
      setError("Unauthorized. Please log in as admin.");
      setLoading(false);
    }
  }, [token]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user.");
    }
    setDeleteConfirm(null); // Close modal
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${updatedUser._id}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? res.data.user : u))
      );
      toast.success("User updated successfully!");
      setEditingUser(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update user.");
    }
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-[#004030] mx-auto"></div>
          <p className="text-black text-xl font-bold">Loading Users...</p>
        </div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="mb-10">
      <ToastContainer />
      <h2 className="text-xl font-semibold mb-4 text-gray-800">All Users</h2>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center space-y-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-gray-600">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#4A9782]">
                <th className="p-3 border border-gray-300 text-[#004030]">Name</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Email</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Role</th>
                <th className="p-3 border border-gray-300 text-[#004030]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
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
                      onClick={() => setDeleteConfirm(user)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
                    currentPage === i + 1
                      ? "bg-[#004030] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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

