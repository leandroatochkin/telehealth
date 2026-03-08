import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  Thread,
} from "stream-chat-react";

import { Dialog, Box } from "@mui/material";
import { useEffect, useState } from "react";

// 1. IMPORT THE STYLES
import 'stream-chat-react/dist/css/v2/index.css';

export default function AdminChatModal({
  open,
  onClose,
  chatClient,
  userId,
}: any) {
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!chatClient || !userId || !open) return;

    const setup = async () => {
      // Note: "admin-support" is a hardcoded ID. 
      // Ensure this is unique per user if it's a 1-on-1 support chat.
      const supportChannel = chatClient.channel("messaging", `support-${userId}`, {
        members: [userId, 'admin'], // Assuming 'admin' exists
        name: 'Soporte Técnico'
      });

      await supportChannel.watch();
      setChannel(supportChannel);
    };

    setup();
  }, [chatClient, userId, open]);

  if (!channel) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ height: 600 }}> {/* Increased height for better visibility */}
        {/* 2. WRAP IN A DIV WITH str-chat CLASS OR USE theme PROP */}
        <div className="str-chat"> 
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </Box>
    </Dialog>
  );
}