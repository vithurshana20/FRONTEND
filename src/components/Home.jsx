import { useState } from "react";
import { useNavigate } from "react-router-dom";
import phoneapp from "../assets/court.png";
import outdoorActivityImage from "../assets/bat.jpg";
import ball from "../assets/ball.jpg";

export default function Home() {
  const [showToggle, setShowToggle] = useState(false);
  const [selectedRole, setSelectedRole] = useState("player");
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    setShowToggle(true);
  };

  const handleContinue = () => {
    navigate(`/register/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <main className="flex-grow">
        {/*  Hero Section */}
        <section className="relative bg-gradient-to-br from-green-900 to-white md:min-h-[70vh] flex items-center py-10 px-6 overflow-hidden">
          {/* Background Shape */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute left-0 top-0 bottom-0 w-3/5 bg-white rounded-r-[500px] shadow-lg"></div>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center max-w-7xl mx-auto">
            {/* Left Text Content */}
            <div className="space-y-6 text-gray-800 pr-4 md:pr-10">
              <h1 className="text-4xl font-bold animate-fadeSlideUp" style={{ animationDelay: "0.2s" }}>
                Your Game, Your Time. Book Your Court Instantly!
              </h1>
              <p className="text-xl animate-fadeSlideUp" style={{ animationDelay: "0.5s" }}>
                Effortless online booking for badminton courts. Find courts near your location, view real-time availability, and book in seconds. No more calls or wasted trips.
              </p>

              {!showToggle ? (
                <button
                  onClick={handleGetStartedClick}
                  className="bg-lime-400 text-black font-semibold px-6 py-3 rounded-full hover:bg-lime-500 transition transform hover:scale-105 duration-300 animate-fadeSlideUp"
                  style={{ animationDelay: "0.8s" }}
                >
                  Get Started Free
                </button>
              ) : (
                <div className="mt-6 space-y-4 animate-fadeSlideUp" style={{ animationDelay: "1s" }}>
                  <div className="bg-white rounded-full p-1 flex w-max space-x-2 shadow-sm">
                    <button
                      onClick={() => setSelectedRole("player")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${selectedRole === "player"
                        ? "bg-lime-400 text-black"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      Player
                    </button>
                    <button
                      onClick={() => setSelectedRole("owner")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${selectedRole === "owner"
                        ? "bg-lime-400 text-black"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      Court Owner
                    </button>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="bg-lime-400 text-black hover:bg-emerald-800 font-semibold px-8 py-3 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>

            {/* Right Image */}
            <div className="flex justify-center md:justify-end mt-10 md:mt-0 relative z-10">
              <img
                src={outdoorActivityImage}
                alt="Outdoor Sport Activity"
                className="w-[1000px] md:w-[1200px] lg:w-[1400px] h-auto object-contain transform scale-x-[-1] rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="aboutus" className="bg-[#00332e] w-full py-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center px-4">
            {/* Left Image */}
            <div className="relative lg:w-1/2 w-full mb-10 lg:mb-0 mr-20">
              <img
                src={ball}
                alt="Man playing a sport"
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Right Text Content */}
            <div className="lg:w-1/2 p-6 text-left ml-13">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Take Your Game To The Next Level
              </h2>
              <p className="text-white text-lg leading-relaxed">
                Our app transforms how players book sports courts. With real-time slot availability, players can book instantly — no calls, no confusion. Court owners can manage all bookings in one place, saving time and avoiding errors. It’s fast, simple, and built for both players and owners. Play smarter, manage easier, and take your game to the next level.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="w-full bg-white text-black p-10">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Explore the AllBooked Feature Suite
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-18">
            <div className="bg-[#00332e] p-5 rounded-xl text-white shadow hover:scale-105 transition">
              <h3 className="font-bold text-2xl mb-2"> Role-Based Dashboards</h3>
              <p className="text-lg">
                Separate dashboards for Players and Court Owners. Players can book courts easily, while Owners manage them effortlessly. Each role gets only the tools they need nothing more, nothing less.              </p>
            </div>
            <div className="bg-[#00332e] p-5 rounded-xl text-white shadow hover:scale-105 transition">
              <h3 className="font-bold text-2xl mb-2">Real-Time Availability</h3>
              <p className="text-lg">

                Check slots instantly without phone calls or delays. See live availability of all courts at a glance. Book your preferred time in just a few taps.              </p>
            </div>
            <div className="bg-[#00332e] p-5 rounded-xl text-white shadow hover:scale-105 transition">
              <h3 className="font-bold text-2xl mb-2">Court Owner Tools</h3>
              <p className="text-lg">

                Upload images, manage schedules, and accept bookings easily. Customize your availability to fit your unique timetable.              </p>
            </div>
            <div className="bg-[#00332e] p-5 rounded-xl text-white shadow hover:scale-105 transition">
              <h3 className="font-bold text-2xl mb-2"> 7-Day Free Trial</h3>
              <p className="text-lg">

                Enjoy premium features free for 7 days — no credit card needed. Explore all tools designed to boost your court’s bookings and revenue.              </p>
            </div>
          </div>
        </section>
      </main>

      {/*  Footer */}
      <footer className="bg-[#00332e] text-white py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div>
            <h2 className="text-2xl font-bold">AllBooked</h2>
            <p className="mt-3 text-sm text-gray-300">
              Your court. Your time. Book smarter, play better.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#aboutus" className="hover:underline">About Us</a></li>
              <li><a href="/register/player" className="hover:underline">Register as Player</a></li>
              <li><a href="/register/owner" className="hover:underline">Register as Owner</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <p className="text-sm text-gray-300">Email: support@allbookedapp.com</p>
            <p className="text-sm text-gray-300 mt-1">Phone: +94 77 123 4567</p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-10">
          &copy; {new Date().getFullYear()} AllBooked. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
