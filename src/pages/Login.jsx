import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, Lock } from 'lucide-react';
import courtBackground from "../assets/14.jpg"; // Adjust path to your background image

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Save token and user
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "court_owner") {
        navigate("/owner/dashboard");
      } else if (user.role === "player") {
        navigate("/player/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        alert("Unknown role. Please contact support.");
      }
    } catch (err) {
      toast.error("Login failed: " + (err.response?.data?.message || "Something went wrong"));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4"  style={{
            backgroundImage: `url(${courtBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
          }}
        >
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-center">
          {/* <div className="bg-orange-400 text-white font-bold rounded-xl w-12 h-12 flex items-center justify-center">
            AB
          </div> */}
        </div>
        <h2 className="text-center text-2xl font-bold text-[#004030]">Welcome Back!</h2>
        <p className="text-center text-gray-900">Sign in to your EZCO account</p>

        <form className="space-y-4" onSubmit={handleLogin}>
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
            <label className="text-sm font-medium">Password</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Lock size={16} className="mr-2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400 ml-2"
              >
                👁
              </button>
            </div>
          </div>

        
          <button
            type="submit"
            className="w-full bg-[#004030] text-white font-semibold py-2 rounded-md shadow-md hover:bg-[#4A9782] transition"
          >
            Sign In
          </button>
        </form>

        <div className="relative text-center text-gray-500 text-sm mt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="border-t w-full"></div>
          </div>
          <span className="relative bg-white px-2">Or continue with</span>
        </div>

        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Google
          </button>
         
        </div>
      </div>
    </div>
  );
}






