// // src/components/OwnerNavbar.jsx
// import React from "react";
// import { Link, useLocation } from "react-router-dom";

// export default function OwnerNavbar() {
//   const { pathname } = useLocation();

//   const navItemClass = (path) =>
//     `px-4 py-2 font-semibold rounded ${
//       pathname === path
//         ? "bg-orange-600 text-white"
//         : "text-orange-600 hover:bg-orange-100"
//     }`;

//   return (
//     <nav className="flex justify-center gap-4 mb-6">
//       <Link to="/owner/dashboard" className={navItemClass("/owner/dashboard")}>
//         Dashboard
//       </Link>
//       <Link to="/owner/my-courts" className={navItemClass("/owner/my-courts")}>
//         My Courts
//       </Link>
//       <Link to="/owner/subscribe" className={navItemClass("/owner/subscribe")}>
//         Subscription
//       </Link>
//     </nav>
//   );
// }
import React from "react";
import { NavLink } from "react-router-dom";

export default function OwnerNavbar() {
  const params = new URLSearchParams(location.search);
const activeTab = params.get("tab") || "stats";
{activeTab === "my-courts" && <MyCourts />}

  return (
    <nav className="bg-[#004030] shadow-md flex space-x-6 px-6 py-6 text-xl font-bold fixed top-0 w-full z-10">
      <NavLink to="/owner/dashboard" className={({ isActive }) =>
        isActive ? "text-[#4A9782] underline" : "text-white"
      }>
        Dashboard Stats
      </NavLink>
      <NavLink to="/owner/my-courts" className={({ isActive }) =>
        isActive ? "text-[#4A9782] underline" : "text-white"
      }>
        My Courts
      </NavLink>
      <NavLink to="/owner/subscription" className={({ isActive }) =>
        isActive ? "text-[#4A9782] underline" : "text-white"
      }>
        Subscription
      </NavLink>
      <NavLink to="/login" className={({ isActive }) =>
        isActive ? "text-[#4A9782] underline" : "text-white"
      }>
        Logout
      </NavLink>
    </nav>
  );
}
