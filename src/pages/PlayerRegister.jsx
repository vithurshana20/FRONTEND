import React, { useState } from 'react';
import { User, Shield, Mail, Phone, Lock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterForm() {
  const [role] = useState('player');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert("You must agree to the Terms and Privacy Policy.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/register/player", {
        name,
        email,
        phone,
        password,
        role: "player",
      });
      toast.success("Player registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 px-4 mt-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex justify-center">
          {/* <div className="bg-orange-400 text-white font-bold rounded-xl w-12 h-12 flex items-center justify-center">
            AB
          </div> */}
        </div>
        <h2 className="text-center text-2xl font-bold text-orange-600">Join EZCO</h2>
        <p className="text-center text-gray-500">Create your account and start booking</p>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <User size={16} className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email Address</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Mail size={16} className="mr-2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Phone size={16} className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your phone number"
                className="w-full outline-none"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Lock size={16} className="mr-2 text-gray-400" />
              <input
                type="password"
                placeholder="Create a password"
                className="w-full outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Lock size={16} className="mr-2 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full outline-none"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              required
            />
            <span>
              I agree to the <a href="#" className="text-orange-500 underline">Terms of Service</a> and <a href="#" className="text-orange-500 underline">Privacy Policy</a>
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-400 text-white font-semibold py-2 rounded-md shadow-md hover:bg-orange-500 transition"
          >
            Create Player Account
          </button>
        </form>

        <div className="text-center text-gray-500 text-sm">Or sign up with</div>
        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Google
          </button>
          {/* <button className="flex items-center gap-2 border px-4 py-2 rounded-md">
            <img src="https://www.svgrepo.com/show/157810/facebook.svg" className="w-5 h-5" alt="Facebook" />
            Facebook
          </button> */}
        </div>

        <div className="text-center text-sm">
          Already have an account? <a href="/login" className="text-orange-500 font-medium">Sign in here</a>
        </div>
      </div>
    </div>
  );
}















// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";

// export default function PlayerRegister() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:5000/api/auth/register/player", {
//         name,
//         email,
//         password,
//         phone: "0000000000",
//         role: "player",
//       });

//       alert("Player registration successful!");
//       navigate("/login");
//     } catch (err) {
//       alert("Registration failed: " + (err.response?.data?.message || "Server Error"));
//     }
//   };

//   return (
//     <div className="bg-white min-h-screen flex items-center justify-center">
//       <div className="bg-[#00332e] text-white p-8 rounded-xl shadow-md w-[90%] max-w-md">
//         <h2 className="text-2xl font-bold text-center mb-6">Player Registration</h2>

//         <form onSubmit={handleRegister} className="space-y-3">
//           <label className="text-l">User name</label>
//           <input
//             type="text"
//             placeholder="Username"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             className="w-full px-4 py-2 rounded-full bg-white text-black"
//           />
//           <label className="text-l">Email</label>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="w-full px-4 py-2 rounded-full bg-white text-black"
//           />
//           <label className="text-l">Password</label>
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="w-full px-4 py-2 rounded-full bg-white text-black"
//           />
//           <label className="text-l">Confirm Password</label>
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             className="w-full px-4 py-2 rounded-full bg-white text-black"
//           />

//           <button
//             type="submit"
//             className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-2 rounded-full mt-4"
//           >
//             Register
//           </button>
//         </form>

//         <div className="text-center mt-4 text-sm text-gray-300">
//           Already have an account?{" "}
//           <Link to="/login" className="underline text-white">Login</Link>
//         </div>
//       </div>
//     </div>
//   );
// }
