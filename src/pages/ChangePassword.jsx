// -------- src/pages/ChangePassword.jsx --------
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async () => {
    setMessage("");
    setMessageType("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long!");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessage("Password changed successfully!");
        setMessageType("success");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage(data.error?.message || "Failed to change password");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Error connecting to server");
      setMessageType("error");
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{ p: 3 }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 480 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Username:</strong> {user?.username}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Role:</strong> {user?.role}
        </Typography>
        {user?.role === "Accountant" && user?.branch_name && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>Branch:</strong> {user.branch_name}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Change Password
        </Typography>

        <TextField
          fullWidth
          label="Current Password"
          name="currentPassword"
          type="password"
          margin="dense"
          value={form.currentPassword}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="New Password"
          name="newPassword"
          type="password"
          margin="dense"
          value={form.newPassword}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          margin="dense"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />

        {message && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: messageType === "success" ? "green" : "red",
              fontWeight: "medium",
            }}
          >
            {message}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
