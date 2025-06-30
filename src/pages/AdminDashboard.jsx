import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, courtRes, bookingRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", { headers }),
          axios.get("http://localhost:5000/api/admin/courts", { headers }),
          axios.get("http://localhost:5000/api/bookings/court-bookings", { headers }),
        ]);

        setUsers(userRes.data);
        setCourts(courtRes.data);
        setBookings(bookingRes.data);
      } catch (error) {
        console.error("Failed to load admin data:", error);
        alert("Unauthorized. Please login as admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/courts/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourts(courts.map((c) => (c._id === id ? { ...c, isApproved: true } : c)));
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/courts/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourts(courts.map((c) => (c._id === id ? { ...c, isApproved: false } : c)));
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = async (user) => {
    const name = prompt("Enter new name:", user.name);
    const email = prompt("Enter new email:", user.email);
    const phone = prompt("Enter new phone:", user.phone);
    const role = prompt("Enter new role (player/admin/court_owner):", user.role);

    if (!name || !email || !phone || !role) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${user._id}`,
        { name, email, phone, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u._id === user._id ? res.data.user : u)));
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update user.");
    }
  };

  if (loading) return <p className="text-center mt-8">Loading dashboard...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 mt-1">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#00332e] text-white p-6 space-y-6 mt-15">

        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "users" ? "bg-lime-500 text-black font-semibold" : "hover:bg-gray-700"}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("courts")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "courts" ? "bg-lime-500 text-black font-semibold" : "hover:bg-gray-700"}`}
          >
            Court Management
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "bookings" ? "bg-lime-500 text-black font-semibold" : "hover:bg-gray-700"}`}
          >
            Booking Management
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "users" && (
          <section>
            <h2 className="text-xl font-bold mb-4">All Users</h2>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(user._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "courts" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Court Management</h2>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Court</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Owner</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courts.map((court) => (
                  <tr key={court._id} className="border-t">
                    <td className="p-2">{court.name}</td>
                    <td className="p-2">{court.location}</td>
                    <td className="p-2">{court.owner?.name || "N/A"}</td>
                    <td className="p-2">
                      {court.isApproved ? (
                        <span className="text-green-600 font-bold">Approved</span>
                      ) : (
                        <span className="text-red-600 font-bold">Pending</span>
                      )}
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleApprove(court._id)} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                      <button onClick={() => handleReject(court._id)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "bookings" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Booking Management</h2>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Court</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Player</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Start</th>
                  <th className="p-2">End</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="p-2">{b.court?.name || "N/A"}</td>
                    <td className="p-2">{b.court?.location || "N/A"}</td>
                    <td className="p-2">{b.player?.name || "N/A"}</td>
                    <td className="p-2">{b.player?.email || "N/A"}</td>
                    <td className="p-2">{b.bookingDate}</td>
                    <td className="p-2">{b.start}</td>
                    <td className="p-2">{b.end}</td>
                    <td className="p-2 capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
