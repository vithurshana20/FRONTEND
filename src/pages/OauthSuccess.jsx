// pages/OauthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function OauthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Decode token to get user (optional), or make a call to get user
      localStorage.setItem("token", token);

      // Example: Fetch user from token (if needed)
      axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const user = res.data;
          localStorage.setItem("user", JSON.stringify(user));

          if (user.role === "court_owner") {
            navigate("/owner-dashboard");
          } else if (user.role === "player") {
            navigate("/player-dashboard");
          } else if (user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/login");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return <div className="text-center mt-10 text-lg">Logging in with Google...</div>;
}
