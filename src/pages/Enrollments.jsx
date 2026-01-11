// -------- src/pages/Enrollments.jsx --------
// A new page to display and manage student enrollments.
import { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  FormHelperText,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    first_name: "",
    last_name: "",
    dob: null,
    gender: "",
    branch_id: "",
    class_id: "",
  });
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    student_name: "",
    branch_id: "",
    class_id: "",
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();

  const fetchEnrollments = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    });

    if (user?.role === "Accountant") {
      params.append("branch_id", user.branch_id);
    } else if (filters.branch_id) {
      params.append("branch_id", filters.branch_id);
    }
    if (filters.class_id) {
      params.append("class_id", filters.class_id);
    }
    if (filters.student_name) {
      params.append("student_name", filters.student_name);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/enrollments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch enrollments.");
      const data = await response.json();
      setEnrollments(data?.data || []);
      setRowCount(data?.pagination?.totalRecords || 0);
    } catch (err) {
      setAlert(err.message || "Failed to fetch enrollments.", "error");
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
      if (!response.ok) throw new Error("Failed to fetch branches.");
      const data = await response.json();
      setBranches(data?.data?.branches || []);
    } catch (err) {
      setAlert(err.message || "Failed to fetch branches.", "error");
    }
  };

  const fetchClassesByBranch = async (branchId) => {
    if (!branchId) {
      setClasses([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes?branch_id=${branchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok)
        throw new Error("Failed to fetch classes for the selected branch.");
      const data = await response.json();
      setClasses(data?.data?.classes || []);
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchEnrollments();
      fetchBranches();
      if (user.role === "Accountant") {
        fetchClassesByBranch(user.branch_id);
      }
    }
  }, [token, user, paginationModel]);

  // Re-fetch data when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (token) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        fetchEnrollments();
      }
    }, 500); // Debounce search input
    return () => clearTimeout(handler);
  }, [filters, token]);

  const validateForm = (enrollmentData) => {
    const errors = {};
    if (!enrollmentData.first_name.trim())
      errors.first_name = "First name is required.";
    if (!enrollmentData.last_name.trim())
      errors.last_name = "Last name is required.";
    if (!enrollmentData.dob) errors.dob = "Date of birth is required.";
    if (!enrollmentData.gender) errors.gender = "Gender is required.";
    if (!enrollmentData.branch_id) errors.branch_id = "Branch is required.";
    if (!enrollmentData.class_id) errors.class_id = "Class is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickOpen = () => {
    setFormErrors({});
    const initialBranchId = user?.role === "Admin" ? "" : user.branch_id;
    setNewEnrollment({
      first_name: "",
      last_name: "",
      dob: null,
      gender: "",
      branch_id: initialBranchId,
      class_id: "",
    });
    if (user?.role !== "Admin") {
      fetchClassesByBranch(user.branch_id);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setClasses([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch_id") {
      fetchClassesByBranch(value);
      setNewEnrollment({ ...newEnrollment, branch_id: value, class_id: "" });
    } else {
      setNewEnrollment({ ...newEnrollment, [name]: value });
    }
  };

  const handleDobChange = (date) => {
    setNewEnrollment((prev) => ({ ...prev, dob: date }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "branch_id") {
      fetchClassesByBranch(value);
      setFilters((prev) => ({ ...prev, class_id: "" }));
    }
  };

  const handleFormSubmit = async () => {
    if (!validateForm(newEnrollment)) return;
    try {
      const submitData = {
        ...newEnrollment,
        dob: newEnrollment.dob.format("YYYY-MM-DD"),
      };
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add enrollment.");
      }
      setAlert("Enrollment added successfully!", "success");
      setFilters((prev) => ({ ...prev, student_name: "" })); // <-- Clear search
      fetchEnrollments();
      handleClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleEditClick = async (enrollment) => {
    setFormErrors({});
    const formattedEnrollment = {
      ...enrollment,
      dob: enrollment.dob ? dayjs(enrollment.dob) : null,
    };
    await fetchClassesByBranch(enrollment.branch_id);
    setEditingEnrollment(formattedEnrollment);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditingEnrollment(null);
    setClasses([]);
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEnrollment({ ...editingEnrollment, [name]: value });
  };

  const handleEditDobChange = (date) => {
    setEditingEnrollment((prev) => ({ ...prev, dob: date }));
  };

  const handleEditFormSubmit = async () => {
    if (!validateForm(editingEnrollment)) return;
    try {
      const { enrollment_id, ...enrollmentData } = editingEnrollment;
      const submitData = {
        ...enrollmentData,
        dob: editingEnrollment.dob.format("YYYY-MM-DD"),
      };
      const response = await fetch(
        `${API_BASE_URL}/enrollments/${enrollment_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update enrollment.");
      }
      setAlert("Enrollment updated successfully!", "success");
      fetchEnrollments();
      handleEditClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleDeleteClick = (enrollment) => {
    setDeletingEnrollment(enrollment);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingEnrollment(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnrollment) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/enrollments/${deletingEnrollment.enrollment_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete enrollment.");
      }
      setAlert("Enrollment deleted successfully!", "success");
      fetchEnrollments();
      handleDeleteClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const columns = [
    { field: "enrollment_id", headerName: "Enroll ID", width: 90 },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "branch_name", headerName: "Branch", width: 150 },
    { field: "book", headerName: "Book", width: 150 },
    { field: "room_number", headerName: "Room Number", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEditClick(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
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
          Enrollment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Enrollment
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2, boxShadow: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Enrollment Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {user?.role === "Admin" && (
            <Grid item size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  name="branch_id"
                  value={filters.branch_id}
                  label="Branch"
                  onChange={handleFilterChange}
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
            </Grid>
          )}
          <Grid item size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                name="class_id"
                value={filters.class_id}
                label="Class"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All Classes</em>
                </MenuItem>
                {classes.map((classItem) => (
                  <MenuItem key={classItem.class_id} value={classItem.class_id}>
                    {classItem.room_number} - {classItem.book}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              name="student_name"
              label="Search by Student Name"
              value={filters.student_name}
              onChange={handleFilterChange}
            />
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              name="room_number"
              label="Search by Room Number"
              value={filters.room_number}
              onChange={handleFilterChange}
            />
          </Grid> */}
        </Grid>
      </Paper>
      <Paper
        sx={{
          width: "100%",
          height: 600,
          boxShadow: 3,
          borderRadius: 3,
        }}
      >
        <DataGrid
          rows={enrollments}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.enrollment_id}
          pageSizeOptions={[5, 10, 20]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          paginationMode="server"
        />
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Enrollment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="first_name"
            label="First Name"
            fullWidth
            variant="standard"
            value={newEnrollment.first_name}
            onChange={handleInputChange}
            error={!!formErrors.first_name}
            helperText={formErrors.first_name}
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Last Name"
            fullWidth
            variant="standard"
            value={newEnrollment.last_name}
            onChange={handleInputChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
          />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Date of Birth"
              value={newEnrollment.dob}
              onChange={handleDobChange}
              slotProps={{
                textField: {
                  margin: "dense",
                  fullWidth: true,
                  variant: "standard",
                  error: !!formErrors.dob,
                  helperText: formErrors.dob,
                },
              }}
            />
          </LocalizationProvider>
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={newEnrollment.gender}
              onChange={handleInputChange}
              label="Gender"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {formErrors.gender && (
              <FormHelperText>{formErrors.gender}</FormHelperText>
            )}
          </FormControl>
          {user?.role === "Admin" && (
            <FormControl
              fullWidth
              margin="dense"
              variant="standard"
              error={!!formErrors.branch_id}
            >
              <InputLabel>Branch</InputLabel>
              <Select
                name="branch_id"
                value={newEnrollment.branch_id}
                onChange={handleInputChange}
                label="Branch"
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.branch_id && (
                <FormHelperText>{formErrors.branch_id}</FormHelperText>
              )}
            </FormControl>
          )}
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.class_id}
          >
            <InputLabel>Enroll in Class</InputLabel>
            <Select
              name="class_id"
              value={newEnrollment.class_id}
              onChange={handleInputChange}
              label="Class"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.class_id} value={classItem.class_id}>
                  {classItem.room_number ? `${classItem.room_number} - ` : ""}
                  {classItem.book}
                </MenuItem>
              ))}
            </Select>
            {formErrors.class_id && (
              <FormHelperText>{formErrors.class_id}</FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>Add Enrollment</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Enrollment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="first_name"
            label="First Name"
            fullWidth
            variant="standard"
            value={editingEnrollment?.first_name || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.first_name}
            helperText={formErrors.first_name}
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Last Name"
            fullWidth
            variant="standard"
            value={editingEnrollment?.last_name || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
          />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Date of Birth"
              value={editingEnrollment?.dob || null}
              onChange={handleEditDobChange}
              slotProps={{
                textField: {
                  margin: "dense",
                  fullWidth: true,
                  variant: "standard",
                  error: !!formErrors.dob,
                  helperText: formErrors.dob,
                },
              }}
            />
          </LocalizationProvider>
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={editingEnrollment?.gender || ""}
              onChange={handleEditInputChange}
              label="Gender"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {formErrors.gender && (
              <FormHelperText>{formErrors.gender}</FormHelperText>
            )}
          </FormControl>
          {user?.role === "Admin" && (
            <FormControl
              fullWidth
              margin="dense"
              variant="standard"
              error={!!formErrors.branch_id}
            >
              <InputLabel>Branch</InputLabel>
              <Select
                name="branch_id"
                value={editingEnrollment?.branch_id || ""}
                onChange={handleEditInputChange}
                label="Branch"
                disabled
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.branch_id && (
                <FormHelperText>{formErrors.branch_id}</FormHelperText>
              )}
            </FormControl>
          )}
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.class_id}
          >
            <InputLabel>Enroll in Class</InputLabel>
            <Select
              name="class_id"
              value={editingEnrollment?.class_id || ""}
              onChange={handleEditInputChange}
              label="Class"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.class_id} value={classItem.class_id}>
                  {classItem.room_number ? `${classItem.room_number} - ` : ""}
                  {classItem.book}
                </MenuItem>
              ))}
            </Select>
            {formErrors.class_id && (
              <FormHelperText>{formErrors.class_id}</FormHelperText>
            )}
          </FormControl>
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
            Are you sure you want to delete this enrollment?
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

export default Enrollments;
