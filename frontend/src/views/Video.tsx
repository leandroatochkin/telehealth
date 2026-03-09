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
import { useParams } from "react-router-dom";
import { notify } from "../lib/notifications";

const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;

export default function VideoStream() {
  const navigate = useNavigate();
  const { id: callId } = useParams(); // Get the ID from /call/:id

  const { user, streamToken, streamLoading } =
    useAppSelector((state) => state.auth);

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!apiKey || !user || !streamToken || !callId) return;

  let isMounted = true;
  let videoClient: StreamVideoClient;
  let videoCall: Call;

  const setupVideo = async () => {
    try {
      setLoading(true);

      videoClient = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user: { id: user.id, name: user.name || user.username },
        token: streamToken,
      });

      videoCall = videoClient.call("default", callId);

      // 🔴 IMPORTANT: prevent double join
      if (videoCall.state.callingState !== "joined") {
        await videoCall.join({ create: true });
      }

      if (!isMounted) return;

      setClient(videoClient);
      setCall(videoCall);
    } catch (error) {
      console.error("Video setup error:", error);
      notify("Error al conectar con la cámara", "error");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  setupVideo();

  return () => {
    isMounted = false;
    videoCall?.leave();
    videoClient?.disconnectUser();
  };
}, [user, streamToken, callId]);

  const handleLeaveCall = async () => {
    try {
      await call?.leave();
      await client?.disconnectUser();
    } catch (error) {
      console.error("Error leaving call:", error);
    } finally {
      setCall(null);
      setClient(null);
      if(user.role === "PATIENT") {
        navigate('/dashboard/patient');
      } else {
        navigate('/dashboard/professional');
      }
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
        Uniendose a la videollamada...
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
          <MyUILayout callId={callId ?? ''} />
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
        Salir de la Llamada
      </button>
    </div>
  );
}