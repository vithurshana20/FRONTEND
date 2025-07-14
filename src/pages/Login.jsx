import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error("Login failed: " + (err.response?.data?.message || "Something went wrong"));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-center">
          {/* <div className="bg-orange-400 text-white font-bold rounded-xl w-12 h-12 flex items-center justify-center">
            AB
          </div> */}
        </div>
        <h2 className="text-center text-2xl font-bold text-orange-600">Welcome Back!</h2>
        <p className="text-center text-gray-500">Sign in to your EZCO account</p>

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

          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center gap-1">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="text-orange-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-400 text-white font-semibold py-2 rounded-md shadow-md hover:bg-orange-500 transition"
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
          {/* <button className="flex items-center gap-2 border px-4 py-2 rounded-md">
            <img src="https://www.svgrepo.com/show/157810/facebook.svg" className="w-5 h-5" alt="Facebook" />
            Facebook
          </button> */}
        </div>

        {/* <div className="text-center text-sm">
          Don’t have an account?{' '}
          <a href="/register" className="text-orange-500 font-semibold hover:underline">
            Sign up here
          </a>
        </div> */}
      </div>
    </div>
  );
}








// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/login", {
//         email,
//         password,
//       });

//       // Save token and user
//       const { token, user } = res.data;
//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       // Redirect based on role
//       if (user.role === "court_owner") {
//         navigate("/owner-dashboard");
//       } else if (user.role === "player") {
//         navigate("/player-dashboard");
//       } else if (user.role === "admin") {
//         navigate("/admin-dashboard");
//       } else {
//         alert("Unknown role. Please contact support.");
//       }
//     } catch (err) {
//       alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
//       console.error(err);
//     }
//   };

//   return (
//     <div className="bg-white min-h-screen flex items-center justify-center">
//       <div className="bg-[#00332e] text-white p-8 rounded-xl shadow-md w-[90%] max-w-md">
//         <h2 className="text-2xl font-bold text-center mb-2">Welcome back</h2>
//         <p className="text-sm text-center mb-6">Please Enter your Account details</p>

//         <form className="space-y-4" onSubmit={handleLogin}>
//           <div>
//             <label>Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none mt-1"
//               required
//             />
//           </div>
//           <div>
//             <label>Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none mt-1"
//               required
//             />
//           </div>

//           {/* <div className="text-right text-sm underline cursor-pointer text-gray-300">
//             Forgot Password?
//           </div> */}

//           <button
//             type="submit"
//             className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-2 rounded-full mt-4"
//           >
//             Log In
//           </button>
//         </form>

//         <div className="flex items-center my-4">
//           <hr className="flex-grow border-gray-400" />
//           <span className="mx-2 text-sm text-gray-300">OR</span>
//           <hr className="flex-grow border-gray-400" />
//         </div>

//      <button
//   className="w-full border rounded-full py-2 bg-white text-black hover:bg-gray-100"
//   onClick={() => {
//     window.location.href = "http://localhost:5000/api/auth/google";
//   }}
// >
//   Continue with Google
// </button>


//         <div className="text-center mt-4 text-sm text-gray-300">
//           Don’t have an account?{" "}
//           <Link to="/register" className="underline text-white">
//             Register
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
