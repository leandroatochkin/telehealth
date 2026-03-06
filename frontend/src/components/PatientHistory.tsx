import { Box, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import { notify } from "../lib/notifications";

export default function PatientHistory() {

  const [patientId, setPatientId] = useState("");
  const [history, setHistory] = useState("");

  const handleSave = () => {
    notify("Medical history updated", "success");
  };

  return (

    <Box>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Patient History
      </Typography>

      <TextField
        label="Patient ID"
        fullWidth
        sx={{ mb: 2 }}
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />

      <TextField
        label="Medical History"
        multiline
        rows={6}
        fullWidth
        sx={{ mb: 3 }}
        value={history}
        onChange={(e) => setHistory(e.target.value)}
      />

      <Button
        variant="contained"
        onClick={handleSave}
      >
        Update History
      </Button>

    </Box>
  );
}