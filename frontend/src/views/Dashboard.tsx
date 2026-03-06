import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useCreateChatClient,
} from "stream-chat-react";

import {
  StreamVideoClient,
  type Call,
} from "@stream-io/video-client";

import {
  StreamVideo,
  StreamCall,
} from "@stream-io/video-react-sdk";

import "stream-chat-react/dist/css/v2/index.css";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchStreamToken } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/auth.slice";
import type { UserResponse } from "stream-chat";
import { Box, Button, Typography } from "@mui/material";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, token, streamToken, streamLoading } =
    useAppSelector((state) => state.auth);
  console.log("User:", user);
  const { colors, shadows, fontWeights } =
    useAppSelector((state) => state.theme);

  const [channel, setChannel] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  // Fetch stream token
  useEffect(() => {
    if (token && !streamToken) {
      dispatch(fetchStreamToken());
    }
  }, [token, streamToken]);

  // Chat client
  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: streamToken as string,
    userData: {
      id: user?.id ?? "",
      name: user?.name ?? "",
    } as UserResponse,
  });

  // Setup chat channel
  useEffect(() => {
    if (!chatClient) return;

    const setupChannel = async () => {
      try {
        const newChannel = chatClient.channel("livestream", "general");

        await newChannel.watch();

        setChannel(newChannel);
      } catch (err) {
        console.error("Stream chat error:", err);
      }
    };

    setupChannel();
  }, [chatClient]);

  // Setup video
  useEffect(() => {
    if (!showVideo || !user || !streamToken) return;

    let clientInstance: StreamVideoClient;
    let callInstance: Call;

    const startVideo = async () => {
      try {
        clientInstance = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id,
            name: user.name,
          },
          token: streamToken,
        });

        callInstance = clientInstance.call("default", "general-room");

        await callInstance.join({ create: true });

        setVideoClient(clientInstance);
        setCall(callInstance);
      } catch (err) {
        console.error("Video error:", err);
      }
    };

    startVideo();

    return () => {
      callInstance?.leave();
      clientInstance?.disconnectUser();
    };
  }, [showVideo]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleVideoCall = () => {
    setShowVideo(true);
  };

  if (!token) return <div>Unauthorized</div>;

  if (streamLoading || !streamToken) return <div>Loading stream...</div>;

  if (!chatClient || !channel) return <div>Connecting to chat...</div>;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        backgroundColor: colors.background,
      }}
    >
      {/* CHAT */}
      <Box
        sx={{
          flex: showVideo ? 0.6 : 1,
          transition: "all 0.3s ease",
          padding: 3,
        }}
      >
        <Box
          sx={{
            height: "100%",
            backgroundColor: colors.surface,
            borderRadius: 3,
            boxShadow: shadows.lg,
            overflow: "hidden",
          }}
        >
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
      </Box>

      {/* VIDEO */}
      {showVideo && videoClient && call && (
        <Box
          sx={{
            flex: 1,
            padding: 3,
          }}
        >
          <Box
            sx={{
              height: "100%",
              backgroundColor: colors.surface,
              borderRadius: 3,
              boxShadow: shadows.lg,
              position: "relative",
            }}
          >
            <StreamVideo client={videoClient}>
              <StreamCall call={call}>
                <Box sx={{ height: "100%" }} />
              </StreamCall>
            </StreamVideo>

            <Button
              onClick={() => setShowVideo(false)}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: colors.danger,
                color: "#fff",
              }}
            >
              End Call
            </Button>
          </Box>
        </Box>
      )}

      {/* SIDEBAR */}
      <Box
        sx={{
          width: 280,
          backgroundColor: colors.surface,
          boxShadow: shadows.md,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
              mb: 3,
            }}
          >
            Dashboard
          </Typography>

          {!showVideo && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleVideoCall}
              sx={{
                mb: 2,
                backgroundColor: colors.primary,
              }}
            >
              Start Video Call
            </Button>
          )}
        </Box>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderColor: colors.danger,
            color: colors.danger,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}