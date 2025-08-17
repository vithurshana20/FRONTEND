import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"
// Import necessary icons from lucide-react, including X for close button
import {
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  Zap,
  ShieldCheck,
  Gift,
  PlayCircle,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Facebook,
  Instagram,
  Linkedin,
  X, // Close icon
} from 'lucide-react';
import flower from '../assets/7.jpeg'; // Import flower image for the hero section
import bat from '../assets/8.jpeg'; // Import bat image for the feature section


// Main App component combining all sections
export default function App() {
  return (
    <div className="min-h-screen font-inter">
      <HeroSection />
      <FeatureSection />
      <FeatureSuiteSection />
      <CallToActionFooter />
    </div>
  );
}

// HeroSection component
function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Handler for the "Register" button clicks
  const handleRegister = (role) => {
    navigate(`/register/${role}`);
    setIsModalOpen(false); // Close modal after registration
  };

  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-center py-16 sm:py-24 md:py-32 bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] px-4 overflow-hidden">
<Navbar/>
      {/* Left Content Area */}
      <div className="flex flex-col items-start text-left max-w-lg lg:max-w-2xl z-10 p-4 sm:p-6 lg:p-0 ml-60">
        

        {/* Main Heading in dark brown */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#004030] leading-tight mb-6">
          Your Game, Your Time. Book Instantly!
        </h1>

        {/* Description text */}
        <p className="text-base sm:text-lg text-gray-900 mb-8 max-w-md">
          Effortless online booking for badminton courts. Find courts near you, view real-time availability, and book in seconds. No more calls or wasted trips.
        </p>

        {/* Get Started Free Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#004030] hover:bg-[#4A9782] text-white hover:text-[#004030] px-8 py-4 rounded-full font-semibold text-lg transition-colors flex items-center justify-center gap-2"
        >
          Get Started Free
        </button>

        {/* Statistics Section with dark brown values */}
        {/* <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mt-12 ">
          <StatItem value="500+" label="Courts Available" />
          <StatItem value="10K+" label="Happy Players" />
          <StatItem value="4.9" label="Rating" icon={<Star className="w-5 h-5" />} />
        </div> */}
      </div>

   {/* Right Content Area - Image Placeholder with rounded corners and shadow */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center mt-14 lg:mt-0 p-4 lg:p-0">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] bg-white bg-opacity-80 rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden">
        

          {/* NEW IMAGE GOES HERE */}
          <img
            src={flower}// <--- **UPDATE THIS PATH TO YOUR IMAGE**
            alt="Tennis or Badminton Court" // Provide a descriptive alt text for accessibility
            className="w-full h-full object-cover rounded-[40px]" // Make image fill container, cover it, and keep rounded corners
          />

          {/* Abstract shapes for visual interest - KEEP THESE AS THEY ARE */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white bg-opacity-50 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white bg-opacity-50 rounded-full blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
      {/* Modal Popup with Two Cards */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <h2 className="text-2xl font-bold text-[#004030]">Choose Your Role</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Card Layout for Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Card */}
              <div className="bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-[#004030] mb-4">Register as Player</h3>
                <p className="text-gray-900 mb-4">Book courts easily, track your games, and join a community of players.</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Instant court booking</li>
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Real-time availability</li>
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Personalized dashboard</li>
                </ul>
                <button
                  onClick={() => handleRegister('player')}
                  className="bg-[#004030] hover:bg-[#4A9782] text-white px-6 py-3 rounded-full font-semibold transition-colors w-full"
                >
                  Register
                </button>
              </div>

              {/* Court Owner Card */}
              <div className="bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-[#004030] mb-4">Register as Court Owner</h3>
                <p className="text-gray-900 mb-4">Manage your courts, schedule bookings, and grow your business.</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Schedule management</li>
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Booking analytics</li>
                  <li className="flex items-center text-gray-900"><CheckCircle className="w-5 h-5 text-[#004030] mr-2" /> Owner dashboard</li>
                </ul>
                <button
                  onClick={() => handleRegister('owner')}
                  className="bg-[#004030] hover:bg-[#4A9782] text-white px-6 py-3 rounded-full font-semibold transition-colors w-full"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper component for statistics display
function StatItem({ value, label, icon }) {
  return (
    <div className="flex items-center">
      {icon && <span className="text-xl mr-2">{icon}</span>}
      <div>
        <div className="text-2xl font-bold text-[#7B4019]">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}

// FeatureSection component
function FeatureSection() {
  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-center py-16 sm:py-24 md:py-32 bg-[#004030]  px-4 overflow-hidden">

      {/* Left Content Area - Image Placeholder with rounded corners and shadow */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center mt-12 lg:mt-0 p-4 lg:p-0">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] bg-white bg-opacity-80 rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden">
        

          {/* NEW IMAGE GOES HERE */}
          <img
            src={bat}// <--- **UPDATE THIS PATH TO YOUR IMAGE**
            alt="Tennis or Badminton Court" // Provide a descriptive alt text for accessibility
            className="w-full h-full object-cover rounded-[40px]" // Make image fill container, cover it, and keep rounded corners
          />

          {/* Abstract shapes for visual interest - KEEP THESE AS THEY ARE */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white bg-opacity-50 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white bg-opacity-50 rounded-full blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-col items-start text-left max-w-lg lg:max-w-2xl z-10 p-4 sm:p-6 lg:p-0 order-1 lg:order-2">
        {/* Small badge/tagline with vibrant orange icon and dark brown text */}
        {/* <div className="flex items-center bg-white bg-opacity-70 rounded-full px-4 py-2 mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#FF7D29] mr-2" />
          <span className="text-[#7B4019] text-sm font-semibold">Level Up Your Game</span>
        </div> */}

        {/* Main Heading in dark brown */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Take Your Game To The <span className="text-[#4A9782]">Next Level</span>
        </h1>

        {/* Description text */}
        <p className="text-base sm:text-lg text-[#DCD0A8] mb-8 max-w-md">
          Our app transforms how players book sports courts. With real-time slot availability, players can book instantly — no calls, no confusion. Court owners can manage all bookings in one place, saving time and avoiding errors.
        </p>

        {/* Feature List with vibrant orange checkmarks */}
        <ul className="space-y-4">
          <FeatureItem text="Instant booking confirmation" />
          <FeatureItem text="Real-time availability updates" />
          <FeatureItem text="Seamless payment integration" />
        </ul>
      </div>
    </section>
  );
}

// Helper component for feature list items
function FeatureItem({ text }) {
  return (
    <li className="flex items-center text-white">
      <CheckCircle className="w-6 h-6 text-[#FFBF78] mr-3" />
      <span className="text-lg">{text}</span>
    </li>
  );
}

// FeatureSuiteSection component
function FeatureSuiteSection() {
  return (
    <section className="bg-white py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center bg-white bg-opacity-70 rounded-full px-4 py-2 mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#004030] mr-2" />
          <span className="text-[#004030] text-sm font-semibold">Premium Features</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#004030] mb-4">
          Explore the AllBooked <span className="text-[#4A9782]">Feature Suite</span>
        </h2>
        {/* Subheading */}
        <p className="text-lg text-[#4A9782] mb-12">
          Everything you need to book, manage, and play better
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="w-12 h-12 text-[#004030]" />}
            title="Role-Based Dashboards"
            description="Separate dashboards for Players and Court Owners. Each role gets only the tools they need."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-[#004030]" />}
            title="Real-Time Availability"
            description="Check slots instantly without phone calls. See live availability and book your preferred time."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-12 h-12 text-[#004030]" />}
            title="Court Owner Tools"
            description="Upload images, manage schedules, and accept bookings easily. Customize availability to fit your timetable."
          />
          {/* <FeatureCard
            icon={<Gift className="w-12 h-12 text-[#004030]" />}
            title="7-Day Free Trial"
            description="Enjoy premium features free for 7 days — no credit card needed. Boost your bookings and revenue."
          /> */}
        </div>
      </div>
    </section>
  );
}

// Helper component for Feature Cards
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] rounded-2xl p-6 shadow-lg flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105">
      <div className="bg-white rounded-full p-4 mb-4 shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#004030] mb-2">{title}</h3>
      <p className="text-gray-900 text-sm">{description}</p>
    </div>
  );
}

// CallToActionFooter component
function CallToActionFooter() {
  return (
    <>
    

      {/* Footer Section */}
      <footer className="bg-[#004030] text-[#DCD0A8] py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">AllBooked</h3>
            <p className="text-l">
              Your court. Your time. Book smarter, play better. The future of court booking is here.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="bg-[#4A9782] text-white p-3 rounded-full hover:bg-opacity-90 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-[#4A9782] text-white p-3 rounded-full hover:bg-opacity-90 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-[#4A9782] text-white p-3 rounded-full hover:bg-opacity-90 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-2xl mb-4">Quick Links</h4>
            <ul className="space-y-2 text-l">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-white font-semibold text-2xl mb-4">For Users</h4>
            <ul className="space-y-2 text-l">
              <li><a href="#" className="hover:text-white transition-colors">Register as Player</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Register as Owner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Find Courts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-white font-semibold text-2xl mb-4">Contact Us</h4>
            <ul className="space-y-2 text-l">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#4A9782]" />
                <a href="mailto:support@allbookedapp.com" className="hover:text-white transition-colors">support@allbookedapp.com</a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#4A9782]" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-[#4A9782] mt-1" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-l mt-12 opacity-80">
          © 2025 AllBooked. All rights reserved. Made with ❤️ for badminton lovers.
        </div>
      </footer>
    </>
  );
}


