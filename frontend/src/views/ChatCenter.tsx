import { useState } from "react";
import { 
  Chat, Channel, Window, ChannelHeader, MessageList, 
  MessageInput, Thread, ChannelList 
} from "stream-chat-react";
import { Box, Tabs, Tab, Badge, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function ProfessionalChatCenter({ chatClient, user }: any) {
  const [activeChannels, setActiveChannels] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

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
    <Box sx={{ display: 'flex', height: '100%', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
      <Chat client={chatClient} theme="messaging light">
        
        {/* LISTA LATERAL DE CHATS (Sidebar de Stream) */}
        <Box sx={{ width: 300, borderRight: '1px solid #ddd' }}>
          <ChannelList 
            filters={filters} 
            sort={sort}
            options={{ state: true, presence: true, limit: 10 }}
            Preview={(props) => (
              <div onClick={() => handleChannelSelect(props.channel)}>
                {(props.channel?.data as any)?.name || props.channel?.id || 'Chat'}
              </div>
            )}
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChannels.length > 0 ? (
            <>
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
                          {ch.data.name || 'Paciente'}
                        </Badge>
                        <IconButton size="small" onClick={(e) => closeTab(e, index)}>
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    } 
                  />
                ))}
              </Tabs>

              <Channel channel={activeChannels[selectedTab]}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">Seleccione un chat para comenzar</Typography>
            </Box>
          )}
        </Box>
      </Chat>
    </Box>
  );
}