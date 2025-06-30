import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Save token and user
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "court_owner") {
        navigate("/owner-dashboard");
      } else if (user.role === "player") {
        navigate("/player-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        alert("Unknown role. Please contact support.");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
      console.error(err);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="bg-[#00332e] text-white p-8 rounded-xl shadow-md w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome back</h2>
        <p className="text-sm text-center mb-6">Please Enter your Account details</p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none mt-1"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none mt-1"
              required
            />
          </div>

          {/* <div className="text-right text-sm underline cursor-pointer text-gray-300">
            Forgot Password?
          </div> */}

          <button
            type="submit"
            className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-2 rounded-full mt-4"
          >
            Log In
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-400" />
          <span className="mx-2 text-sm text-gray-300">OR</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        <button className="w-full border rounded-full py-2 bg-white text-black hover:bg-gray-100">
          Continue with Google
        </button>

        <div className="text-center mt-4 text-sm text-gray-300">
          Don’t have an account?{" "}
          <Link to="/register" className="underline text-white">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
