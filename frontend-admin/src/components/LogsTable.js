import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography, Box, Button, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";

const LogsTable = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [elementFilter, setElementFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://ulsaceiit.xyz/dev/getAllLogs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(0); // Reset page to 0 when limit changes
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const filteredLogs = logs.filter(log => 
    (userFilter ? log.user.includes(userFilter) : true) &&
    (actionFilter ? log.action.includes(actionFilter) : true) &&
    (elementFilter ? log.element.includes(elementFilter) : true)
  );

  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const currentPageData = filteredLogs.slice(startIndex, endIndex);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="div" gutterBottom>
            Logs
          </Typography>
          <Typography variant="subtitle1" component="div" gutterBottom>
            View and filter logs
          </Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="User"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Element"
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Log List</Typography>
              <div className="table-container">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Element</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((log, index) => (
                      <tr key={log._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{log.user}</td>
                        <td>{log.action}</td>
                        <td>{log.element}</td>
                        <td>{new Date(log.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <FormControl variant="outlined" size="small">
            <InputLabel>Results per page</InputLabel>
            <Select value={limit} onChange={handleLimitChange} label="Results per page">
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Button variant="contained" onClick={handlePrevPage} disabled={page === 0}>
              Previous
            </Button>
            <Button variant="contained" onClick={handleNextPage} disabled={endIndex >= filteredLogs.length}>
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LogsTable;
