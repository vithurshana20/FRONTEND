import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "../pages/Login";
import PlayerRegister from "../pages/PlayerRegister";
import OwnerRegister from "../pages/OwnerRegister";
import AdminDashboard from "../pages/admin/AdminDashboard";
// import AllUsers from "../pages/admin/AllUsers.jsx";
// import AllCourts from "../pages/admin/AllCourts";
// import AllBookings from "../pages/admin/AllBookings";
import OwnerDashboard from "../pages/owner/ownerDashboard";
import PlayerDashboard from "../pages/PlayerDashboard";
import CourtCalendarPage from "../pages/CourtCalendarPage";
import SubscribePlan from "../pages/owner/SubscribePlan";
import StripeSuccess from "../pages/owner/StripeSuccess";
import MyCourts from "../pages/owner/MyCourts";
import AddCourtPage from "../pages/owner/AddCourtPage";
import OauthSuccess from "../pages/OauthSuccess";
import DashboardStats  from "../pages/owner/DashboardStats";


const AppRouter = () => {   
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/player" element={<PlayerRegister />} />
        <Route path="/register/owner" element={<OwnerRegister />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        {/* <Route path="/admin/users" element={<AllUsers />} />
        <Route path="/admin/courts" element={<AllCourts />} />
        <Route path="/admin/bookings" element={<AllBookings />} /> */}
        {/* <Route path="/owner/dashboard" element={<OwnerDashboard />} /> */}
                <Route path="/owner/dashboard" element={<DashboardStats />} />

        <Route path="/player/dashboard" element={<PlayerDashboard />} />
        <Route path="/court/:courtId/calendar" element={<CourtCalendarPage />} />
        <Route path="/owner/subscription" element={<SubscribePlan />} />
        <Route path="/owner/stripe-success" element={<StripeSuccess />} />
        <Route path="/owner/my-courts" element={<MyCourts />} />
        <Route path="/owner/add-court" element={<AddCourtPage />} />
        <Route path="/auth/success" element={<OauthSuccess />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;