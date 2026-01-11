import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ExportMonthlyStudentReport = () => {
  const [report, setReport] = useState([]);
  const { token, user } = useAuth();
  const { setAlert } = useAlert();
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    branch_id: "",
  });

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const res = await fetch(
        `${API_BASE_URL}/reports/monthly-branch-payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setReport(data.data || []);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="End Date"
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Branch ID"
          name="branch_id"
          value={filters.branch_id}
          onChange={(e) =>
            setFilters({ ...filters, branch_id: e.target.value })
          }
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={fetchReport}>
          Apply Filters
        </Button>
      </Paper>

      {/* Report Table */}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Branch</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.length > 0 ? (
              report.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.branch_name}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.total_amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ExportMonthlyStudentReport;
