import { 
  Box, Typography, TextField, Button, Paper, Divider, 
  Stack, Accordion, AccordionSummary, AccordionDetails, Chip,
  Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { notify } from "../lib/notifications";
import { searchPatientByDni, fetchHistoryEntries, addHistoryEntry, getAIDiagnostic} from "../api/history.api";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function PatientHistory() {
  const [aiWarningOpen, setAiWarningOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { colors } = useAppSelector((state) => state.theme);
  
  // Redux State
  const { patient, entries, totalEntries, entriesLoading, loading, aiLoading } = useAppSelector(state => state.history);

  // Local UI State
  const [dni, setDni] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const [showAddForm, setShowAddForm] = useState(false);
  const [details, setDetails] = useState("");
  const [diagInput, setDiagInput] = useState("");
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. Initial Search
  const handleSearch = () => {
    if (dni.trim() && token) {
      dispatch(searchPatientByDni({ dni, token }));
      setPage(1); // Reset page on new patient search
    }
  };

    const downloadPdf = async (entryId?: string) => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/history/patient/${patient.id}/pdf`;
      if (entryId) url += `?entryId=${entryId}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', entryId ? `Consulta_${entryId}.pdf` : `Historia_${patient.dni}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { notify("Error generating PDF", "error"); }
  };

  // 2. Fetch Entries Effect (The "Source of Truth")
  useEffect(() => {
    // We use patient.patientHistory.id which comes from the searchPatientByDni call
    if (token && patient?.patientHistory?.id) {
      dispatch(fetchHistoryEntries({ 
        historyId: patient.patientHistory.id, 
        token, 
        page, 
        search: filterText, 
        date: filterDate 
      }));
    }
  }, [patient?.patientHistory?.id, page, filterText, filterDate, dispatch, token]);

  // --- Helpers ---
  const handleOpenAddForm = () => {
    setDetails("");
    setDiagnostics([]);
    setDiagInput("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(true);
  };

  const submitEntry = async () => {
  if (!details.trim()) {
    notify("El detalle de la consulta es obligatorio", "error");
    return;
  }

  if (token && patient) {
    try {
      // dispatch return a promise
      const resultAction = await dispatch(addHistoryEntry({ 
        patientId: patient.id, 
        token, 
        details, 
        diagnostics, 
        date: entryDate
      }));

      if (addHistoryEntry.fulfilled.match(resultAction)) {
        notify("Entrada guardada correctamente", "success");
        setShowAddForm(false);
        
        // OPTIONAL: If you want to ensure you are seeing the latest 15 
        // after adding one, you can trigger a refresh:
        // dispatch(fetchHistoryEntries({ historyId: patient.patientHistory.id, token, page: 1 }));
      } else {
        notify("Error al guardar la entrada", "error");
      }
    } catch (err) {
      notify("Error de conexión", "error");
    }
  }
};

const handleAddDiagnostic = () => {
  const trimmed = diagInput.trim();
  if (trimmed && !diagnostics.includes(trimmed)) {
    setDiagnostics([...diagnostics, trimmed]);
    setDiagInput("");
  }
};

const handleRemoveDiagnostic = (index: number) => {
  setDiagnostics(diagnostics.filter((_, i) => i !== index));
};
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: "#fff59d", padding: "0 2px" }}>{part}</mark>
          ) : (part)
        )}
      </span>
    );
  };

  const handleRequestAI = async () => {
  setAiWarningOpen(false);
  try {
    const resultAction = await dispatch(getAIDiagnostic({ details, diagnostics, token }));
    if (getAIDiagnostic.fulfilled.match(resultAction)) {
      const { details: aiDetails, diagnostics: aiDiags } = resultAction.payload;
      
      // Append AI analysis to existing details
      setDetails(prev => `${prev}\n\n--- AI ANALYSIS ---\n${aiDetails}`);
      // Merge unique diagnostics
      setDiagnostics(prev => Array.from(new Set([...prev, ...aiDiags])));
      notify("AI analysis integrated", "success");
    }
  } catch (err) {
    notify("Error with AI Service", "error");
  } 
};

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={aiWarningOpen} onClose={() => setAiWarningOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon color="secondary" /> Warning: AI Assistance
                </DialogTitle>
                <DialogContent>
                  <Typography>
                    Esta herramienta utiliza Inteligencia Artificial para analizar datos clínicos. 
                    <strong> No reemplaza el juicio profesional médico.</strong> 
                    La IA puede generar información incorrecta o sesgada. ¿Desea continuar?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setAiWarningOpen(false)}>Cancelar</Button>
                  <Button onClick={handleRequestAI} variant="contained" color="secondary">Entiendo, Continuar</Button>
                </DialogActions>
              </Dialog>
      <Typography variant="h4" gutterBottom sx={{ color: colors.textPrimary }}>
        Historia Clínica por Paciente
      </Typography>

      {/* SEARCH BAR */}
      <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2 }}>
        <TextField 
          label="Buscar por DNI del Paciente" 
          value={dni} 
          onChange={(e) => setDni(e.target.value)} 
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </Paper>

      {patient && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{
              color: colors.textPrimary,
            }}>Paciente: {patient.name} {patient.surname}</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={handleOpenAddForm}>Agregar Entrada</Button>
              <Button startIcon={<PictureAsPdfIcon />} color="secondary" onClick={() => downloadPdf()}>Exportar Todo</Button>
            </Stack>
          </Box>

                    {showAddForm && (
            <Paper sx={{ p: 3, mb: 4, border: `2px solid ${colors.primary}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Registrar Nueva Entrada Médica</Typography>
              <TextField 
                type="date" label="Fecha de la Consulta" fullWidth sx={{ mb: 2 }} 
                value={entryDate} onChange={e => setEntryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Detalle y Evolución" multiline rows={4} fullWidth sx={{ mb: 2 }}
                value={details} onChange={e => setDetails(e.target.value)}
                placeholder="Escriba aquí las notas de la consulta..."
              />
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField 
                    size="small" label="Diagnóstico / Etiqueta" 
                    value={diagInput} onChange={e => setDiagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDiagnostic()}
                  />
                  <Button variant="outlined" onClick={handleAddDiagnostic}>Añadir</Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {diagnostics.map((d, i) => (
                    <Chip key={i} label={d} onDelete={() => handleRemoveDiagnostic(i)} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                variant="outlined"
                color="secondary"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setAiWarningOpen(true)}
                disabled={!details || aiLoading}
              >
                {aiLoading ? "Analizando..." : "AI Diagnostic Assistant"}
              </Button>
                <Button variant="contained" onClick={submitEntry} color="primary">Guardar Entrada</Button>
                <Button variant="text" color="error" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              </Stack>
            </Paper>
          )}

          {
            !showAddForm && (
              <>
              
          {/* FILTERS */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5' }}>
            <FilterListIcon color="action" />
            <TextField 
              type="date" size="small" label="Filtrar por Fecha" 
              value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField 
              size="small" 
              label="Buscar en detalles o diagnósticos..." 
              value={filterText} 
              onChange={(e) => { setFilterText(e.target.value); setPage(1); }}
              sx={{ flex: 1 }}
            />
          </Paper>


          <Divider sx={{ mb: 2 }} />

          {/* 3. SCROLLABLE CONTAINER USING REDUX STATE */}
          <Box sx={{ maxHeight: '375px', overflowY: 'scroll', pr: 1, mb: 3, position: 'relative' }}>
            {entriesLoading && (
               <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', justifyContent: 'center', pt: 5 }}>
                  <Typography variant="body2">Actualizando registros...</Typography>
               </Box>
            )}

            {entries && entries.length > 0 ? entries.map((entry: any) => (
              <Accordion key={entry.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
                    {new Date(entry.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{entry.doctorName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                    {highlightText(entry.details, filterText)}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {entry.diagnostics.map((d: string, i: number) => (
                      <Chip 
                        key={i} 
                        label={highlightText(d, filterText)} 
                        color={filterText && d.toLowerCase().includes(filterText.toLowerCase()) ? "secondary" : "primary"}
                        variant="outlined" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    ))}
                  </Box>
                  <Button size="small" startIcon={<PrintIcon />} onClick={() => downloadPdf(entry.id)}>
                    Imprimir Entrada
                  </Button>
                </AccordionDetails>
              </Accordion>
            )) : !entriesLoading && (
              <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                No se encontraron entradas para este paciente.
              </Typography>
            )}
          </Box>

          {/* 4. PAGINATION UI FROM REDUX TOTALS */}
          {totalEntries > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center'}}>
              <Pagination 
                count={Math.ceil(totalEntries / itemsPerPage)} 
                page={page} 
                onChange={(_, v) => setPage(v)} 
                color="primary" 
              />
            </Box>
          )}
          </>
            )
          }
        </Box>
      )}
    </Box>
  );
}