// -------- src/pages/Classes.jsx --------
// A new page to display and manage classes using MUI DataGrid.
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    book: "",
    room_number: "",
    price: "",
    branch_id: "",
  });
  const [editingClass, setEditingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedBranch, setSelectedBranch] = useState("");
  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();

  const fetchClasses = async () => {
    setIsLoading(true);
    let endpoint = "/classes";
    if (user?.role === "Accountant") {
      endpoint = `/classes?branch_id=${user.branch_id}`;
    } else if (selectedBranch) {
      endpoint = `/classes?branch_id=${selectedBranch}`;
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
      if (!response.ok) throw new Error("Failed to fetch classes.");
      const data = await response.json();
      setClasses(data?.data?.classes || []);
    } catch (err) {
      setAlert(err.message || "Failed to fetch classes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (user?.role !== "Admin") return;
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
      setBranches(data?.data?.branches || []);
    } catch (err) {
      setAlert(err.message || "Failed to fetch branches.", "error");
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchClasses();
      if (user.role === "Admin") {
        fetchBranches();
      }
    }
  }, [token, user, selectedBranch]);

  const validateForm = (classData) => {
    const errors = {};
    if (!classData.book.trim()) errors.book = "Book is required.";
    if (!String(classData.price).trim()) errors.price = "price is required.";
    if (!classData.branch_id) errors.branch_id = "Branch is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickOpen = () => {
    setFormErrors({});
    const initialBranchId = user?.role === "Admin" ? "" : user.branch_id;
    setNewClass({
      book: "",
      room_number: "",
      price: "",
      branch_id: initialBranchId,
    });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setNewClass({ book: "", room_number: "", price: "", branch_id: "" });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({ ...newClass, [name]: value });
  };

  const handleEditClick = (cls) => {
    setFormErrors({});
    setEditingClass(cls);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditingClass(null);
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingClass({ ...editingClass, [name]: value });
  };

  const handleDeleteClick = (cls) => {
    setDeletingClass(cls);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingClass(null);
  };

  const handleFormSubmit = async () => {
    if (!validateForm(newClass)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add class.");
      }
      setAlert("Class added successfully!", "success");
      fetchClasses();
      handleClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleEditFormSubmit = async () => {
    if (!validateForm(editingClass)) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${editingClass.class_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingClass),
        }
      );
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update class.");
      }
      setAlert("Class updated successfully!", "success");
      fetchClasses();
      handleEditClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${deletingClass.class_id}`,
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
        throw new Error(errorData.message || "Failed to delete class.");
      }
      setAlert("Class deleted successfully!", "success");
      fetchClasses();
      handleDeleteClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  // DataGrid columns
  const columns = [
    { field: "class_id", headerName: "ID", width: 90 },
    { field: "room_number", headerName: "Room Number", width: 150 },
    { field: "book", headerName: "Book", width: 150 },
    { field: "branch_name", headerName: "Branch", width: 90 },
    {
      field: "price",
      headerName: "Price",
      width: 90,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      align: "right",
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            aria-label="edit class"
            onClick={() => handleEditClick(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            aria-label="delete class"
            onClick={() => handleDeleteClick(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

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
          Class Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Class
        </Button>
      </Box>

      {user?.role === "Admin" && (
        <FormControl sx={{ mb: 2, minWidth: 240 }} size="small">
          <InputLabel id="branch-filter-label">Filter by Branch</InputLabel>
          <Select
            labelId="branch-filter-label"
            value={selectedBranch}
            label="Filter by Branch"
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <MenuItem value="">
              <em>All Branches</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Paper sx={{ width: "100%", height: 500, boxShadow: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={classes}
            columns={columns}
            getRowId={(row) => row.class_id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        )}
      </Paper>

      {/* --- Add Dialog --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="book"
            label="Book"
            type="text"
            fullWidth
            variant="standard"
            value={newClass.book}
            onChange={handleInputChange}
            error={!!formErrors.book}
            helperText={formErrors.book}
          />
          <TextField
            margin="dense"
            name="room_number"
            label="Room Number"
            type="text"
            fullWidth
            variant="standard"
            value={newClass.room_number}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            variant="standard"
            value={newClass.price}
            onChange={handleInputChange}
            error={!!formErrors.price}
            helperText={formErrors.price}
          />
          {user?.role === "Admin" && (
            <FormControl
              fullWidth
              margin="dense"
              variant="standard"
              error={!!formErrors.branch_id}
            >
              <InputLabel id="branch-select-label">Branch</InputLabel>
              <Select
                labelId="branch-select-label"
                name="branch_id"
                value={newClass.branch_id}
                onChange={handleInputChange}
                label="Branch"
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* --- Edit Dialog --- */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="book"
            label="Book"
            type="text"
            fullWidth
            variant="standard"
            value={editingClass?.book || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.book}
            helperText={formErrors.book}
          />
          <TextField
            margin="dense"
            name="room_number"
            label="Room Number"
            type="text"
            fullWidth
            variant="standard"
            value={editingClass?.room_number || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            variant="standard"
            value={editingClass?.price || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.price}
            helperText={formErrors.price}
          />
          {user?.role === "Admin" && (
            <FormControl
              fullWidth
              margin="dense"
              variant="standard"
              error={!!formErrors.branch_id}
            >
              <InputLabel id="branch-select-label-edit">Branch</InputLabel>
              <Select
                labelId="branch-select-label-edit"
                name="branch_id"
                value={editingClass?.branch_id || ""}
                onChange={handleEditInputChange}
                label="Branch"
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditFormSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Dialog --- */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the class "{deletingClass?.book}"?
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

export default Classes;
