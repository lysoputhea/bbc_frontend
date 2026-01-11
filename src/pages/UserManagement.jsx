// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Typography,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { Edit, Delete, LockReset, Add } from "@mui/icons-material";
// import { useAuth } from "../context/AuthContext";
// import { useAlert } from "../context/AlertContext";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const UserManagement = () => {
//   const { token, user, logout } = useAuth();
//   const { setAlert } = useAlert();
//   const [users, setUsers] = useState([]);
//   const [branches, setBranches] = useState([]); // ✅ Add this line
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);

//   const [form, setForm] = useState({
//     user_id: null,
//     username: "",
//     password: "",
//     role: "",
//     branch_id: "",
//   });

//   const [passwordForm, setPasswordForm] = useState({
//     user_id: null,
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // ✅ Fetch branches
//   const fetchBranches = async () => {
//     // if (user?.role !== "Admin") return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/branches`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error("Failed to fetch branches.");
//       const data = await response.json();
//       setBranches(data?.data?.branches || []);
//     } catch (err) {
//       setAlert(err.message || "Failed to fetch branches.", "error");
//     }
//   };

//   // Fetch users
//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.status === "success") setUsers(data.data);
//     } catch (err) {
//       console.error("Error loading users:", err);
//     }
//   };

//   useEffect(() => {
//     if (token && user) {
//       fetchUsers();
//       fetchBranches(); // ✅ Also load branches on mount
//     }
//   }, [token, user]);

//   // Handle form input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // If user changes role to something other than Accountant → clear branch_id
//     if (name === "role") {
//       setForm((prev) => ({
//         ...prev,
//         role: value,
//         branch_id: value === "Accountant" ? prev.branch_id : "",
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   // Open Add/Edit dialog
//   const handleOpenDialog = (user = null) => {
//     if (user) {
//       setForm({
//         user_id: user.user_id,
//         username: user.username,
//         password: "",
//         role: user.role,
//         branch_id: user.branch_id || "",
//       });
//       setIsEdit(true);
//     } else {
//       setForm({
//         user_id: null,
//         username: "",
//         password: "",
//         role: "",
//         branch_id: "",
//       });
//       setIsEdit(false);
//     }
//     setOpenDialog(true);
//   };

