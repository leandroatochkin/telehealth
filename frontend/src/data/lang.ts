export const translations = {
  es: {
    errors: {
      "Signup failed": "El registro ha fallado",
      "Login failed. Please try again.": "Error al iniciar sesión. Inténtelo de nuevo.",
      "Verification failed": "La verificación ha fallado",
      "Failed to resend OTP": "No se pudo reenviar el código OTP",
      "No auth token found": "No se encontró el token de autenticación",
      "Error": "Ha ocurrido un error inesperado",
      "Unauthorized": "No autorizado",
      "Error generating PDF": "Error al generar el PDF",
      "Entry details required": "El detalle de la consulta es obligatorio",
      "Error saving entry": "Error al guardar la entrada",
      "Conection error": "Error de conexión",
      "Error with AI Service": "Error con el servicio de AI",
    },
    info: {
        "Entry saved successfully": "Entrada guardada correctamente",
        "AI analysis complete": "Análisis AI completo",
        "AI analysis": "--- ANÁLISIS AI ---"
    },
    ui: {
      login: "Iniciar Sesión",
      signup: "Registrarse",
      forgotPassword: "¿Olvidó su contraseña?",
      aiWarning: `Esta herramienta utiliza Inteligencia Artificial para analizar datos clínicos. 
                  <strong> No reemplaza el juicio profesional médico.</strong> 
                  La IA puede generar información incorrecta o sesgada. ¿Desea continuar?`,
      buttons: {
        continue: "Continuar",
        cancel: "Cancelar",
        agree: "Estoy de acuerdo",
      },
      "patientHistory": "Historia Clínica por Paciente",
      "searchByDNI": "Buscar por DNI del paciente",
    }
  },
  en: {
    errors: {
      "Signup failed": "Signup failed",
      "Login failed. Please try again.": "Login failed. Please try again.",
      "Verification failed": "Verification failed",
      "Failed to resend OTP": "Failed to resend OTP",
      "No auth token found": "No auth token found",
      "Error": "An unexpected error occurred",
      "Unauthorized": "Unauthorized",
    },
    ui: {
      login: "Login",
      signup: "Sign up",
      forgotPassword: "Forgot password?",
    }
  }
};

export type LanguageType = keyof typeof translations;