import {
  Dialog,
  Box,
  TextField,
  Typography,
  Button
} from "@mui/material";

import { useState } from "react";
import { notify } from "../lib/notifications";

export default function PrescriptionModal({ open, onClose }: any) {

  const [patientId, setPatientId] = useState("");
  const [drug, setDrug] = useState("");

  const handleGenerate = () => {

    if (!patientId) {
      notify("Patient ID required", "warning");
      return;
    }

    notify("Prescription generated", "success");

    onClose();
  };

  return (

    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

      <Box sx={{ p: 4 }}>

        <Typography variant="h6" sx={{ mb: 3 }}>
          Digital Prescription
        </Typography>

        <TextField
          label="Patient ID"
          fullWidth
          sx={{ mb: 3 }}
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />

        <TextField
          label="Search Medication"
          fullWidth
          sx={{ mb: 3 }}
          value={drug}
          onChange={(e) => setDrug(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={handleGenerate}
        >
          Generate PDF
        </Button>

      </Box>

    </Dialog>
  );
}