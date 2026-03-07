import {
  useCall,
  useCallStateHooks,
  CallingState,
  ParticipantView,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import { useAppSelector } from '../lib/hooks';
import { useNavigate } from 'react-router-dom';
import { notify } from '../lib/notifications';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export function MyUILayout() {
  const call = useCall();
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  
  const { user, token } = useAppSelector((state) => state.auth);

  const handleEndAppointment = async () => {
    if (!window.confirm("¿Está seguro de que desea finalizar la consulta?")) return;

    try {
      // 1. Notify Backend to mark as 'completed'
      const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${call?.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error("Error al finalizar en el servidor");

      // 2. Leave Stream Call
      await call?.leave();
      
      notify("Consulta finalizada con éxito", "success");
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      notify("Error al finalizar la consulta", "error");
    }
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Uniéndose a la Videollamada...
      </div>
    );
  }

  return (
    <StreamTheme>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* VIDEO GRID */}
        <div style={{ flex: 1 }}>
          <SpeakerLayout />
        </div>

        {/* CONTROLS BAR */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#1c1c1e', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '20px'
        }}>
          <CallControls onLeave={() => navigate('/dashboard')} />
          
          {/* ONLY DOCTOR SEES END BUTTON */}
          {user?.role === 'PROFESSIONAL' && (
            <button
              onClick={handleEndAppointment}
              style={{
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Finalizar Consulta
            </button>
          )}
        </div>
      </div>
    </StreamTheme>
  );
}