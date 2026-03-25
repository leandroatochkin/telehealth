import { useState } from "react";
import { Box, TextField, Button, Paper, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Alert } from "@mui/material";
import { Search as SearchIcon, FileDownload as DownloadIcon, History as HistoryIcon } from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { fetchUserConversations, downloadChatAudit } from "../api/admin.api";

export default function ChatAudit() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { auditResults, loading, isDownloading, error } = useAppSelector(state => state.admin);
  const { colors } = useAppSelector((state) => state.theme);
  
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    if (searchId) {
      dispatch(fetchUserConversations({ userId: searchId, token: token! }));
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: colors.textPrimary }}>Auditoría de Conversaciones (SQL Backups)</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 2 }}>
        <TextField 
          label="ID de Médico o Paciente" 
          fullWidth
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading || !searchId}
          sx={{ height: 56, px: 4 }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </Paper>

      <List component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {auditResults.length > 0 ? auditResults.map((chat, index) => (
          <Box key={chat.channelId}>
            <ListItem
              secondaryAction={
                <Button 
                  startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />} 
                  color="primary" 
                  variant="contained"
                  size="small"
                  onClick={() => dispatch(downloadChatAudit({ channelId: chat.channelId, token: token! }))}
                  disabled={isDownloading}
                >
                  Exportar TXT
                </Button>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                <HistoryIcon color="primary" />
                <ListItemText 
                  primary={<Typography fontWeight="bold">{chat.channelId}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2" color="textPrimary" sx={{ opacity: 0.8 }}>
                        Último mensaje: {chat.preview}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Actividad: {new Date(chat.lastActive).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </Box>
            </ListItem>
            {index < auditResults.length - 1 && <Divider />}
          </Box>
        )) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {loading ? "Cargando resultados..." : "No hay chats registrados para este ID."}
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
}