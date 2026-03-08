import {
  Dialog,
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Paper
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useState, useEffect } from "react";

import { notify } from "../lib/notifications";

import Papa from "papaparse";

import { useDispatch, useSelector } from "react-redux";

import { createPrescription } from "../api/prescriptions.api";

export default function PrescriptionModal({ open, onClose }: any) {
  const dispatch: any = useDispatch();
  const { loading } = useSelector((state: any) => state.prescriptions);
  const { token } = useSelector((state: any) => state.auth);
  const [patientId, setPatientId] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [prescribedDrugs, setPrescribedDrugs] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loadingCsv, setLoadingCsv] = useState(false);


  useEffect(() => {
    if (open) {
      setLoadingCsv(true);
      Papa.parse("/vnm-jun-2018-.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formattedData = results.data.map((row: any) => {
            const cleanRow: any = {};
            Object.keys(row).forEach(key => {
              cleanRow[key.trim()] = row[key];
            });

            return {
              ...cleanRow,
              label: `${cleanRow["NOMBRE COMERCIAL"]} (${cleanRow["NOMBRE GENERICO"]}) - ${cleanRow["CONCENTRACIÓN"]} | ${cleanRow["FORMA FARMACÉUTICA"]} | ${cleanRow["PRESENTACIÓN"]}`
            };

          });

          const uniqueData = Array.from(
            new Set(formattedData.map(a => a.label))
          ).map(label =>
            formattedData.find(a => a.label === label)
          );
          setMedications(uniqueData);
          setLoadingCsv(false);
        }
      });
    }
  }, [open]);


  const handleAddDrug = () => {
    if (!selectedDrug) {
      notify("Select a medication first", "warning");
      return;
    }

    const newEntry = {
      ...selectedDrug,
      prescribedQty: quantity,
      uniqueId: Date.now()
    };

    setPrescribedDrugs([...prescribedDrugs, newEntry]);
    setSelectedDrug(null);
    setQuantity("1");
    notify("Añadido a la receta", "info");
  };


  const removeDrug = (uniqueId: number) => {
    setPrescribedDrugs(
      prescribedDrugs.filter(d => d.uniqueId !== uniqueId)
    );
  };


  const handleGenerate = async () => {
  if (!patientId) {
    notify("Patient DNI required", "warning");
    return;
  }

  if (prescribedDrugs.length === 0) {
    notify("Add at least one drug", "warning");
    return;
  }

  // This is the actual body the backend expects
  const prescriptionBody = {
    patientId, // This is the DNI
    items: prescribedDrugs.map(d => ({
      drugName: d["NOMBRE COMERCIAL"],
      genericName: d["NOMBRE GENERICO"],
      concentration: d["CONCENTRACIÓN"],
      form: d["FORMA FARMACÉUTICA"],
      presentation: d["PRESENTACIÓN"],
      quantity: Number(d.prescribedQty)
    }))
  };

  // 2. Wrap it in the object the thunk expects: { data, token }
  const result = await dispatch(createPrescription({ 
    data: prescriptionBody, 
    token 
  }));

  if (createPrescription.fulfilled.match(result)) {
    notify("Receta creada exitosamente", "success");
    setPrescribedDrugs([]);
    setPatientId("");
    onClose();
  } else {
    // If it failed, action.payload contains the error message from rejectWithValue
    notify(result.payload || "Error al crear la receta", "error");
  }
};


  return (

    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}>
          Receta Médica Digital
        </Typography>
        <Stack spacing={3}>
          <TextField
            label="DNI del Paciente"
            fullWidth
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />

          <Box sx={{ p: 2, border: "1px dashed grey", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
              Añadir Medicamento
            </Typography>

            <Stack spacing={2}>

              <Autocomplete
                options={medications}
                loading={loadingCsv}
                getOptionLabel={(option) => option.label || ""}
                value={selectedDrug}
                onChange={(_event, newValue) => setSelectedDrug(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar Medicamento" />
                )}
              />

              <Stack direction="row" spacing={2}>

                <TextField
                  label="Cantidad"
                  type="number"
                  sx={{ width: "120px" }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={handleAddDrug}
                >
                  Añadir a la Lista
                </Button>

              </Stack>

            </Stack>

          </Box>


          {prescribedDrugs.length > 0 && (
            <Paper variant="outlined" sx={{ maxHeight: 250, overflow: "auto" }}>
              <Typography sx={{ p: 2, pb: 0, fontWeight: "bold" }}>
                Resumen de la Receta
              </Typography>
              <List>
                {prescribedDrugs.map((item) => (
                  <Box key={item.uniqueId}>
                    <ListItem
                      secondaryAction={
                        <IconButton onClick={() => removeDrug(item.uniqueId)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${item["NOMBRE COMERCIAL"]} x ${item.prescribedQty}`}
                        secondary={`${item["FORMA FARMACÉUTICA"]} - ${item["PRESENTACIÓN"]}`}
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            </Paper>
          )}

          <Button
            variant="contained"
            size="large"
            disabled={loading || loadingCsv || prescribedDrugs.length === 0}
            onClick={handleGenerate}
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            {loading ? "Generando..." : `Generar Receta (${prescribedDrugs.length})`}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );

}