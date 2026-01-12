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
import { Menu as MenuIcon } from "@mui/icons-material"; // Add this import
import { useAuth } from "../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  // Add toggleSidebar prop
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfileClick = () => {
    handleMenuClose();
    window.location.href = "/profile";
  };

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
        {/* Left side - hamburger menu for mobile + app title */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Hamburger menu button - visible only on mobile */}
          <IconButton
            onClick={toggleSidebar}
            sx={{
              display: { xs: "flex", md: "none" }, // Show only on mobile
              color: "#111827",
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* App title */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            School Management
          </Typography>
        </Box>

        {/* Right side - user info */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              display: { xs: "none", sm: "block" }, // Hide on very small screens
            }}
          >
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