//   // Save user (create or update)
//   const handleSaveUser = async () => {
//     try {
//       const method = isEdit ? "PUT" : "POST";
//       const url = isEdit
//         ? `${API_BASE_URL}/users/${form.user_id}`
//         : `${API_BASE_URL}/users`;

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (data.status === "success") {
//         setOpenDialog(false);
//         fetchUsers();
//       } else {
//         alert(data.error?.message || "Failed to save user");
//       }
//     } catch (err) {
//       console.error("Save user error:", err);
//     }
//   };

//   // Delete user
//   const handleDeleteUser = async (user_id) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/users/${user_id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.status === "success") fetchUsers();
//       else alert(data.error?.message || "Failed to delete user");
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
//   };

//   // Change password
//   const handleOpenPasswordDialog = (user_id) => {
//     setPasswordForm({ user_id, newPassword: "", confirmPassword: "" });
//     setOpenPasswordDialog(true);
//   };

//   const handleChangePassword = async () => {
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/users/${passwordForm.user_id}/change-password`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ newPassword: passwordForm.newPassword }),
//         }
//       );

//       const data = await res.json();
//       if (data.status === "success") {
//         alert("Password updated successfully");
//         setOpenPasswordDialog(false);
//       } else {
//         alert(data.error?.message || "Failed to change password");
//       }
//     } catch (err) {
//       console.error("Change password error:", err);
//     }
//   };

//   const handlePasswordChange = (e) => {
//     setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//       >
//         <Typography variant="h5" fontWeight="bold">
//           User Management
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenDialog()}
//         >
//           Add User
//         </Button>
//       </Box>

//       {/* Table */}
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
//             <TableRow>
//               <TableCell>ID</TableCell>
//               <TableCell>Username</TableCell>
//               <TableCell>Role</TableCell>
//               <TableCell>Branch</TableCell>
//               <TableCell>Created At</TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {users.map((u) => (
//               <TableRow key={u.user_id}>
//                 <TableCell>{u.user_id}</TableCell>
//                 <TableCell>{u.username}</TableCell>
//                 <TableCell>{u.role}</TableCell>
//                 <TableCell>{u.branch_name || "-"}</TableCell>
//                 <TableCell>
//                   {new Date(u.created_at).toLocaleDateString() || "-"}
//                 </TableCell>
//                 <TableCell align="right">
//                   <IconButton
//                     color="primary"
//                     onClick={() => handleOpenDialog(u)}
//                   >
//                     <Edit />
//                   </IconButton>
//                   <IconButton
//                     color="secondary"
//                     onClick={() => handleOpenPasswordDialog(u.user_id)}
//                   >
//                     <LockReset />
//                   </IconButton>
//                   <IconButton
//                     color="error"
//                     onClick={() => handleDeleteUser(u.user_id)}
//                   >
//                     <Delete />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {users.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No users found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Add / Edit Dialog */}
//       <Dialog
//         open={openDialog}
//         onClose={() => setOpenDialog(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
//         <DialogContent>
//           <TextField
//             size="small"
//             margin="dense"
//             label="Username"
//             name="username"
//             value={form.username}
//             onChange={handleChange}
//             fullWidth
//           />

//           {!isEdit && (
//             <TextField
//               size="small"
//               margin="dense"
//               label="Password"
//               name="password"
//               type="password"
//               value={form.password}
//               onChange={handleChange}
//               fullWidth
//             />
//           )}

//           {/* Role select */}
//           <FormControl fullWidth margin="dense" size="small">
//             <InputLabel>Role</InputLabel>
//             <Select
//               name="role"
//               value={form.role}
//               onChange={handleChange}
//               label="Role"
//             >
//               <MenuItem value="Admin">Admin</MenuItem>
//               <MenuItem value="Accountant">Accountant</MenuItem>
//             </Select>
//           </FormControl>

//           {/* Branch select for accountants */}
//           {form.role === "Accountant" && (
//             <FormControl
//               fullWidth
//               margin="dense"
//               size="small"
//               disabled={form.role !== "Accountant"}
//             >
//               <InputLabel>Branch</InputLabel>
//               <Select
//                 name="branch_id"
//                 value={form.branch_id}
//                 onChange={handleChange}
//                 label="Branch"
//                 required={form.role === "Accountant"}
//               >
//                 {/* <MenuItem value="">
//                   <em>None</em>
//                 </MenuItem> */}
//                 {Array.isArray(branches) &&
//                   branches.map((branch) => (
//                     <MenuItem key={branch.branch_id} value={branch.branch_id}>
//                       {branch.branch_name}
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleSaveUser}>
//             {isEdit ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Change Password Dialog */}
//       <Dialog
//         open={openPasswordDialog}
//         onClose={() => setOpenPasswordDialog(false)}
//         fullWidth
//         maxWidth="xs"
//       >
//         <DialogTitle>Change Password</DialogTitle>
//         <DialogContent>
//           <TextField
//             size="small"
//             margin="dense"
//             label="New Password"
//             name="newPassword"
//             type="password"
//             fullWidth
//             value={passwordForm.newPassword}
//             onChange={handlePasswordChange}
//           />
//           <TextField
//             size="small"
//             margin="dense"
//             label="Confirm Password"
//             name="confirmPassword"
//             type="password"
//             fullWidth
//             value={passwordForm.confirmPassword}
//             onChange={handlePasswordChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleChangePassword}>
//             Update
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default UserManagement;

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, LockReset, Add } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Validation helpers
const validateUsername = (username) => {
  if (!username.trim()) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 50) return "Username must be less than 50 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Username can only contain letters, numbers, and underscores";
  return "";
};

const validatePassword = (password, isEdit = false) => {
  if (!isEdit && !password) return "Password is required for new users";
  if (password && password.length < 6)
    return "Password must be at least 6 characters";
  // if (password && !/(?=.*[a-z])/.test(password))
  //   return "Password must contain at least one lowercase letter";
  // if (password && !/(?=.*[A-Z])/.test(password))
  //   return "Password must contain at least one uppercase letter";
  // if (password && !/(?=.*\d)/.test(password))
  //   return "Password must contain at least one number";
  return "";
};

const validateForm = (form, isEdit) => {
  const errors = {};

  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(form.password, isEdit);
  if (passwordError) errors.password = passwordError;

  if (!form.role) errors.role = "Role is required";

  if (form.role === "Accountant" && !form.branch_id) {
    errors.branch_id = "Branch is required for Accountants";
  }

  return errors;
};

const UserManagement = () => {
  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const [form, setForm] = useState({
    user_id: null,
    username: "",
    password: "",
    role: "",
    branch_id: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    user_id: null,
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch branches
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch branches.");
      const data = await response.json();
      setBranches(data?.data?.branches || data?.branches || data || []);
    } catch (err) {
      setAlert(err.message || "Failed to fetch branches.", "error");
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setUsers(data.data);
      } else {
        setAlert(data.error?.message || "Failed to fetch users.", "error");
      }
    } catch (err) {
      setAlert("Error loading users: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchUsers();
      fetchBranches();
    }
  }, [token, user]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // If user changes role to something other than Accountant → clear branch_id
    if (name === "role") {
      setForm((prev) => ({
        ...prev,
        role: value,
        branch_id: value === "Accountant" ? prev.branch_id : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Open Add/Edit dialog
  const handleOpenDialog = (userData = null) => {
    setFormErrors({});

    if (userData) {
      setForm({
        user_id: userData.user_id,
        username: userData.username,
        password: "",
        role: userData.role,
        branch_id: userData.branch_id || "",
      });
      setIsEdit(true);
    } else {
      setForm({
        user_id: null,
        username: "",
        password: "",
        role: "",
        branch_id: "",
      });
      setIsEdit(false);
    }
    setOpenDialog(true);
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    // Validate form
    const errors = validateForm(form, isEdit);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setAlert("Please fix the errors in the form.", "error");
      return;
    }

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${API_BASE_URL}/users/${form.user_id}`
        : `${API_BASE_URL}/users`;

      const payload = isEdit
        ? {
            username: form.username,
            role: form.role,
            branch_id: form.branch_id,
          }
        : { ...form };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        setAlert(
          `User ${isEdit ? "updated" : "created"} successfully!`,
          "success"
        );
        setOpenDialog(false);
        fetchUsers();
      } else {
        setAlert(
          data.error?.message ||
            `Failed to ${isEdit ? "update" : "create"} user.`,
          "error"
        );
      }
    } catch (err) {
      setAlert("Network error: " + err.message, "error");
    }
  };

  // Delete user
  const handleDeleteUser = async (user_id, username) => {
    if (user_id === user?.user_id) {
      setAlert("You cannot delete your own account.", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}"?`))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setAlert("User deleted successfully!", "success");
        fetchUsers();
      } else {
        setAlert(data.error?.message || "Failed to delete user.", "error");
      }
    } catch (err) {
      setAlert("Error deleting user: " + err.message, "error");
    }
  };

  // Change password dialog
  const handleOpenPasswordDialog = (user_id) => {
    setPasswordErrors({});
    setPasswordForm({ user_id, newPassword: "", confirmPassword: "" });
    setOpenPasswordDialog(true);
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    // else if (!/(?=.*[a-z])/.test(passwordForm.newPassword)) {
    //   errors.newPassword = "Must contain at least one lowercase letter";
    // } else if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) {
    //   errors.newPassword = "Must contain at least one uppercase letter";
    // } else if (!/(?=.*\d)/.test(passwordForm.newPassword)) {
    //   errors.newPassword = "Must contain at least one number";
    // }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setAlert("Please fix password errors.", "error");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${passwordForm.user_id}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: passwordForm.newPassword }),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setAlert("Password updated successfully!", "success");
        setOpenPasswordDialog(false);
      } else {
        setAlert(data.error?.message || "Failed to change password.", "error");
      }
    } catch (err) {
      setAlert("Error changing password: " + err.message, "error");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordErrors({});
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading users...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id} hover>
                  <TableCell>{u.user_id}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {u.username}
                      {u.user_id === user?.user_id && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            bgcolor: "primary.light",
                            color: "white",
                            px: 1,
                            borderRadius: 1,
                          }}
                        >
                          You
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.branch_name || "-"}</TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleDateString() || "-"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(u)}
                      title="Edit user"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenPasswordDialog(u.user_id)}
                      title="Change password"
                    >
                      <LockReset />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(u.user_id, u.username)}
                      disabled={u.user_id === user?.user_id}
                      title={
                        u.user_id === user?.user_id
                          ? "Cannot delete your own account"
                          : "Delete user"
                      }
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            size="small"
            margin="dense"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            error={!!formErrors.username}
            helperText={formErrors.username}
            disabled={isEdit}
          />

          {!isEdit && (
            <TextField
              size="small"
              margin="dense"
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.password}
              helperText={
                formErrors.password ||
                "Min. 6 chars with uppercase, lowercase & number"
              }
            />
          )}

          {/* Role select */}
          <FormControl
            fullWidth
            margin="dense"
            size="small"
            error={!!formErrors.role}
          >
            <InputLabel>Role *</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              label="Role *"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Accountant">Accountant</MenuItem>
            </Select>
            {formErrors.role && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {formErrors.role}
              </Typography>
            )}
          </FormControl>

          {/* Branch select for accountants */}
          {form.role === "Accountant" && (
            <FormControl
              fullWidth
              margin="dense"
              size="small"
              error={!!formErrors.branch_id}
              disabled={loadingBranches}
            >
              <InputLabel>Branch *</InputLabel>
              <Select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                label="Branch *"
              >
                <MenuItem value="" disabled>
                  {loadingBranches ? "Loading branches..." : "Select a branch"}
                </MenuItem>
                {branches.length === 0 && !loadingBranches && (
                  <MenuItem value="" disabled>
                    No branches available
                  </MenuItem>
                )}
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.branch_id && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {formErrors.branch_id}
                </Typography>
              )}
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Password must contain: uppercase, lowercase, and number (min. 6
            chars)
          </Alert>

          <TextField
            autoFocus
            size="small"
            margin="dense"
            label="New Password"
            name="newPassword"
            type="password"
            fullWidth
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
          />

          <TextField
            size="small"
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
