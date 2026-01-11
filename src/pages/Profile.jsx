// -------- src/pages/Profile.jsx --------
import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Assuming React Router is used; adjust if not

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleBackToDashboard = () => {
    navigate("/"); // Assuming dashboard is at root
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              bgcolor: "#4f46e5",
              fontSize: 32,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {user?.username || "User"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            User ID: {user?.user_id || "N/A"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            User Role: {user?.role || "N/A"}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Welcome to your profile page. Here you can view and manage your
            account details.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
