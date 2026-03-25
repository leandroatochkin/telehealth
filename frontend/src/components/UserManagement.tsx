import { useState, useEffect, useCallback } from "react";
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Chip, TextField, TablePagination, InputAdornment, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, CircularProgress, 
  Tooltip
} from "@mui/material";
import { Search as SearchIcon, ContentCopy as CopyIcon, Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { fetchAllUsers, updateUserAdmin } from "../api/admin.api";
import { notify } from "../lib/notifications";

export default function AdminUsers() {
  
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { users, pagination, loading } = useAppSelector(state => state.admin);
  const { colors } =
    useAppSelector((state) => state.theme);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // MUI usa base 0
  const [editUser, setEditUser] = useState<any>(null);

  const loadUsers = useCallback(() => {
    dispatch(fetchAllUsers({ token: token!, page: page + 1, search }));
  }, [dispatch, token, page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    loadUsers();
    notify("Lista de usuarios actualizada", "success");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reiniciar a la primera página al buscar
  };

  const handleOpenEdit = (user: any) => {
  // Clonamos el usuario para no mutar el estado de Redux directamente en el form
  setEditUser({ ...user }); 
};

const handleSaveChanges = () => {
  if (editUser) {
    dispatch(updateUserAdmin({ 
      id: editUser.id, 
      userData: {
        role: editUser.role,
        isVerified: editUser.isVerified,
        name: editUser.name,
        surname: editUser.surname,
        medicalLicense: editUser.medicalLicense,
        dni: editUser.dni
      }, 
      token: token! 
    })).then((result) => {
      if (updateUserAdmin.fulfilled.match(result)) {
        setEditUser(null); // Cerramos modal solo si fue exitoso
      }
    });
  }
};

const roleMapper = (role: string) => {
    switch(role){
        case 'PROFESSIONAL':
            return 'Profesional'
        case 'PATIENT':
            return 'Paciente'
        case 'ADMIN':
            return 'Administrador'
    }
}

  return (
    <Box>
    <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Perfil de Usuario</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
                label="Nombre" fullWidth 
                value={editUser?.name || ''} 
                onChange={(e) => setEditUser({...editUser, name: e.target.value})} 
            />
            <TextField 
                label="Apellido" fullWidth 
                value={editUser?.surname || ''} 
                onChange={(e) => setEditUser({...editUser, surname: e.target.value})} 
            />
            </Box>

            <TextField 
            label="DNI" fullWidth 
            value={editUser?.dni || ''} 
            onChange={(e) => setEditUser({...editUser, dni: e.target.value})} 
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
                select label="Rol" fullWidth 
                value={editUser?.role || 'PATIENT'} 
                onChange={(e) => setEditUser({...editUser, role: e.target.value})}
            >
                <MenuItem value="PATIENT">Paciente</MenuItem>
                <MenuItem value="PROFESSIONAL">Médico / Profesional</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
            </TextField>

            <TextField 
                select label="Estado" fullWidth 
                value={editUser?.isVerified ? "true" : "false"}
                onChange={(e) => setEditUser({...editUser, isVerified: e.target.value === "true"})}
            >
                <MenuItem value="true">Verificado (Activo)</MenuItem>
                <MenuItem value="false">No Verificado (Pendiente)</MenuItem>
            </TextField>
            </Box>

            {/* Campo condicional: solo si es profesional o si se le está asignando el rol */}
            {(editUser?.role === 'PROFESSIONAL') && (
            <TextField 
                label="Matrícula Médica" 
                fullWidth 
                placeholder="Ej: MN 123456"
                value={editUser?.medicalLicense || ''} 
                onChange={(e) => setEditUser({...editUser, medicalLicense: e.target.value})} 
            />
            )}
            
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditUser(null)} color="inherit">Cancelar</Button>
            <Button 
            variant="contained" 
            onClick={handleSaveChanges}
            disabled={loading} // Usamos el loading del Slice
            >
            {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
            </Button>
        </DialogActions>
    </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.textPrimary }}>
          Gestión de Usuarios
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Actualizar lista">
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              sx={{ 
                bgcolor: colors.textSecondary, 
                '&:hover': { bgcolor: colors.border },
                transition: 'transform 0.3s',
                transform: loading ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <TextField 
            placeholder="Buscar por DNI, Nombre, Email o ID..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario / DNI</TableCell>
              <TableCell>Nombre y Apellido</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Chip 
                    label={user.id.substring(0, 8)} 
                    onClick={() => {
                        navigator.clipboard.writeText(user.id)
                        notify("ID del usuario copiado", "success")
                    }}
                    icon={<CopyIcon style={{ fontSize: 14 }} />}
                    size="small"
                    clickable
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{user.email}</Typography>
                  <Typography variant="caption" color="textSecondary">DNI: {user.dni || 'N/A'}</Typography>
                </TableCell>
                <TableCell>{user.name} {user.surname}</TableCell>
                <TableCell>
                  <Chip label={roleMapper(user.role)} size="small" color={user.role === 'ADMIN' ? 'error' : 'primary'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={()=>handleOpenEdit(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={10}
          rowsPerPageOptions={[10]} // Simplificado a 10 por página
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
    </Box>
  );
}