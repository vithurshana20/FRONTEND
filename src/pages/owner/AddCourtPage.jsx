import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import AddCourtForm from "../../components/AddCourtForm";
import "react-toastify/dist/ReactToastify.css";

export default function AddCourtPage() {
  const [stripeSessionId, setStripeSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to register a court.");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    const sessionId = params.get("session_id");

    const verifyPayment = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        if (paymentStatus === "success" && sessionId) {
          const res = await axios.post(
            "/api/subscribe/verify-session",
            { sessionId },
            { headers }
          );

          setOwner(res.data.owner);
          setStripeSessionId(sessionId);
          toast.success("Payment verified! You can now register your court.");

          if (!res.data.owner.hasActiveSubscription) {
            let attempts = 0;
            while (attempts < 5) {
              const profileRes = await axios.get("/api/auth/profile", { headers });
              if (profileRes.data.hasActiveSubscription) {
                setOwner(profileRes.data);
                break;
              }
              attempts++;
              await new Promise((res) => setTimeout(res, 2000));
            }
          }
        } else {
          // direct load (user already has subscription)
          const profileRes = await axios.get("/api/auth/profile", { headers });
          setOwner(profileRes.data);

          if (!profileRes.data.hasActiveSubscription) {
            toast.error("You need an active subscription to register a court.");
            navigate("/owner/dashboard");
          }
        }
      } catch (err) {
        console.error("Error verifying subscription:", err);
        toast.error(err.response?.data?.error || "Subscription verification failed.");
        navigate("/owner/dashboard");
      } finally {
        setLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname); // remove query
      }
    };

    verifyPayment();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7D29] mx-auto"></div>
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (!owner?.hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50">
        <div className="text-center space-y-4">
          <p className="text-gray-600">You need an active subscription to register a court.</p>
          <button
            onClick={() => navigate("/owner/dashboard")}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEEA9] via-white to-[#FFEEA9]/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => navigate("/owner/dashboard")}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* ✅ Court Form Component */}
        <AddCourtForm
          stripeSessionId={stripeSessionId}
          onSuccess={() => {
            toast.success("Court registered successfully!");
            navigate("/owner/dashboard?tab=my-courts"); // ✅ trigger tab logic
          }}
        />
      </div>
      <ToastContainer />
    </div>
  );
}