// -------- src/pages/Students.jsx --------
// A new page to display and manage students.
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  OutlinedInput,
  Chip,
  FormHelperText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Students = () => {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    branch_id: "",
    course_id: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        logout();
        setAlert("Session expired. Please log in again.", "error");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch students.");
      const data = await response.json();
      setStudents(data?.data || []);
    } catch (err) {
      setAlert(err.message || "Failed to fetch students.", "error");
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

  const fetchCoursesByBranch = async (branchId) => {
    if (!branchId) {
      setCourses([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses?branch_id=${branchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok)
        throw new Error("Failed to fetch courses for the selected branch.");
      const data = await response.json();
      setCourses(data?.data || []);
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchStudents();
      fetchBranches();
      if (user.role === "Accountant") {
        fetchCoursesByBranch(user.branch_id);
      }
    }
  }, [token, user]);

  const validateForm = (studentData) => {
    const errors = {};
    if (!studentData.first_name.trim())
      errors.first_name = "First name is required.";
    if (!studentData.last_name.trim())
      errors.last_name = "Last name is required.";
    if (!studentData.dob) errors.dob = "Date of birth is required.";
    if (!studentData.gender) errors.gender = "Gender is required.";
    if (!studentData.branch_id) errors.branch_id = "Branch is required.";
    if (!studentData.course_id && studentData.course_ids?.length === 0)
      errors.course_id = "Course is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickOpen = () => {
    setFormErrors({});
    const initialBranchId = user?.role === "Admin" ? "" : user.branch_id;
    setNewStudent({
      first_name: "",
      last_name: "",
      dob: "",
      gender: "",
      branch_id: initialBranchId,
      course_id: "",
    });
    if (user?.role !== "Admin") {
      fetchCoursesByBranch(user.branch_id);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCourses([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch_id") {
      fetchCoursesByBranch(value);
      setNewStudent({ ...newStudent, branch_id: value, course_id: "" });
    } else {
      setNewStudent({ ...newStudent, [name]: value });
    }
  };

  const handleFormSubmit = async () => {
    if (!validateForm(newStudent)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to add student and enrollments."
        );
      }
      setAlert("Student enrolled successfully!", "success");
      fetchStudents();
      handleClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleEditClick = (student) => {
    setFormErrors({});
    const formattedStudent = {
      ...student,
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
    };
    setEditingStudent(formattedStudent);
    fetchCoursesByBranch(student.branch_id);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditingStudent(null);
    setCourses([]);
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent({ ...editingStudent, [name]: value });
  };

  const handleEditFormSubmit = async () => {
    if (!validateForm(editingStudent)) return;
    try {
      const { student_id, ...studentData } = editingStudent;
      const response = await fetch(`${API_BASE_URL}/students/${student_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student.");
      }
      setAlert("Student updated successfully!", "success");
      fetchStudents();
      handleEditClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleDeleteClick = (student) => {
    setDeletingStudent(student);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingStudent(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/${deletingStudent.student_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student.");
      }
      setAlert("Student deleted successfully!", "success");
      fetchStudents();
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
          Student Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Student
        </Button>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: 3 }}>
        <TableContainer>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.branch_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.is_active ? "Active" : "Inactive"}
                        color={student.is_active ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {student.courses?.map((course) => (
                          <Chip
                            key={course.course_id}
                            label={course.course_name}
                            size="small"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(student)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(student)}
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
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="first_name"
            label="First Name"
            fullWidth
            variant="standard"
            value={newStudent.first_name}
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
            value={newStudent.last_name}
            onChange={handleInputChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
          />
          <TextField
            margin="dense"
            name="dob"
            label="Date of Birth"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={newStudent.dob}
            onChange={handleInputChange}
            error={!!formErrors.dob}
            helperText={formErrors.dob}
          />
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={newStudent.gender}
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
                value={newStudent.branch_id}
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
            error={!!formErrors.course_id}
          >
            <InputLabel>Enroll in Course</InputLabel>
            <Select
              name="course_id"
              value={newStudent.course_id}
              onChange={handleInputChange}
              label="Course"
            >
              {courses.map((course) => (
                <MenuItem key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.course_id && (
              <FormHelperText>{formErrors.course_id}</FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>Add Student</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="first_name"
            label="First Name"
            fullWidth
            variant="standard"
            value={editingStudent?.first_name || ""}
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
            value={editingStudent?.last_name || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
          />
          <TextField
            margin="dense"
            name="dob"
            label="Date of Birth"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={editingStudent?.dob || ""}
            onChange={handleEditInputChange}
            error={!!formErrors.dob}
            helperText={formErrors.dob}
          />
          <FormControl
            fullWidth
            margin="dense"
            variant="standard"
            error={!!formErrors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={editingStudent?.gender || ""}
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
                value={editingStudent?.branch_id || ""}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditFormSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this student?</Typography>
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
export default Students;
