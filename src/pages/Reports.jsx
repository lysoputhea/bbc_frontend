import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ReportIcon from "@mui/icons-material/Assessment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Reports = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    selectedBranch: null,
    startDate: null,
    endDate: null,
  });

  const { token, user } = useAuth();
  const { setAlert } = useAlert();

  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
    setFormErrors((prev) => ({ ...prev, startDate: null }));
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
    setFormErrors((prev) => ({ ...prev, endDate: null }));
  }, []);

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

  const handleGenerateReport = useCallback(async () => {
    setFormErrors({ selectedBranch: null, startDate: null, endDate: null });

    if (user?.role === "Admin" && !selectedBranch) {
      const errorMsg = "Branch is required";
      setFormErrors((prev) => ({ ...prev, selectedBranch: errorMsg }));
      setAlert(errorMsg, "error");
      return;
    }

    if (!startDate) {
      const errorMsg = "Start date is required";
      setFormErrors((prev) => ({ ...prev, startDate: errorMsg }));
      setAlert(errorMsg, "error");
      return;
    }

    if (!endDate) {
      const errorMsg = "End date is required";
      setFormErrors((prev) => ({ ...prev, endDate: errorMsg }));
      setAlert(errorMsg, "error");
      return;
    }

    if (startDate.isAfter(endDate)) {
      const errorMsg = "Start date must be before or equal to end date";
      setFormErrors((prev) => ({ ...prev, endDate: errorMsg }));
      setAlert(errorMsg, "error");
      return;
    }

    setIsLoading(true);
    try {
      const startDateFormatted = startDate.format("YYYY-MM-DD");
      const endDateFormatted = endDate.format("YYYY-MM-DD");

      let branchId;
      if (user?.role === "Admin") {
        branchId = selectedBranch || null;
      } else {
        branchId = user?.branch_id;
      }

      if (!branchId && user?.role !== "Admin") {
        throw new Error("No branch ID available. Please check your profile.");
      }

      const params = new URLSearchParams({
        branch_id: branchId || "",
        start_date: startDateFormatted,
        end_date: endDateFormatted,
      });

      // if (branchId) {
      //   params.append("branch_id", branchId);
      // }

      const response = await fetch(
        `${API_BASE_URL}/reports/monthly-student-payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized. Please log in again.");
        if (response.status === 404)
          throw new Error("Report endpoint not found.");
        throw new Error(
          `Failed to generate report: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // ✅ FIX: extract the array inside `data.data` and add unique rowId
      const processedData = (data.data || []).map((row, index) => ({
        ...row,
        rowId: row.student_id ? `${row.student_id}_${index}` : `row_${index}`,
      }));

      setReportData(processedData);

      setAlert("Report generated successfully", "success");
    } catch (error) {
      console.error("Error generating report:", error);
      setAlert(
        error.message || "An error occurred while generating the report",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    startDate,
    endDate,
    selectedBranch,
    user?.role,
    user?.branch_id,
    token,
    setAlert,
  ]);

  const handleExportExcel = useCallback(() => {
    if (reportData.length === 0) {
      setAlert("No data to export", "warning");
      return;
    }

    const data = reportData.map((row) => ({
      "Student ID": row.student_id || "",
      "Student Name": `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      Amount: row.total_amount || "",
      Month: row.month || "",
      Branch: row.branch_name || "",
      Book: row.book || "",
      Room: row.room_number || "",
      payment_date: row.payment_date
        ? dayjs(row.payment_date).format("YYYY-MM-DD")
        : "",
      "Due Date": row.due_date ? dayjs(row.due_date).format("YYYY-MM-DD") : "",
      "Issue Date": row.issue_date
        ? dayjs(row.issue_date).format("YYYY-MM-DD")
        : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Payments");

    const filename = `student-payments-${startDate.format(
      "YYYY-MM-DD"
    )}_to_${endDate.format("YYYY-MM-DD")}.xlsx`;

    XLSX.writeFile(wb, filename);
    setAlert("Report exported to Excel", "success");
  }, [reportData, startDate, endDate, setAlert]);

  const columns = [
    {
      field: "student_id",
      headerName: "Student ID",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "student_name",
      headerName: "Student Name",
      width: 180,
      renderCell: (params) =>
        `${params.row.first_name || ""} ${params.row.last_name || ""}`.trim() ||
        "N/A",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "month",
      headerName: "Month",
      width: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "total_amount",
      headerName: "Amount",
      width: 120,
      headerAlign: "right",
      align: "right",
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: "branch_name",
      headerName: "Branch",
      width: 130,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "book",
      headerName: "Book",
      width: 150,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "room_number",
      headerName: "Room",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "payment_date",
      headerName: "Payment Date",
      width: 140,
      headerAlign: "center",
      align: "center",
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
      width: 140,
      headerAlign: "center",
      align: "center",
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
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-GB");
      },
    },
  ];

  useEffect(() => {
    if (token && user) {
      // fetchClasses();
      if (user.role === "Admin") {
        fetchBranches();
      }
    }
  }, [token, user]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        <ReportIcon /> Reports
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Generate Reports
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            gap={2}
            mb={2}
            flexWrap="wrap"
          >
            {user?.role === "Admin" && (
              <FormControl
                size="small"
                sx={{ minWidth: 150 }}
                error={!!formErrors.selectedBranch}
              >
                <InputLabel id="branch-filter-label">Branch</InputLabel>
                <Select
                  labelId="branch-filter-label"
                  value={selectedBranch}
                  label="Branch"
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.selectedBranch && (
                  <FormHelperText>{formErrors.selectedBranch}</FormHelperText>
                )}
              </FormControl>
            )}
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  error: !!formErrors.startDate,
                  helperText: formErrors.startDate,
                },
              }}
              sx={{ minWidth: 140 }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  error: !!formErrors.endDate,
                  helperText: formErrors.endDate,
                },
              }}
              sx={{ minWidth: 140 }}
            />
          </Box>
          <Box display="flex" gap={1} justifyContent="flex-start">
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isLoading}
              size="small"
            >
              {isLoading ? <CircularProgress size={20} /> : "Generate Report"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedBranch("");
                setReportData([]);
                setFormErrors({
                  selectedBranch: null,
                  startDate: null,
                  endDate: null,
                });
              }}
              size="small"
            >
              Clear Filters
            </Button>
          </Box>
        </LocalizationProvider>
      </Paper>
      <Box mt={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Report Results</Typography>
          {reportData.length > 0 && (
            <Button variant="outlined" onClick={handleExportExcel} size="small">
              Export Excel
            </Button>
          )}
        </Box>
        {isLoading ? (
          <CircularProgress />
        ) : reportData.length === 0 ? (
          <Alert severity="info">
            No data available. Generate a report to view results.
          </Alert>
        ) : (
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={reportData}
              getRowId={(row) => row.rowId}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: (theme) => theme.palette.grey[100],
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Reports;
