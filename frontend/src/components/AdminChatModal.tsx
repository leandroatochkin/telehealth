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

export default function AdminChatModal({
  open,
  onClose,
  chatClient,
  userId,
}: any) {
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!chatClient) return;

    const setup = async () => {
      const supportChannel = chatClient.channel("messaging", "admin-support", {
        members: [userId],
      });

      await supportChannel.watch();
      setChannel(supportChannel);
    };

    setup();
  }, [chatClient]);

  if (!channel) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ height: 500 }}>
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </Box>
    </Dialog>
  );
}