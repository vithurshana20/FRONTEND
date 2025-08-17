import React from "react";
import { BadgeDollarSign, Award, X, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import OwnerNavbar from "./OwnerNavbar.jsx";


const pricingPlans = {
  monthly: {
    name: "Monthly Plan",
    price: "Rs.3000",
    interval: "/month",
    description: "Ideal for regular users. Billed monthly.",
    features: [
      "Unlimited Court Listings",
      "Real-time Booking Management",
      "Basic Analytics",
      { text: "Priority Support", excluded: true },
      { text: "Advanced Reporting", excluded: true }
    ]
  },
  yearly: {
    name: "Yearly Plan",
    price: "Rs.35000",
    interval: "/year",
    saveText: "SAVE 20%",
    description: "Best value! Save money with annual billing.",
    features: [
      "Unlimited Court Listings",
      "Real-time Booking Management",
      "All Basic Analytics",
      "Priority Customer Support",
      "Advanced Performance Reporting"
    ]
  }
};

export default function SubscribePlan() {
  const token = localStorage.getItem("token");

  const handleSubscriptionCheckout = async (planType) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post("/api/subscribe", { planType }, { headers });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to get Stripe checkout URL");
      }
    } catch (err) {
      console.error("Error initiating payment:", err.response ? err.response.data : err.message);
      toast.error(err.response?.data?.error || "Failed to initiate payment");
    }
  };

  return (
    <>
      <OwnerNavbar />
    <div className="p-6 mt-20 max-w-5xl mx-auto ">
      <h2 className="text-4xl font-bold text-center mt-6 text-[#004030]">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-15 mt-20">
        {Object.entries(pricingPlans).map(([key, plan]) => (
          <div key={key} className="bg-gradient-to-br from-[#4A9782] to-[#DCD0A8] rounded-xl shadow p-6 flex flex-col items-center text-center border">
            <div className="text-[#004030] mb-4">
              {key === 'monthly' ? <BadgeDollarSign size={50} /> : <Award size={50} />}
            </div>
            <h3 className="text-2xl font-bold text-[#004030] mb-1">{plan.name}</h3>
            <p className="text-lg text-gray-800 mb-4">{plan.description}</p>
            <p className="text-4xl font-bold text-[#004030] mb-4">
              {plan.price} <span className="text-lg font-normal text-gray-800">{plan.interval}</span>
            </p>
            <ul className="text-gray-800 text-left w-full mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className={`flex items-center ${feature.excluded ? 'opacity-80' : ''}`}>
                  {feature.excluded ? <X size={16} className="text-[#DC2525] mr-2" /> : <CheckCircle size={16} className="text-[#004030] mr-2" />}
                  {feature.text || feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscriptionCheckout(key)}
              className="bg-[#004030] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4A9782]"
            >
              Subscribe {plan.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// export default function SubscriptionPage() {
//   const [subscriptionStatus, setSubscriptionStatus] = useState("");
//   const token = localStorage.getItem("token");

//   const fetchStatus = async () => {
//     try {
//       const res = await axios.get("/api/auth/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSubscriptionStatus(res.data.subscriptionStatus);
//     } catch (err) {
//       toast.error("Unable to load subscription status");
//     }
//   };

//   const handleSubscribe = async () => {
//    try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.post("/api/subscribe/subscribe", { planType }, { headers });
//       if (res.data.url) {
//         window.location.href = res.data.url;
//       } else {
//         toast.error("Failed to get Stripe checkout URL");
//       }
//     } catch (err) {
//       toast.error("Failed to initiate payment");
//     }
//   };

//   useEffect(() => {
//     fetchStatus();
//   }, []);

//   return (
//     <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-xl p-6">
//       <h2 className="text-2xl font-bold mb-4">Court Owner Subscription</h2>
//       <p className="mb-4">
//         Your subscription status:{" "}
//         <span className="font-semibold text-blue-600">{subscriptionStatus || "Loading..."}</span>
//       </p>
//       {subscriptionStatus !== "active" && (
//         <button
//           onClick={handleSubscribe}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Subscribe Now
//         </button>
//       )}
//     </div>
//   );
// }
