// import { Link } from "react-router-dom";
import React from "react";
import logo from "../assets/EZCO.png"; // Adjust path if needed
import { Link } from "react-router-dom";



export default function Navbar() {


  return (
<header className="fixed top-0 left-0 w-full z-50 bg-[#7B4019] text-white px-6 py-10 flex justify-between items-center shadow-md h-16">
    
      <div className="flex items-center gap-2"> {/* This div now serves as a container for alignment */}
        <img
          src={logo}
          alt="EZCO Logo"
          
          className="absolute bottom-3 left-6 h-80 object-contain transform translate-y-1/2 z-5"></img>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex gap-4 ml-auto"> {/* Use ml-auto to push nav links to the right */}
        <Link
          to="/"
          className="bg-white text-black rounded-full px-4 py-2 text-l font-semibold hover:bg-gray-200 transition"
        >
          Home
        </Link>
        <Link
          to="/login"
          className="bg-white text-black rounded-full px-4 py-2 text-l font-semibold hover:bg-gray-200 transition"
        >
          Login
        </Link>
   
   
      </nav>
    </header>
  );
}