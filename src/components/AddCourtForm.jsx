import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AddCourtForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [phone, setPhone] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("pricePerHour", pricePerHour);
      formData.append("contact", JSON.stringify({ phone, mapLink }));
      images.forEach((image) => {
        formData.append("images", image);
      });

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      // Optional: re-verify user profile before court creation
      const profileRes = await api.get("/auth/profile", { headers });
      if (profileRes.data.subscriptionStatus !== "active") {
        toast.error("You must have an active subscription to add a court.");
        setLoading(false);
        return;
      }

      await api.post("/courts/add", formData, { headers });

      toast.success("Court submitted for approval!");
      if (onSuccess) onSuccess();

      // Optionally reset form
      setName("");
      setLocation("");
      setPricePerHour("");
      setPhone("");
      setMapLink("");
      setImages([]);
    } catch (err) {
      console.error("Court add error:", err);
      toast.error(err.response?.data?.message || "Failed to add court");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[#FFF9E5] rounded-lg shadow-lg max-w-lg mx-auto my-10"> {/* Off-White/Cream background for the form card */}
      <h2 className="text-2xl font-bold text-[#004030] mb-6 text-center">Add New Court</h2> {/* Dark Green heading */}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#004030]">Court Name</label> {/* Dark Green label */}
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-[#4A9782] focus:ring-[#4A9782] p-2" // Medium Green focus
          required
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-[#004030]">Location</label> {/* Dark Green label */}
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-[#4A9782] focus:ring-[#4A9782] p-2" // Medium Green focus
          required
        />
      </div>
      <div>
        <label htmlFor="pricePerHour" className="block text-sm font-medium text-[#004030]">Price Per Hour (LKR)</label> {/* Dark Green label */}
        <input
          id="pricePerHour"
          type="number"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-[#4A9782] focus:ring-[#4A9782] p-2" // Medium Green focus
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#004030]">Phone Number</label> {/* Dark Green label */}
        <input
          id="phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-[#4A9782] focus:ring-[#4A9782] p-2" // Medium Green focus
          required
        />
      </div>
      <div>
        <label htmlFor="mapLink" className="block text-sm font-medium text-[#004030]">Google Maps Link</label> {/* Dark Green label */}
        <input
          id="mapLink"
          type="text"
          value={mapLink}
          onChange={(e) => setMapLink(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-[#4A9782] focus:ring-[#4A9782] p-2" // Medium Green focus
          required
        />
      </div>
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-[#004030]">Images</label> {/* Dark Green label */}
        <input
          id="images"
          type="file"
          multiple
          onChange={(e) => setImages([...e.target.files])}
          className="mt-1 block w-full text-sm text-[#004030] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#DCD0A8] file:text-[#004030] hover:file:bg-[#4A9782] hover:file:text-white transition-colors" // Styled file input with Light Khaki and Dark Green, hover with Medium Green
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
          loading ? "bg-[#4A9782] cursor-not-allowed" : "bg-[#004030] hover:bg-[#4A9782]" // Dark Green button, Medium Green on hover; Medium Green when loading
        }`}
      >
        {loading ? "Submitting..." : "Submit Court"}
      </button>
    </form>
  );
}



