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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player-dashboard" element={<PlayerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/player" element={<PlayerRegister />} />
          <Route path="/register/owner" element={<OwnerRegister />} />
          <Route path="/court/:id" element={<CourtCalendarPage />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;