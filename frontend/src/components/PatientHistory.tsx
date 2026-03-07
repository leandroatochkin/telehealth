import { 
  Box, Typography, TextField, Button, Paper, Divider, 
  Stack, Accordion, AccordionSummary, AccordionDetails, Chip,
  Pagination
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState, useMemo } from "react";
import { useAppSelector } from "../lib/hooks";
import { notify } from "../lib/notifications";

export default function PatientHistory() {
  const { token } = useAppSelector(state => state.auth);
    const { colors } =
    useAppSelector((state) => state.theme);
  
  // Search State
  const [dni, setDni] = useState("");
  const [patient, setPatient] = useState<any>(null);

  // Filter State
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // New Entry State
  const [showAddForm, setShowAddForm] = useState(false);
  const [details, setDetails] = useState("");
  const [diagInput, setDiagInput] = useState("");
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterText, setFilterText] = useState("");
  // 1. CLEAR STATE ON ADD
  const handleOpenAddForm = () => {
    setDetails("");
    setDiagnostics([]);
    setDiagInput("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(true);
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/history/search/${dni}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.status === "success") {
        setPatient(json.data);
        setPage(1); // Reset page on new search
      }
      else notify(json.message, "error");
    } catch (e) { notify("Error searching patient", "error"); }
  };

  // 2. DATE FILTERING & PAGINATION LOGIC
  const filteredEntries = useMemo(() => {
    if (!patient?.patientHistory?.entries) return [];
    
    let entries = [...patient.patientHistory.entries];
    
    // Filter by Date
    if (filterDate) {
      entries = entries.filter((e: any) => 
        new Date(e.date).toISOString().split('T')[0] === filterDate
      );
    }

    // Filter by Text (Details or Diagnostics)
    if (filterText) {
      const query = filterText.toLowerCase();
      entries = entries.filter((e: any) => {
        const inDetails = e.details.toLowerCase().includes(query);
        const inDiagnostics = e.diagnostics.some((d: string) => 
          d.toLowerCase().includes(query)
        );
        return inDetails || inDiagnostics;
      });
    }

    return entries;
  }, [patient, filterDate, filterText]); // Dependencies updated

  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, page]);

  const handleAddDiagnostic = () => {
    if (diagInput) {
      setDiagnostics([...diagnostics, diagInput]);
      setDiagInput("");
    }
  };

  const submitEntry = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${patient.id}/entries`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ date: entryDate, details, diagnostics })
    });
    if (res.ok) {
      notify("Entry added", "success");
      setShowAddForm(false);
      handleSearch(); 
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

  const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: "#fff59d", padding: "0 2px" }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: colors.textPrimary }}>
        Historia Clínica por Paciente
      </Typography>

      <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2 }}>
        <TextField 
          label="Buscar por DNI del Paciente" 
          value={dni} 
          onChange={(e) => setDni(e.target.value)} 
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>Buscar</Button>
      </Paper>

      {patient && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Paciente: {patient.name} {patient.surname}</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={handleOpenAddForm}>Agregar Entrada</Button>
              <Button startIcon={<PictureAsPdfIcon />} color="secondary" onClick={() => downloadPdf()}>Exportar Todo</Button>
            </Stack>
          </Box>

          {/* DATE FILTER UI */}
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
            {(filterDate || filterText) && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => { setFilterDate(""); setFilterText(""); }}
              >
                Limpiar
              </Button>
            )}
          </Paper>

          {showAddForm && (
            <Paper sx={{ p: 3, mb: 4, border: '2px solid #1976d2' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Nueva Entrada Médica</Typography>
              <TextField 
                type="date" label="Fecha" fullWidth sx={{ mb: 2 }} 
                value={entryDate} onChange={e => setEntryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Detalle de Consulta" multiline rows={4} fullWidth sx={{ mb: 2 }}
                value={details} onChange={e => setDetails(e.target.value)}
              />
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField size="small" label="Diagnóstico" value={diagInput} onChange={e => setDiagInput(e.target.value)} />
                  <Button onClick={handleAddDiagnostic}>Añadir</Button>
                </Stack>
                {diagnostics.map((d, i) => <Chip key={i} label={d} sx={{ m: 0.5 }} onDelete={() => setDiagnostics(diagnostics.filter((_, idx) => idx !== i))} />)}
              </Box>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={submitEntry}>Guardar</Button>
                <Button variant="text" color="error" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              </Stack>
            </Paper>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* 3. SCROLLABLE CONTAINER */}
          <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1, mb: 3 }}>
            {paginatedEntries.length > 0 ? paginatedEntries.map((entry: any) => (
              <Accordion key={entry.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{entry.doctorName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                {/* HIGHLIGHTED DETAILS */}
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                  {highlightText(entry.details, filterText)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {entry.diagnostics.map((d: string, i: number) => (
                    <Chip 
                      key={i} 
                      // HIGHLIGHTED CHIPS
                      label={highlightText(d, filterText)} 
                      color={d.toLowerCase().includes(filterText.toLowerCase()) && filterText ? "secondary" : "primary"}
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
            )) : (
              <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No se encontraron entradas.</Typography>
            )}
          </Box>

          {/* 4. PAGINATION UI */}
          {filteredEntries.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
              <Pagination 
                count={Math.ceil(filteredEntries.length / itemsPerPage)} 
                page={page} 
                onChange={(_, v) => setPage(v)} 
                color="primary" 
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}