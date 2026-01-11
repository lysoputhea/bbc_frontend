// -------- src/components/Header.jsx --------
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Box,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfileClick = () => {
    handleMenuClose();
    window.location.href = "/profile";
  };

  // const handleChangePasswordClick = () => {
  //   handleMenuClose();
  //   window.location.href = "/change-password";
  // };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: "#fff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side - app title */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          School Management
        </Typography>

        {/* Right side - user info */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {user?.username}
          </Typography>
          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar
              sx={{
                bgcolor: "#4f46e5",
                width: 36,
                height: 36,
                fontSize: 16,
              }}
            >
              {user?.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={handleProfileClick} sx={{ fontWeight: 500 }}>
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            {/* <MenuItem
              onClick={handleChangePasswordClick}
              sx={{ fontWeight: 500 }}
            >
              <Typography variant="body2">Change Password</Typography>
            </MenuItem> */}
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                logout();
              }}
              sx={{ color: "error.main", fontWeight: 500 }}
            >
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
