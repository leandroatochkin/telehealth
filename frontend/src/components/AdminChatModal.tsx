import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  Thread,
} from "stream-chat-react";
import { Dialog, Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { backupChatMessage } from "../api/chat.api";

import 'stream-chat-react/dist/css/v2/index.css';

export default function PatientChatModal({
  open,
  onClose,
  chatClient,
  user,
  professionalId,
}: any) {
  const [channel, setChannel] = useState<any>(null);
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!chatClient || !user?.id || !professionalId || !open) return;
    let activeChannel: any;

    const setup = async () => {
      const shortId1 = user.id.substring(0, 15);
      const shortId2 = professionalId.substring(0, 15);
      const channelId = `chat_${shortId1}_${shortId2}`;

      const supportChannel = chatClient.channel("messaging", channelId, {
        members: [user.id, professionalId],
        name: `Consulta Médica`,
      });

      activeChannel = supportChannel;

      const handleNewMessage = async (event: any) => {
        if (event.user.id === chatClient.userID) {
          dispatch(backupChatMessage({
            channelId: supportChannel.id || channelId,
            text: event.message.text || "",
            streamMessageId: event.message.id,
            token: token || ""
          }));
        }
      };

      supportChannel.on('message.new', handleNewMessage);

      try {
        await supportChannel.watch();
        setChannel(supportChannel);
      } catch (error) {
        console.error("Error al inicializar el canal de Stream:", error);
      }
    };

    setup();

    return () => {
      if (activeChannel) {
        activeChannel.off('message.new');
      }
    };
  }, [chatClient, user?.id, professionalId, open, dispatch, token]);

  if (!open || !channel) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        borderBottom: '1px solid #eee',
        bgcolor: 'background.paper',
        zIndex: 1
      }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div className="str-chat" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}> 
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </Box>
    </Dialog>
  );
}