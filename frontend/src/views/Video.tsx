import { useEffect, useState } from "react";
import {
  StreamVideoClient,
  type Call,
} from "@stream-io/video-client";
import {
  StreamVideo,
  StreamCall,
} from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../lib/hooks";
import { MyUILayout } from "./Layout";

const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;

export default function VideoStream() {
  const navigate = useNavigate();

  const { user, streamToken, streamLoading } =
    useAppSelector((state) => state.auth);

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || !user || !streamToken) return;

    let isMounted = true;

    const setupVideo = async () => {
      try {
        setLoading(true);

        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user!.id,
            name: user!.name,
          },
          token: streamToken,
        });

        const videoCall = videoClient.call("default", "general-room");

        await videoCall.join({ create: true });

        if (!isMounted) return;

        setClient(videoClient);
        setCall(videoCall);
      } catch (error) {
        console.error("Video setup error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setupVideo();

    return () => {
      isMounted = false;
      call?.leave();
      client?.disconnectUser();
    };
  }, [user, streamToken]);

  const handleLeaveCall = async () => {
    try {
      await call?.leave();
      await client?.disconnectUser();
    } catch (error) {
      console.error("Error leaving call:", error);
    } finally {
      setCall(null);
      setClient(null);
      navigate("/dashboard");
    }
  };

  if (!apiKey) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        Missing Stream API Key
      </div>
    );
  }

  if (streamLoading || loading || !client || !call) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: 18,
          fontWeight: 600,
          backgroundColor: "#f5f5f5",
        }}
      >
        Connecting to video call...
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f0f2f5",
      }}
    >
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>

      <button
        onClick={handleLeaveCall}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: "#d32f2f",
          color: "white",
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        Leave Call
      </button>
    </div>
  );
}