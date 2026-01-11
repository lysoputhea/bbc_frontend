// -------- src/pages/Branches.jsx --------
// A new page to display and manage branches using the custom alert system and direct fetch.
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    branch_name: "",
    address: "",
    phone: "",
  });
  const [editingBranch, setEditingBranch] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { token, logout } = useAuth();
  const { setAlert } = useAlert();

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch branches.");
      const data = await response.json();
      setBranches(data.data.branches);
    } catch (err) {
      setAlert(err.message || "Failed to fetch branches.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBranches();
    }
  }, [token]);

  const validateForm = (branchData) => {
    const errors = {};
    if (!branchData.branch_name.trim())
      errors.branch_name = "Branch name is required.";
    if (!branchData.address.trim()) errors.address = "Address is required.";
    if (!branchData.phone.trim()) errors.phone = "Phone number is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickOpen = () => {
    setFormErrors({});
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setNewBranch({ branch_name: "", address: "", phone: "" });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBranch({ ...newBranch, [name]: value });
  };

  const handleEditClick = (branch) => {
    setFormErrors({});
    setEditingBranch(branch);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditingBranch(null);
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBranch({ ...editingBranch, [name]: value });
  };

  const handleDeleteClick = (branch) => {
    setDeletingBranch(branch);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingBranch(null);
  };

  const handleFormSubmit = async () => {
    if (!validateForm(newBranch)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBranch),
      });
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add branch.");
      }
      setAlert("Branch added successfully!", "success");
      fetchBranches();
      handleClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleEditFormSubmit = async () => {
    if (!validateForm(editingBranch)) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/branches/${editingBranch.branch_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingBranch),
        }
      );
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update branch.");
      }
      setAlert("Branch updated successfully!", "success");
      fetchBranches();
      handleEditClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBranch) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/branches/${deletingBranch.branch_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete branch.");
      }
      setAlert("Branch deleted successfully!", "success");
      fetchBranches();
      handleDeleteClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Branch Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Branch
        </Button>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: 3 }}>
        <TableContainer>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Branch ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Branch Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={branch.branch_id}
                  >
                    <TableCell>{branch.branch_id}</TableCell>
                    <TableCell>{branch.branch_name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.phone}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        aria-label="edit branch"
                        onClick={() => handleEditClick(branch)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="delete branch"
                        onClick={() => handleDeleteClick(branch)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Branch</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="branch_name"
            label="Branch Name"
            type="text"
            fullWidth
            variant="standard"
            value={newBranch.branch_name}
            onChange={handleInputChange}
            error={!!formErrors.branch_name}
            helperText={formErrors.branch_name}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            variant="standard"
            value={newBranch.address}
            onChange={handleInputChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="text"
            fullWidth
            variant="standard"
            value={newBranch.phone}
            onChange={handleInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Branch</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="branch_name"
            label="Branch Name"
            type="text"
            fullWidth
            variant="standard"
            value={editingBranch?.branch_name || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.branch_name}
            helperText={formErrors.branch_name}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            variant="standard"
            value={editingBranch?.address || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="text"
            fullWidth
            variant="standard"
            value={editingBranch?.phone || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditFormSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the branch "
            {deletingBranch?.branch_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches;
