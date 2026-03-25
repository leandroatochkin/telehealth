import { useEffect, useState } from "react";
import { 
  Box, Typography, Paper, Tabs, Tab, Button, List, ListItem, 
  ListItemText, Divider, TextField, IconButton, Alert, CircularProgress 
} from "@mui/material";
import { 
  Download as DownloadIcon, 
  Storage as StorageIcon, 
  VpnKey as KeyIcon, 
  CloudSync as SyncIcon 
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { fetchAdminBackups, updateApiKeys, fetchApiUsageStats, triggerManualBackup } from "../api/admin.api"; // Añadido fetchApiUsageStats
import { clearAdminMessages } from "../store/slices/admin.slice";
import ApiUsageDashboard from "./ApiUsage";

export default function AdminInfrastructure() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { backups, loading, error, successMessage } = useAppSelector((state) => state.admin);
  const { colors } = useAppSelector((state) => state.theme);

  const [tabValue, setTabValue] = useState(0);
  
  const [streamKeys, setStreamKeys] = useState({ apiKey: "", apiSecret: "" });
  const [geminiKey, setGeminiKey] = useState("");

  // Cargar backups al montar o cambiar a la pestaña 0
  useEffect(() => {
    if (tabValue === 0) dispatch(fetchAdminBackups(token!));
    if (tabValue === 1) dispatch(fetchApiUsageStats(token!)); // Cargar stats al entrar a APIs
  }, [dispatch, token, tabValue]);

  const handleUpdateStream = () => {
    dispatch(updateApiKeys({ type: 'stream', payload: streamKeys, token: token! }));
  };

  const handleUpdateGemini = () => {
    dispatch(updateApiKeys({ type: 'gemini', payload: { geminiKey }, token: token! }));
  };

const handleDownload = async (filename: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/backups/download/${filename}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // El token va seguro en el header
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }

    // Convertimos la respuesta a un objeto binario (Blob)
    const blob = await response.blob();
    
    // Creamos una URL temporal para ese objeto en la memoria del navegador
    const url = window.URL.createObjectURL(blob);
    
    // Creamos un elemento <a> invisible para disparar la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Forzamos el nombre del archivo
    document.body.appendChild(a);
    a.click();

    // Limpieza: removemos el link y liberamos la memoria de la URL
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Error en la descarga:", err);
    alert("No se pudo descargar el backup. Verificá los permisos.");
  }
};


  return (
    <Box sx={{ pb: 4, overflowY: 'hidden' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3, color: colors.textPrimary }}>
        Infraestructura y Seguridad
      </Typography>

      {successMessage && (
        <Alert severity="success" onClose={() => dispatch(clearAdminMessages())} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, val) => setTabValue(val)} 
          indicatorColor="primary" 
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}
        >
          <Tab icon={<StorageIcon />} label="Base de Datos" iconPosition="start" />
          <Tab icon={<KeyIcon />} label="API Keys & Consumo" iconPosition="start" />
        </Tabs>

        {/* --- PANEL DE BACKUPS --- */}
        {tabValue === 0 && (
          <Box sx={{ p: 3, maxHeight: '70vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="600">Respaldos Automáticos (.sql.gz)</Typography>
              <Box sx={{ display: 'flex', gap: 2}}>
                <Button 
                  variant="contained" 
                  startIcon={loading ? <CircularProgress size={20} /> : <StorageIcon />}
                  onClick={() => dispatch(triggerManualBackup(token!))}
                  disabled={loading}
                >
                  Generar Backup Ahora
                </Button>
                
                <Button 
                  startIcon={<SyncIcon />} 
                  onClick={() => dispatch(fetchAdminBackups(token!))}
                  disabled={loading}
                >
                  Actualizar Lista
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 1, overflowY: 'auto', maxHeight: '50vh' }}>
                {backups?.length > 0 ? backups.map((file, index) => (
                  <ListItem 
                    key={index}
                    divider={index !== backups.length - 1}
                    secondaryAction={
                      <IconButton 
                          edge="end" 
                          color="primary" 
                          onClick={() => handleDownload(file)}
                        >
                          <DownloadIcon />
                        </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={file} 
                      secondary={`Backup de sistema - Almacenado localmente`} 
                      primaryTypographyProps={{ fontWeight: 500, fontFamily: 'monospace' }}
                    />
                  </ListItem>
                )) : (
                  <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                    No se encontraron archivos de backup en el servidor.
                  </Typography>
                )}
              </List>
            )}
          </Box>
        )}

        {/* --- PANEL DE API KEYS & CONSUMO --- */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            
            {/* 1. Dashboard de Gráficos (CSS Grid nativo adentro) */}
            <ApiUsageDashboard />

            <Divider sx={{ my: 5 }} />

            {/* 2. Formulario de Rotación de Keys (Flexbox nativo) */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Rotación de Credenciales
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* STREAM CONFIG */}
              <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fcfcfc' }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Stream Chat & Video Integration
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField 
                    label="API Key" 
                    sx={{ flex: 1, minWidth: '200px' }}
                    onChange={(e) => setStreamKeys({...streamKeys, apiKey: e.target.value})}
                  />
                  <TextField 
                    label="API Secret" 
                    type="password" 
                    sx={{ flex: 1, minWidth: '200px' }}
                    onChange={(e) => setStreamKeys({...streamKeys, apiSecret: e.target.value})}
                  />
                  <Button 
                    variant="contained" 
                    sx={{ px: 4, height: 56 }}
                    onClick={handleUpdateStream} 
                    disabled={loading}
                  >
                    Actualizar
                  </Button>
                </Box>
              </Paper>

              {/* GEMINI CONFIG */}
              <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fcfcfc' }}>
                <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Google Gemini AI (LLM)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField 
                    label="Gemini API Key" 
                    type="password"
                    fullWidth 
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ px: 4, height: 56 }}
                    onClick={handleUpdateGemini} 
                    disabled={loading}
                  >
                    Actualizar
                  </Button>
                </Box>
              </Paper>
              
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}