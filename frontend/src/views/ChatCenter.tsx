import { useState, useEffect } from "react";
import { 
  Chat, Channel, Window, ChannelHeader, MessageList, 
  MessageInput, Thread, ChannelList 
} from "stream-chat-react";
import { Box, Tabs, Tab, Badge, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from "../lib/hooks"; // Importa hooks
import { backupChatMessage } from "../api/chat.api"; // Importa tu thunk

export default function ProfessionalChatCenter({ chatClient, user }: any) {
  const [activeChannels, setActiveChannels] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  // --- LÓGICA DE BACKUP ---
  useEffect(() => {
    if (!chatClient || activeChannels.length === 0) return;

    // Suscribimos el listener a cada canal activo
    activeChannels.forEach((channel) => {
      // Definimos el handler
      const handleNewMessage = async (event: any) => {
        // Solo respaldamos si el mensaje lo envió el profesional actual
        if (event.user.id === chatClient.userID) {
          dispatch(backupChatMessage({
            channelId: channel.id || "",
            text: event.message.text || "",
            streamMessageId: event.message.id,
            token: token || ""
          }));
        }
      };

      // Evitamos duplicar listeners: primero removemos y luego agregamos
      channel.off('message.new', handleNewMessage);
      channel.on('message.new', handleNewMessage);
    });

    // Cleanup: Al cerrar canales o desmontar, removemos listeners
    return () => {
      activeChannels.forEach(channel => channel.off('message.new'));
    };
  }, [activeChannels, chatClient, dispatch, token]);

  // --- FILTROS Y SORT ---
  const filters = { 
    type: 'messaging', 
    members: { $in: [user.id] } 
  };
  const sort: any = { last_message_at: -1 };

  const handleChannelSelect = (channel: any) => {
    const existingIndex = activeChannels.findIndex(c => c.id === channel.id);
    if (existingIndex !== -1) {
      setSelectedTab(existingIndex);
    } else {
      setActiveChannels([...activeChannels, channel]);
      setSelectedTab(activeChannels.length);
    }
  };

  const closeTab = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newChannels = activeChannels.filter((_, i) => i !== index);
    setActiveChannels(newChannels);
    if (selectedTab >= newChannels.length) {
      setSelectedTab(Math.max(0, newChannels.length - 1));
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Chat client={chatClient} theme="messaging light">
        
        {/* LISTA LATERAL */}
        <Box sx={{ width: 300, borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <ChannelList 
            filters={filters} 
            sort={sort}
            options={{ state: true, presence: true, limit: 10 }}
            // Preview personalizado para que coincida con tu estilo
            Preview={(props) => (
              <Box 
                onClick={() => handleChannelSelect(props.channel)}
                sx={{ 
                  p: 2, 
                  cursor: 'pointer', 
                  '&:hover': { bgcolor: '#f5f5f5' },
                  borderBottom: '1px solid #eee' 
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {(props.channel?.data as any)?.name || 'Consulta Médica'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ID: {props.channel?.id?.substring(0, 8)}...
                </Typography>
              </Box>
            )}
          />
        </Box>

        {/* ÁREA DE CHAT CON TABS */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeChannels.length > 0 ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={selectedTab} 
                  onChange={(_, v) => setSelectedTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {activeChannels.map((ch, index) => (
                    <Tab 
                      key={ch.id} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Badge color="error" variant="dot" invisible={ch.countUnread() === 0}>
                            <Typography variant="caption">
                              {ch.data.name || 'Paciente'}
                            </Typography>
                          </Badge>
                          <IconButton size="small" onClick={(e) => closeTab(e, index)}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      } 
                    />
                  ))}
                </Tabs>
              </Box>

              {/* El canal seleccionado actualmente */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Channel channel={activeChannels[selectedTab]}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput focus />
                  </Window>
                  <Thread />
                </Channel>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">Seleccione un chat de la lista para responder</Typography>
            </Box>
          )}
        </Box>
      </Chat>
    </Box>
  );
}