// -------- src/pages/Dashboard.jsx --------
import React, { useState, useEffect } from "react";
import DashboardCard from "../components/DashboardCard";
import { Users, DollarSign, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();

  // Fetch all branches (Admin only)
  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data?.data?.branches || []);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async (branchId = "") => {
    setIsLoading(true);
    let endpoint = "/dashboard";
    if (user?.role === "Accountant" || branchId) {
      const id = user?.role === "Accountant" ? user.branch_id : branchId;
      endpoint = `/dashboard?branch_id=${id}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch dashboard data.");

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setAlert(err.message || "Failed to fetch dashboard data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (token && user) {
      if (user.role === "Admin") fetchBranches();
      fetchDashboardData();
    }
  }, [token, user]);

  // Handle branch change
  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);
    fetchDashboardData(branchId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { totalStudents, totalRevenue, activeClasses, recentPayments } =
    dashboardData.data;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h2>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>

        {/* Branch selection for Admin */}
        {user?.role === "Admin" && (
          <FormControl size="small" className="w-64">
            <InputLabel id="branch-select-label">Select Branch</InputLabel>
            <Select
              labelId="branch-select-label"
              label="Select Branch"
              value={selectedBranch}
              onChange={handleBranchChange}
            >
              <MenuItem value="">All Branches</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users className="w-7 h-7" />}
          color="from-blue-500 to-indigo-500"
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-7 h-7" />}
          color="from-green-400 to-emerald-500"
          month={new Date().toLocaleString("default", { month: "long" })}
        />
        <DashboardCard
          title="Active Classes"
          value={activeClasses.toString()}
          icon={<Activity className="w-7 h-7" />}
          color="from-rose-400 to-red-500"
        />
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Payments
          </h3>
          <button className="text-sm text-gray-600 hover:text-black hover:underline">
            View All
          </button>
        </div>

        {recentPayments.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {recentPayments.map((payment, index) => (
              <li
                key={payment.payment_id || index}
                className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors duration-150 px-2 rounded-md"
              >
                <div className="flex flex-col">
                  <p className="text-gray-800 font-medium">
                    {payment.firstName} {payment.lastName}
                  </p>
                  <span className="text-xs text-gray-500">
                    Student ID: {payment.student_id}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${payment.amount.toLocaleString()}
                  </p>
                  <span className="text-sm text-gray-400">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No recent payments found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
