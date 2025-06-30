import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function PlayerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register/player", {
        name,
        email,
        password,
        phone: "0000000000",
        role: "player",
      });

      alert("Player registration successful!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="bg-[#00332e] text-white p-8 rounded-xl shadow-md w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Player Registration</h2>

        <form onSubmit={handleRegister} className="space-y-3">
          <label className="text-l">User name</label>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-full bg-white text-black"
          />
          <label className="text-l">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-full bg-white text-black"
          />
          <label className="text-l">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-full bg-white text-black"
          />
          <label className="text-l">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-full bg-white text-black"
          />

          <button
            type="submit"
            className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-2 rounded-full mt-4"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="underline text-white">Login</Link>
        </div>
      </div>
    </div>
  );
}
