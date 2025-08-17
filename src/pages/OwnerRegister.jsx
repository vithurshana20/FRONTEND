import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Shield } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import courtBackground from "../assets/14.jpg"; // Adjust path to your background image
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar"


export default function CourtOwnerRegisterForm() {
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
      await axios.post("http://localhost:5000/api/auth/register/owner", {
        name,
        email,
        phone,
        password,
        role: "owner",
      });
      toast.success("Court Owner registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <>
    <Navbar/>
    <div 
      className="min-h-screen flex items-center justify-center px-4 mt-10 "
      style={{
        backgroundImage: `url(${courtBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div 
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6"
        style={{
          background: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white overlay
        }}
      >
        <div className="flex justify-center">
          {/* <div className="bg-orange-400 text-white font-bold rounded-xl w-12 h-12 flex items-center justify-center">
            AB
          </div> */}
        </div>
        <h2 className="text-center text-2xl font-bold text-[#004030]">Join as Court Owner</h2>
        <p className="text-center text-gray-900">Register to manage your courts and bookings</p>

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
              I agree to the <a href="#" className="text-[#004030] underline">Terms of Service</a> and <a href="#" className="text-[#004030] underline">Privacy Policy</a>
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004030] text-white font-semibold py-2 rounded-md shadow-md hover:bg-[#4A9782] transition"
          >
            Create Owner Account
          </button>
        </form>

        {/* <div className="text-center text-gray-500 text-sm">Or sign up with</div>
        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Google
          </button>
        </div> */}

        <div className="text-center text-sm">
          Already have an account? <a href="/login" className="text-[#004030] font-medium">Sign in here</a>
        </div>
      </div>
    </div>
    </>
  );
}