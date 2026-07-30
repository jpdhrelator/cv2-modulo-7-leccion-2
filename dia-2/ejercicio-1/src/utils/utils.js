
class ErrorApi extends Error {
  constructor(mensaje, { codigo = 0, errores = null, datos = null } = {}) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;      // el status HTTP, 0 si nunca hubo respuesta
    this.errores = errores;    // mapa campo → mensaje, sólo en los 422
    this.datos = datos;        // el cuerpo completo, por si se necesita
  }
}
const CLAVE_TOKEN = 'TOKEN_SISTEM';


export function traducirError(error) {
  // Caso 1: nunca llegó una respuesta.
  if (error.code === 'ECONNABORTED') {
    return new ErrorApi('El servidor tardó demasiado en responder. Intenta de nuevo.');
  }
  if (!error.response) {
    return new ErrorApi(
      'No pudimos conectar con el servidor. Revisa que esté corriendo en el puerto 3001.'
    );
  }

  // Caso 2: el servidor respondió, y respondió mal.
  const { status, data } = error.response;

  const mensajes = {
    400: data?.message || 'Uno de los filtros tiene un valor que el servidor no acepta.',
    401: 'Tu sesión no está activa. Inicia sesión para continuar.',
    403: data?.rolesRequeridos
         ? `Tu rol "${data.rolActual}" no tiene permiso para esta acción.`
         : 'Tu sesión expiró. Vuelve a iniciar sesión.',
    404: data?.message || 'No encontramos lo que buscabas.',
    409: data?.message || 'La operación choca con el estado actual del registro.',
    422: data?.message || 'Revisa los campos marcados en rojo.',
    429: data?.message || 'Hiciste demasiadas peticiones seguidas. Espera unos segundos.',
    500: 'El servidor tuvo un problema interno. No es culpa tuya.'
  };

  return new ErrorApi(mensajes[status] || `Ocurrió un error inesperado (${status}).`, {
    codigo: status,
    errores: data?.errores || null,
    datos: data
  });
}

export function leerPayloadJWT(token) {
  try {
    const carga = token.split('.')[1];

    // Los JWT usan Base64URL, no Base64 clásico: cambia "-" por "+" y "_" por "/".
    const base64 = carga.replace(/-/g, '+').replace(/_/g, '/');

    // atob() devuelve bytes interpretados como latin-1. Si el nombre trae
    // tildes ("Ana Díaz") saldría corrupto. Este rodeo lo reinterpreta como UTF-8.
    const json = decodeURIComponent(
      atob(base64).split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null; // token con formato inválido
  }
}

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token)
}

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN)
}

export function tokenExpirado(token) {
  const payload = leerPayloadJWT(token)
  if (!payload?.exp) return true

  // OJO: exp viene en SEGUNDOS. Date.now() está en MILISEGUNDOS.
  // Este es EL error clásico. Multiplica por 1000 o siempre te va a dar expirado.
  return Date.now() >= payload.exp * 1000
}