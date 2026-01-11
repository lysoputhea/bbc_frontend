import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Autocomplete,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import Invoices from "../components/Invoices";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentsForSearch, setStudentsForSearch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openInvoices, setOpenInvoices] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [printPaymentId, setPrintPaymentId] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Invoice",
  });
  const [paymentForm, setPaymentForm] = useState({
    student_id: "",
    class_id: "",
    branch_id: "",
    original_amount: "0",
    discount_percentage: "0",
    payment_period_type: "3 Months",
    issue_date: dayjs(),
    due_date: dayjs().add(3, "month"),
    payment_date: dayjs().format("YYYY-MM-DD"),
    description: "",
    status: "Paid",
    first_name: "",
    last_name: "",
    book: "",
    room_number: "",
  });
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
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
  const [formErrors, setFormErrors] = useState({});
  const { token, user, logout } = useAuth();
  const { setAlert } = useAlert();

  const fetchPayments = async () => {
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
        `${API_BASE_URL}/payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch payments.");
      const data = await response.json();
      setPayments(data?.data || []);
      setRowCount(data?.pagination?.totalRecords || 0);
    } catch (err) {
      setAlert(err.message || "Failed to fetch payments.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollmentsForSearch = async (
    branchId,
    classId,
    studentName = ""
  ) => {
    if (!branchId || !classId) {
      setStudentsForSearch([]);
      return;
    }
    const params = new URLSearchParams({
      branch_id: branchId,
      class_id: classId,
      student_name: studentName,
    });
    try {
      const response = await fetch(
        `${API_BASE_URL}/enrollments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch enrollments.");
      const data = await response.json();
      setStudentsForSearch(
        data?.data?.map((enrollment) => ({
          ...enrollment,
          first_name: enrollment.first_name || "",
          last_name: enrollment.last_name || "",
          book: enrollment.book || "",
          room_number: enrollment.room_number || "",
          price: enrollment.price || "0",
        })) || []
      );
    } catch (err) {
      setAlert(err.message || "Failed to fetch enrollments.", "error");
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

  const fetchPaymentById = async (paymentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch payment details.");
      const data = await response.json();
      const paymentData = data?.data || {};
      return {
        ...paymentData,
        original_amount: paymentData.original_amount?.toString() || "0",
        discount_percentage: paymentData.discount_percentage?.toString() || "0",
        payment_date: paymentData.payment_date
          ? dayjs(paymentData.payment_date).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        issue_date: paymentData.issue_date
          ? dayjs(paymentData.issue_date).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        due_date: paymentData.due_date
          ? dayjs(paymentData.due_date).format("YYYY-MM-DD")
          : dayjs().add(3, "month").format("YYYY-MM-DD"),
        first_name: paymentData.first_name || "",
        last_name: paymentData.last_name || "",
        book: paymentData.book || "",
        room_number: paymentData.room_number || "",
        price: paymentData.price || "0",
      };
    } catch (err) {
      setAlert(err.message || "Failed to fetch payment details.", "error");
      return null;
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchPayments();
      fetchBranches();
      if (user.role === "Accountant") {
        fetchClassesByBranch(user.branch_id);
      }
    }
  }, [token, user, paginationModel]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (token) fetchPayments();
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, token]);

  const validateForm = (paymentData) => {
    const errors = {};
    if (!paymentData.student_id) errors.student_id = "Student is required.";
    if (
      isNaN(paymentData.original_amount) ||
      paymentData.original_amount <= 0
    ) {
      errors.original_amount = "A valid amount is required.";
    }
    if (
      !paymentData.issue_date ||
      !dayjs(paymentData.issue_date, "YYYY-MM-DD", true).isValid()
    ) {
      errors.issue_date = "A valid issue date (YYYY-MM-DD) is required.";
    }
    if (
      !paymentData.due_date ||
      !dayjs(paymentData.due_date, "YYYY-MM-DD", true).isValid()
    ) {
      errors.due_date = "A valid due date (YYYY-MM-DD) is required.";
    }
    if (
      paymentData.issue_date &&
      paymentData.due_date &&
      dayjs(paymentData.due_date).isBefore(dayjs(paymentData.issue_date))
    ) {
      errors.due_date = "Due date must be after issue date.";
    }
    if (
      isNaN(paymentData.discount_percentage) ||
      paymentData.discount_percentage < 0 ||
      paymentData.discount_percentage > 100
    ) {
      errors.discount_percentage =
        "Discount percentage must be between 0 and 100.";
    }
    if (
      !paymentData.payment_date ||
      !dayjs(paymentData.payment_date, "YYYY-MM-DD", true).isValid()
    ) {
      errors.payment_date = "A valid payment date (YYYY-MM-DD) is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateDiscountAmount = (originalAmount, discountPercentage) => {
    const amount = parseFloat(originalAmount) || 0;
    const percentage = parseFloat(discountPercentage) || 0;
    return ((amount * percentage) / 100).toFixed(2);
  };

  const calculateTotalAmount = (originalAmount, discountAmount) => {
    const amount = parseFloat(originalAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    return (amount - discount).toFixed(2);
  };

  const handleClickOpen = () => {
    setFormErrors({});
    setPaymentForm({
      student_id: "",
      class_id: "",
      branch_id: user?.role === "Admin" ? "" : user.branch_id,
      original_amount: "0",
      discount_percentage: "0",
      payment_period_type: "3 Months",
      issue_date: dayjs(),
      due_date: dayjs().add(3, "month"),
      payment_date: dayjs().format("YYYY-MM-DD"),
      description: "",
      status: "Paid",
      first_name: "",
      last_name: "",
      book: "",
      room_number: "",
    });
    setSelectedEnrollment(null);
    setStudentsForSearch([]);
    if (user?.role !== "Admin") {
      fetchClassesByBranch(user.branch_id);
    }
    setEditingPayment(null);
    setOpen(true);
  };

  const handleEditPayment = async (payment) => {
    setFormErrors({});
    const paymentData = await fetchPaymentById(payment.payment_id);
    if (paymentData) {
      setPaymentForm({
        ...paymentData,
        issue_date: dayjs(paymentData.issue_date),
        due_date: dayjs(paymentData.due_date),
        payment_date: paymentData.payment_date,
        branch_id: paymentData.branch_id || user.branch_id,
        original_amount: paymentData.original_amount.toString(),
        discount_percentage: paymentData.discount_percentage.toString(),
        first_name: paymentData.first_name || "",
        last_name: paymentData.last_name || "",
        book: paymentData.book || "",
        room_number: paymentData.room_number || "",
      });
      setEditingPayment(paymentData);
      setSelectedEnrollment({
        student_id: paymentData.student_id,
        class_id: paymentData.class_id,
        branch_id: paymentData.branch_id,
        first_name: paymentData.first_name || "",
        last_name: paymentData.last_name || "",
        book: paymentData.book || "",
        room_number: paymentData.room_number || "",
        price: paymentData.price || "0",
      });
      if (paymentData.branch_id) {
        await fetchClassesByBranch(paymentData.branch_id);
      }
      if (paymentData.branch_id && paymentData.class_id) {
        await fetchEnrollmentsForSearch(
          paymentData.branch_id,
          paymentData.class_id
        );
      }
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPayment(null);
    setSelectedEnrollment(null);
    setStudentsForSearch([]);
    setFormErrors({});
  };

  const handleCloseInvoices = () => setOpenInvoices(false);

  const handleInputChange = (name, value) => {
    let updatedPayment = { ...paymentForm, [name]: value };
    let updatedAmount = paymentForm.original_amount;
    if (name === "original_amount" || name === "discount_percentage") {
      const cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      const numericValue =
        parts[0] + (parts[1] ? "." + parts.slice(1).join("") : "");
      updatedPayment = { ...paymentForm, [name]: numericValue };
    } else if (name === "payment_period_type") {
      let amountMultiplier = 1;
      let dateMultiplier = 1;
      switch (value) {
        case "1 Month":
          amountMultiplier = 1;
          dateMultiplier = 1;
          break;
        case "3 Months":
          amountMultiplier = 3;
          dateMultiplier = 3;
          break;
        case "6 Months":
          amountMultiplier = 6;
          dateMultiplier = 6;
          break;
        case "12 Months":
          amountMultiplier = 12;
          dateMultiplier = 12;
          break;
        default:
          amountMultiplier = 1;
          dateMultiplier = 1;
      }
      if (selectedEnrollment?.price) {
        updatedAmount = (
          parseFloat(selectedEnrollment.price) * amountMultiplier
        ).toFixed(2);
      }
      updatedPayment = {
        ...paymentForm,
        [name]: value,
        original_amount: updatedAmount,
        due_date: paymentForm.issue_date.add(dateMultiplier, "month"),
      };
    } else if (
      name === "issue_date" ||
      name === "due_date" ||
      name === "payment_date"
    ) {
      updatedPayment = {
        ...paymentForm,
        [name]: value,
      };
      if (name === "issue_date") {
        let dateMultiplier = 1;
        switch (paymentForm.payment_period_type) {
          case "1 Month":
            dateMultiplier = 1;
            break;
          case "3 Months":
            dateMultiplier = 3;
            break;
          case "6 Months":
            dateMultiplier = 6;
            break;
          case "12 Months":
            dateMultiplier = 12;
            break;
          default:
            dateMultiplier = 1;
        }
        updatedPayment.due_date = value.add(dateMultiplier, "month");
      }
    }
    setPaymentForm(updatedPayment);
  };

  const handleDialogInputChange = (e) => {
    const { name, value } = e.target;
    const updatedPayment = { ...paymentForm, [name]: value };
    if (name === "branch_id") {
      updatedPayment.class_id = "";
      updatedPayment.student_id = "";
      setSelectedEnrollment(null);
      setStudentsForSearch([]);
      fetchClassesByBranch(value);
    }
    if (name === "class_id") {
      updatedPayment.student_id = "";
      setSelectedEnrollment(null);
      setStudentsForSearch([]);
      if (value) {
        fetchEnrollmentsForSearch(updatedPayment.branch_id, value);
      }
    }
    setPaymentForm(updatedPayment);
  };

  const handleStudentSelect = (event, value) => {
    setSelectedEnrollment(value);
    if (value) {
      let amountMultiplier = 1;
      let dateMultiplier = 1;
      switch (paymentForm.payment_period_type) {
        case "1 Month":
          amountMultiplier = 1;
          dateMultiplier = 1;
          break;
        case "3 Months":
          amountMultiplier = 3;
          dateMultiplier = 3;
          break;
        case "6 Months":
          amountMultiplier = 6;
          dateMultiplier = 6;
          break;
        case "12 Months":
          amountMultiplier = 12;
          dateMultiplier = 12;
          break;
        default:
          amountMultiplier = 3;
          dateMultiplier = 3;
      }
      const updatedAmount = (
        parseFloat(value.price || 0) * amountMultiplier
      ).toFixed(2);
      setPaymentForm((prev) => ({
        ...prev,
        student_id: value.student_id,
        class_id: value.class_id,
        branch_id: value.branch_id,
        original_amount: updatedAmount,
        due_date: paymentForm.issue_date.add(dateMultiplier, "month"),
        first_name: value.first_name || "",
        last_name: value.last_name || "",
        book: value.book || "",
        room_number: value.room_number || "",
      }));
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        student_id: "",
        original_amount: "0",
        discount_percentage: "0",
        due_date: paymentForm.issue_date.add(3, "month"),
        first_name: "",
        last_name: "",
        book: "",
        room_number: "",
      }));
    }
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
    if (
      !validateForm({
        ...paymentForm,
        issue_date: paymentForm.issue_date.format("YYYY-MM-DD"),
        due_date: paymentForm.due_date.format("YYYY-MM-DD"),
        payment_date: paymentForm.payment_date,
      })
    )
      return;
    const discountAmount = calculateDiscountAmount(
      paymentForm.original_amount,
      paymentForm.discount_percentage
    );
    const paymentData = {
      ...paymentForm,
      original_amount: parseFloat(paymentForm.original_amount),
      discount_amount: parseFloat(discountAmount),
      issue_date: paymentForm.issue_date.format("YYYY-MM-DD"),
      due_date: paymentForm.due_date.format("YYYY-MM-DD"),
      payment_date: paymentForm.payment_date,
    };
    setOpenConfirm(true);
  };

  const confirmSubmit = async () => {
    setOpenConfirm(false);
    const discountAmount = calculateDiscountAmount(
      paymentForm.original_amount,
      paymentForm.discount_percentage
    );
    const paymentData = {
      ...paymentForm,
      original_amount: parseFloat(paymentForm.original_amount),
      discount_amount: parseFloat(discountAmount),
      issue_date: paymentForm.issue_date.format("YYYY-MM-DD"),
      due_date: paymentForm.due_date.format("YYYY-MM-DD"),
      payment_date: paymentForm.payment_date,
    };
    try {
      const url = editingPayment
        ? `${API_BASE_URL}/payments/${editingPayment.payment_id}`
        : `${API_BASE_URL}/payments`;
      const method = editingPayment ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            (editingPayment
              ? "Failed to update payment."
              : "Failed to create payment.")
        );
      }
      const responseData = await response.json();
      setAlert(
        editingPayment
          ? "Payment updated successfully!"
          : "Payment created successfully!",
        "success"
      );
      fetchPayments();
      if (!editingPayment) {
        setPrintPaymentId(responseData.data.payment_id);
        setOpenInvoices(true);
      }
      handleClose();
    } catch (err) {
      setAlert(err.message, "error");
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePaymentId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${deletePaymentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete payment.");
      }
      setAlert("Payment deleted successfully!", "success");
      fetchPayments();
      setOpenDeleteConfirm(false);
      setDeletePaymentId(null);
    } catch (err) {
      setAlert(err.message || "Failed to delete payment.", "error");
    }
  };

  const columns = [
    { field: "payment_id", headerName: "Payment ID", width: 120 },
    {
      field: "student_name",
      headerName: "Student Name",
      width: 200,
      renderCell: (params) =>
        `${params.row.first_name || ""} ${params.row.last_name || ""}`,
    },
    {
      field: "room_number",
      headerName: "Room Number",
      width: 150,
      renderCell: (params) => params.row.room_number || "",
    },
    {
      field: "payment_period_type",
      headerName: "Payment Period",
      width: 150,
    },
    {
      field: "final_amount",
      headerName: "Total Amount",
      width: 130,
      renderCell: (params) =>
        `$${(
          params.row.original_amount - (params.row.discount_amount || 0)
        ).toFixed(2)}`,
    },
    {
      field: "payment_date",
      headerName: "Payment Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-GB");
      },
    },
    {
      field: "issue_date",
      headerName: "Issue Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-GB");
      },
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-GB");
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Paid" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setPrintPaymentId(params.row.payment_id);
              setOpenInvoices(true);
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => {
              handleEditPayment(params.row);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              setDeletePaymentId(params.row.payment_id);
              setOpenDeleteConfirm(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      {/* Header and New Payment Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Payment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Payment
        </Button>
      </Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, boxShadow: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {user?.role === "Admin" && (
            <Grid size={{ xs: 12, sm: 3 }}>
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Number</InputLabel>
              <Select
                name="class_id"
                value={filters.class_id}
                label="Class"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All Room</em>
                </MenuItem>
                {classes.map((classItem) => (
                  <MenuItem key={classItem.class_id} value={classItem.class_id}>
                    {classItem.room_number} - {classItem.book}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              name="student_name"
              label="Search by Student Name"
              value={filters.student_name}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Data Grid */}
      <Paper sx={{ width: "100%", height: 600, boxShadow: 3, borderRadius: 3 }}>
        <DataGrid
          rows={payments}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.payment_id}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          paginationMode="server"
        />
      </Paper>
      {/* Combined Add/Edit Payment Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        disableEnforceFocus
      >
        <DialogTitle>
          {editingPayment ? "Edit Payment" : "Add New Payment"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {user?.role === "Admin" && !editingPayment && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={!!formErrors.branch_id}
                >
                  <InputLabel>Branch</InputLabel>
                  <Select
                    name="branch_id"
                    value={paymentForm.branch_id || ""}
                    onChange={handleDialogInputChange}
                    label="Branch"
                    disabled={editingPayment}
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
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                size="small"
                error={!!formErrors.class_id}
                disabled={!paymentForm.branch_id || editingPayment}
              >
                <InputLabel>Class</InputLabel>
                <Select
                  name="class_id"
                  value={paymentForm.class_id || ""}
                  onChange={handleDialogInputChange}
                  label="Class"
                >
                  {classes.map((classItem) => (
                    <MenuItem
                      key={classItem.class_id}
                      value={classItem.class_id}
                    >
                      {classItem.book}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.class_id && (
                  <FormHelperText>{formErrors.class_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={studentsForSearch}
                getOptionLabel={(option) =>
                  `${option.first_name || ""} ${option.last_name || ""}`
                }
                value={selectedEnrollment}
                onChange={handleStudentSelect}
                onInputChange={(_, newInputValue) => {
                  if (
                    paymentForm.branch_id &&
                    paymentForm.class_id &&
                    !editingPayment
                  ) {
                    fetchEnrollmentsForSearch(
                      paymentForm.branch_id,
                      paymentForm.class_id,
                      newInputValue
                    );
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Student"
                    size="small"
                    error={!!formErrors.student_id}
                    helperText={formErrors.student_id}
                  />
                )}
                disabled={!paymentForm.class_id || editingPayment}
              />
            </Grid>
            {/* {selectedEnrollment && (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          margin="dense"
                          label="Class"
                          value={selectedEnrollment.book || ""}
                          fullWidth
                          size="small"
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          margin="dense"
                          label="Room Number"
                          value={selectedEnrollment.room_number || ""}
                          fullWidth
                          size="small"
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          margin="dense"
                          label="Price Per Month"
                          value={selectedEnrollment.price || "0"}
                          fullWidth
                          size="small"
                          disabled
                        />
                      </Grid>
                    </>
                  )} */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Payment Period</InputLabel>
                <Select
                  name="payment_period_type"
                  value={paymentForm.payment_period_type || ""}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  label="Payment Period"
                >
                  <MenuItem value="1 Month">1 Month</MenuItem>
                  <MenuItem value="3 Months">3 Months</MenuItem>
                  <MenuItem value="6 Months">6 Months</MenuItem>
                  <MenuItem value="12 Months">12 Months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="en-gb"
              >
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    value={paymentForm.issue_date}
                    onChange={(newValue) =>
                      handleInputChange("issue_date", newValue)
                    }
                    label="Issue Date"
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!formErrors.issue_date,
                        helperText: formErrors.issue_date,
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="en-gb"
              >
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    value={paymentForm.due_date}
                    onChange={(newValue) =>
                      handleInputChange("due_date", newValue)
                    }
                    label="Due Date"
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!formErrors.due_date,
                        helperText: formErrors.due_date,
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>
            {/* <Grid size={{ xs: 12, md: 4 }}>
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="en-gb"
                    >
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          value={
                            paymentForm.payment_date
                              ? dayjs(paymentForm.payment_date)
                              : null
                          }
                          onChange={(newValue) =>
                            handleInputChange(
                              "payment_date",
                              newValue ? newValue.format("YYYY-MM-DD") : ""
                            )
                          }
                          label="Payment Date"
                          slotProps={{
                            textField: {
                              size: "small",
                              error: !!formErrors.payment_date,
                              helperText: formErrors.payment_date,
                            },
                          }}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </Grid> */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                margin="dense"
                name="original_amount"
                label="Amount"
                fullWidth
                size="small"
                value={paymentForm.original_amount || ""}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                error={!!formErrors.original_amount}
                helperText={formErrors.original_amount}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                margin="dense"
                name="discount_percentage"
                label="Discount Percentage (%)"
                fullWidth
                size="small"
                value={paymentForm.discount_percentage || ""}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                error={!!formErrors.discount_percentage}
                helperText={formErrors.discount_percentage}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                margin="dense"
                label="Total Amount"
                fullWidth
                size="small"
                value={calculateTotalAmount(
                  paymentForm.original_amount || 0,
                  calculateDiscountAmount(
                    paymentForm.original_amount || 0,
                    paymentForm.discount_percentage || 0
                  )
                )}
                disabled
              />
            </Grid>
            {/* <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={paymentForm.status || ""}
                        onChange={(e) =>
                          handleInputChange(e.target.name, e.target.value)
                        }
                        label="Status"
                      >
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>
            {editingPayment ? "Save Changes" : "Add Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog
        open={openInvoices}
        onClose={handleCloseInvoices}
        fullWidth
        maxWidth="md"
        disableEnforceFocus
      >
        <DialogTitle>
          Invoice
          <Button
            onClick={handlePrint}
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
          >
            Print
          </Button>
        </DialogTitle>
        <DialogContent>
          <Invoices
            ref={componentRef}
            paymentId={printPaymentId}
            token={token}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoices}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Payment Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        disableEnforceFocus
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to {editingPayment ? "update" : "create"} this
            payment?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Student:</strong>{" "}
              {selectedEnrollment
                ? `${selectedEnrollment.first_name || ""} ${
                    selectedEnrollment.last_name || ""
                  }`
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Class:</strong> {selectedEnrollment?.book || "N/A"}
            </Typography>
            <Typography>
              <strong>Room:</strong> {selectedEnrollment?.room_number || "N/A"}
            </Typography>
            <Typography>
              <strong>Period:</strong>{" "}
              {paymentForm.payment_period_type || "N/A"}
            </Typography>
            <Typography>
              <strong>Issue Date:</strong>{" "}
              {paymentForm.issue_date
                ? paymentForm.issue_date.format("DD/MM/YYYY")
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Due Date:</strong>{" "}
              {paymentForm.due_date
                ? paymentForm.due_date.format("DD/MM/YYYY")
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Payment Date:</strong>{" "}
              {paymentForm.payment_date
                ? dayjs(paymentForm.payment_date).format("DD/MM/YYYY")
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Amount:</strong> ${paymentForm.original_amount || "0"}
            </Typography>
            <Typography>
              <strong>Discount Percentage:</strong>{" "}
              {paymentForm.discount_percentage || "0"}%
            </Typography>
            <Typography>
              <strong>Total Amount:</strong> $
              {calculateTotalAmount(
                paymentForm.original_amount || 0,
                calculateDiscountAmount(
                  paymentForm.original_amount || 0,
                  paymentForm.discount_percentage || 0
                )
              )}
            </Typography>
            <Typography>
              <strong>Status:</strong> {paymentForm.status || "N/A"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={confirmSubmit}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        disableEnforceFocus
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePayment}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;
