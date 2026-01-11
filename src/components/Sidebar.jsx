// -------- src/components/Sidebar.jsx --------
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  UserCircle,
  ShieldCheck,
  School,
  X,
  GitBranch,
  DollarSign,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth(); // ✅ get current logged-in user

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-300 transition-all duration-300 transform rounded-lg hover:bg-gray-800 hover:text-white ${
      isActive ? "bg-gray-900 text-white shadow-inner" : ""
    }`;

  const handleLinkClick = () => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-black text-gray-100 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center">
            <ShieldCheck className="w-7 h-7 text-white" />
            <h1 className="ml-3 text-xl font-bold text-white tracking-wide">
              {user?.role === "Admin" ? "Admin Panel" : "Accountant Panel"}
            </h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 p-4 space-y-1">
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              className={navLinkClasses}
              onClick={handleLinkClick}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="mx-4 font-medium text-sm">Dashboard</span>
            </NavLink>

            {/* ✅ Only show for Admin */}
            {user?.role === "Admin" && (
              <NavLink
                to="/branches"
                className={navLinkClasses}
                onClick={handleLinkClick}
              >
                <GitBranch className="w-5 h-5" />
                <span className="mx-4 font-medium text-sm">Branches</span>
              </NavLink>
            )}

            <NavLink
              to="/classes"
              className={navLinkClasses}
              onClick={handleLinkClick}
            >
              <School className="w-5 h-5" />
              <span className="mx-4 font-medium text-sm">Classes</span>
            </NavLink>

            <NavLink
              to="/enrollments"
              className={navLinkClasses}
              onClick={handleLinkClick}
            >
              <UserCircle className="w-5 h-5" />
              <span className="mx-4 font-medium text-sm">Enrollments</span>
            </NavLink>

            <NavLink
              to="/payments"
              className={navLinkClasses}
              onClick={handleLinkClick}
            >
              <DollarSign className="w-5 h-5" />
              <span className="mx-4 font-medium text-sm">Payments</span>
            </NavLink>

            <NavLink
              to="/reports"
              className={navLinkClasses}
              onClick={handleLinkClick}
            >
              <FileText className="w-5 h-5" />
              <span className="mx-4 font-medium text-sm">Reports</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          {/* ✅ Only show for Admin */}
          {user?.role === "Admin" && (
            <NavLink
              to="/users"
              className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 mt-3"
              onClick={handleLinkClick}
            >
              <UserCircle className="w-5 h-5" />
              <span className="mx-3 text-sm font-medium">User Management</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
