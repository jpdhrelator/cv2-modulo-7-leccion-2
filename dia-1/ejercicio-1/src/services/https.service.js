import axios from 'axios';
import {obtenerToken,tokenExpirado,borrarToken} from '../services/auth.service'

export const http = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 8000,                                 
  headers: { 'Content-Type': 'application/json' }
});


// ---------------- INTERCEPTOR DE PETICIÓN ----------------
// Se ejecuta ANTES de que cada petición salga del navegador.
http.interceptors.request.use(
  (config)=>{
    const token = obtenerToken();

    if (token && !tokenExpirado(token)) {
      config.headers.Authorization=`Bearer ${token}`;
    }

    return config
  },
  (error) => Promise.reject(error)
);

// ---------------- INTERCEPTOR DE RESPUESTA ----------------
// Se ejecuta DESPUÉS de cada respuesta, antes de llegar a tu try/catch.
http.interceptors.response.use(
  (respuesta) => respuesta,              // si todo salió bien, pasa de largo

  (error) => {
    const status = error.response?.status

    // 401 = no estás autenticado · 403 = tu token no sirve o no te alcanza
    if (status === 401 || status === 403) {
      borrarToken()

      // Avisamos al resto de la app con un evento del navegador.
      // Así el interceptor no necesita saber nada de Vue ni de componentes.
      window.dispatchEvent(new CustomEvent('sesion-expirada'))
    }

    // MUY IMPORTANTE: volvemos a rechazar.
    // Si no, el error se "traga" y tu catch nunca se entera.
    return Promise.reject(error)
  }
)