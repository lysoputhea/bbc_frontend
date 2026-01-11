// -------- src/context/AlertContext.jsx --------
// Manages global state for alert notifications.
import React, { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlertState] = useState({
    open: false,
    message: "",
    severity: "info", // can be 'error', 'warning', 'info', 'success'
  });

  const setAlert = (message, severity) => {
    setAlertState({ open: true, message, severity });
  };

  const clearAlert = () => {
    setAlertState({ ...alert, open: false });
  };

  return (
    <AlertContext.Provider value={{ alert, setAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = () => {
  return useContext(AlertContext);
};
