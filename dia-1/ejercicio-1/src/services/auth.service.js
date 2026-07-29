import { http } from './https.service.js';


const CLAVE_TOKEN = 'TOKEN_SISTEM';
export async function login(username, password) {
  // El backend responde: { message: 'Login exitoso', token: '...' }
  const { data } = await http.post('/login', { username, password })
  return data.token
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

export function leerPayload(token) {
  try {
    const payload = token.split('.')[1]

    // Base64URL usa - y _ donde Base64 usa + y /. Hay que revertirlo.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    // Y este baile es para que los acentos y las ñ no se rompan.
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(json)
  } catch {
    return null                         // token con formato inválido
  }
}

export function tokenExpirado(token) {
  const payload = leerPayload(token)
  if (!payload?.exp) return true

  // OJO: exp viene en SEGUNDOS. Date.now() está en MILISEGUNDOS.
  // Este es EL error clásico. Multiplica por 1000 o siempre te va a dar expirado.
  return Date.now() >= payload.exp * 1000
}
export function segundosRestantes(token) {
  const payload = leerPayload(token)
  if (!payload?.exp) return 0
  return Math.max(0, Math.floor(payload.exp * 1000 - Date.now()) / 1000)
}