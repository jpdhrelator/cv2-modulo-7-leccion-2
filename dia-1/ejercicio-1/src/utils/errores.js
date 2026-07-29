import axios from 'axios'

// Mapa de códigos → mensajes que una persona entiende.
// El usuario NUNCA debe leer "Error 500". No significa nada para él.
const MENSAJES = {
  400: 'Los datos enviados no son válidos. Revisa el formulario.',
  401: 'Tu sesión no es válida. Vuelve a iniciar sesión.',
  403: 'Tu sesión expiró o no tienes permiso para esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'Ese registro ya existe.',
  422: 'Faltan datos obligatorios.',
  500: 'El servidor tuvo un problema. Intenta de nuevo en unos minutos.',
  503: 'El servicio no está disponible por ahora.'
}

export function traducirError(error) {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado en la aplicación.'
  }

  // Caso 1: el servidor respondió con un código de error
  if (error.response) {
    const { status, data } = error.response
    // Si el backend mandó su propio mensaje, respetamos ese: es más específico.
    return data?.message || MENSAJES[status] || `Error del servidor (${status}).`
  }

  // Caso 2: no hubo respuesta
  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return 'El servidor tardó demasiado en responder.'
    }
    return 'No pudimos conectar con el servidor. ¿Está encendido?'
  }

  // Caso 3: reventó antes de salir
  return 'No pudimos preparar la petición.'
}