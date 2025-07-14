import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PlayerDashboard from "./pages/PlayerDashboard";
import Home from "./components/Home";
import Login from "./pages/Login";
import PlayerRegister from "./pages/PlayerRegister";
import OwnerRegister from "./pages/OwnerRegister";
import CourtCalendarPage from './pages/CourtCalendarPage';
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OauthSuccess from "./pages/OauthSuccess";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// import UsersPage from "./pages/admin/UsersPage";
// import CourtsPage from "./pages/admin/CourtsPage";
// import BookingsPage from "./pages/admin/BookingsPage";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" />      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player-dashboard" element={<PlayerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/player" element={<PlayerRegister />} />
        <Route path="/register/owner" element={<OwnerRegister />} />
        <Route path="/court/:id" element={<CourtCalendarPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        <Route path="/oauth-success" element={<OauthSuccess />} />
        {/* <Route path="/users" element={<UsersPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/bookings" element={<BookingsPage />} /> */}
        <Route
          path="/admin-dashboard/*" // <--- The crucial change is adding "/*" here
          element={
            localStorage.getItem("token") ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

    </AuthProvider>
  );
}

export default App;