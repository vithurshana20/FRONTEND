// import { useState } from "react";
// import axios from "axios";

// export default function AddCourtForm() {
//   const [form, setForm] = useState({
//     name: "",
//     location: "",
//     pricePerHour: "",
//     phone: "",
//     mapLink: "",
//     images: [],
//   });

//   const [message, setMessage] = useState("");
//   const token = localStorage.getItem("token");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     setForm({ ...form, images: e.target.files });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();
//     data.append("name", form.name);
//     data.append("location", form.location);
//     data.append("pricePerHour", form.pricePerHour);
//     data.append(
//       "contact",
//       JSON.stringify({ phone: form.phone, mapLink: form.mapLink })
//     );

//     for (let i = 0; i < form.images.length; i++) {
//       data.append("images", form.images[i]);
//     }

//     try {
//       const res = await axios.post("http://localhost:5000/api/courts/add", data, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setMessage(res.data.message);
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Court submission failed");
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
//       <h2 className="text-xl font-bold mb-4 text-[#00332e]">Register Your Court</h2>

//       {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Court Name"
//           required
//           className="w-full p-2 border rounded"
//         />

//         <input
//           name="location"
//           value={form.location}
//           onChange={handleChange}
//           placeholder="Location"
          
//           className="w-full p-2 border rounded"
//         />

//         <input
//           name="pricePerHour"
//           value={form.pricePerHour}
//           onChange={handleChange}
//           placeholder="Price per Hour"
//           type="number"
          
//           className="w-full p-2 border rounded"
//         />

//         <input
//           name="phone"
//           value={form.phone}
//           onChange={handleChange}
//           placeholder="Contact Phone"
          
//           className="w-full p-2 border rounded"
//         />

//         <input
//           name="mapLink"
//           value={form.mapLink}
//           onChange={handleChange}
//           placeholder="Google Map Link"
          
//           className="w-full p-2 border rounded"
//         />

//         <input
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={handleImageChange}
//           className="w-full p-2 border rounded"
//         />

//         <button
//           type="submit"
//           className="bg-[#00332e] text-white px-6 py-2 rounded hover:bg-[#004d42]"
//         >
//           Submit Court for Approval
//         </button>
//       </form>
//     </div>
//   );
// }


// frontend/src/components/AddCourtForm.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast for consistent notifications

// Add onSuccess prop
export default function AddCourtForm({ onSuccess, stripeSessionId }) { // stripeSessionId added here
  const [form, setForm] = useState({
    name: "",
    location: "",
    pricePerHour: "",
    phone: "",
    mapLink: "",
    images: [],
  });

  // No need for local message state if using toast
  // const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    // Convert FileList to Array to store in state if needed, or directly assign
    setForm({ ...form, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for images
    if (form.images.length === 0) {
      toast.error("Please upload at least one image for the court.");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("location", form.location);
    data.append("pricePerHour", form.pricePerHour);
    // Ensure backend expects this JSON string or adapt
    data.append(
      "contact",
      JSON.stringify({ phone: form.phone, mapLink: form.mapLink })
    );

    for (let i = 0; i < form.images.length; i++) {
      data.append("images", form.images[i]);
    }

    // Conditionally append stripeSessionId if it exists
    if (stripeSessionId) {
        data.append("stripeSessionId", stripeSessionId);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/courts/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Use toast for messages
      toast.success(res.data.message || "Court added successfully!");

      // Call the onSuccess prop passed from the parent (OwnerDashboard)
      if (onSuccess) {
        onSuccess();
      }

      // Optionally clear form fields after successful submission
      setForm({
        name: "",
        location: "",
        pricePerHour: "",
        phone: "",
        mapLink: "",
        images: [],
      });
      // Clear file input manually (important for re-uploading same files)
      e.target.reset(); // Resets the form elements

    } catch (err) {
      // Use toast for error messages
      toast.error(err.response?.data?.message || "Court submission failed.");
      console.error("Court submission error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-[#00332e]">Register Your Court</h2>

      {/* Removed local message display, relying on ToastContainer */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Court Name"
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="pricePerHour"
          value={form.pricePerHour}
          onChange={handleChange}
          placeholder="Price per Hour"
          type="number"
          required
          min="0" // Ensure price is not negative
          className="w-full p-2 border rounded"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Contact Phone"
          required
          type="tel" // Use type="tel" for phone numbers
          className="w-full p-2 border rounded"
        />

        <input
          name="mapLink"
          value={form.mapLink}
          onChange={handleChange}
          placeholder="Google Map Link (Optional)" // Make optional if not strictly required
          className="w-full p-2 border rounded"
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          required // Make images required
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-[#00332e] text-white px-6 py-2 rounded hover:bg-[#004d42]"
        >
          Submit Court for Approval
        </button>
      </form>
    </div>
  );
}