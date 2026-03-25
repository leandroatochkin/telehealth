import { Box, Card, CardContent, Typography, Divider, CircularProgress, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAppSelector } from "../lib/hooks";
import { Memory as CpuIcon, Chat as ChatIcon, Assessment as ChartIcon } from "@mui/icons-material";

export default function ApiUsageDashboard() {
  const theme = useTheme();
  const { apiUsage, loading } = useAppSelector((state) => state.admin);

  const gemini = apiUsage.find((u: any) => u.provider === "GEMINI");
  const stream = apiUsage.find((u: any) => u.provider === "STREAM");

  const chartData = [
    { name: "Gemini", value: gemini?._sum.totalTokens || 0, color: "#4285F4" },
    { name: "Stream", value: stream?._sum.totalTokens || 0, color: "#00E5FF" },
  ];

  if (loading && apiUsage.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
        <ChartIcon color="primary" /> Métricas de Consumo Global
      </Typography>

      {/* CONTENEDOR GRID NATIVO */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",          // 1 columna en móvil
            md: "1fr 1fr 1fr"   // 3 columnas en desktop
          },
          gap: 3,               // Espaciado real entre tarjetas
          mb: 4
        }}
      >
        {/* CARD GEMINI */}
        <Card sx={{ borderLeft: "6px solid #4285F4", display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold' }}>Google Gemini AI</Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                  {gemini?._sum.totalTokens?.toLocaleString() || 0}
                </Typography>
              </Box>
              <CpuIcon sx={{ color: "#4285F4", fontSize: 32 }} />
            </Box>
            <Typography variant="body2" color="textSecondary">Tokens totales procesados</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2"><b>Peticiones:</b> {gemini?._count.id || 0}</Typography>
          </CardContent>
        </Card>

        {/* CARD STREAM */}
        <Card sx={{ borderLeft: "6px solid #00E5FF", display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold' }}>Stream.io</Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                  {stream?._sum.totalTokens?.toLocaleString() || 0}
                </Typography>
              </Box>
              <ChatIcon sx={{ color: "#00E5FF", fontSize: 32 }} />
            </Box>
            <Typography variant="body2" color="textSecondary">Eventos de mensajería/tokens</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2"><b>Peticiones:</b> {stream?._count.id || 0}</Typography>
          </CardContent>
        </Card>

        {/* CARD GRÁFICO CIRCULAR */}
        <Card sx={{ display: "flex", flexDirection: "column", minHeight: 250 }}>
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Distribución de Carga</Typography>
            <Box sx={{ flex: 1, minHeight: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}