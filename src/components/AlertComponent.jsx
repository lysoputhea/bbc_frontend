// -------- src/components/AlertComponent.jsx --------
// A component to display global alerts using MUI Snackbar.
import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAlert } from "../context/AlertContext";

const AlertComponent = () => {
  const { alert, clearAlert } = useAlert();

  return (
    <Snackbar
      open={alert.open}
      autoHideDuration={6000}
      onClose={clearAlert}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={clearAlert}
        severity={alert.severity}
        sx={{ width: "100%" }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertComponent;
