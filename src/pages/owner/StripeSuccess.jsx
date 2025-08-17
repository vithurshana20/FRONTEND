// import React, { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useAuth } from "../../context/AuthContext";

// const StripeSuccess = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   useEffect(() => {
//     const verifySession = async () => {
//       const sessionId = new URLSearchParams(location.search).get("session_id");
//       if (sessionId) {
//         try {
//           const res = await axios.post("/api/subscribe/verify-session", {
//             sessionId,
//           });
//           const { user, token } = res.data;
//           login(user, token);
//           toast.success("Payment successful! Your subscription is active.");
//           navigate("/owner/dashboard");
//         } catch (error) {
//           toast.error("Failed to verify payment. Please contact support.");
//           navigate("/owner/subscription");
//         }
//       }
//     };

//     verifySession();
//   }, [location, navigate, login]);

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="text-center">
//         <h1 className="text-2xl font-bold">Verifying your payment...</h1>
//         <p>Please wait while we confirm your subscription.</p>
//       </div>
//     </div>
//   );
// };

// export default StripeSuccess;



import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api"; // ✅ Axios instance with baseURL set
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const StripeSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = new URLSearchParams(location.search).get("session_id");

      if (!sessionId) {
        toast.error("Missing session ID. Redirecting...");
        return navigate("/owner/subscription");
      }

      try {
        const res = await api.post("/subscribe/verify-session", { sessionId });

        const { user, token } = res.data;

        if (!token) {
          toast.error("Verification failed. Token not received.");
          return navigate("/owner/subscription");
        }

        // ✅ Save token and user
        login(user, token);

        toast.success("Payment successful! Your subscription is active.");
        navigate("/owner/my-courts");
      } catch (error) {
        toast.error("Failed to verify payment. Please contact support.");
        navigate("/owner/subscription");
      }
    };

    verifySession();
  }, [location, navigate, login]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#004030]">Verifying your payment...</h1>
        <p className="text-[#4A9782] mt-2">Please wait while we confirm your subscription.</p>
      </div>
    </div>
  );
};

export default StripeSuccess;
