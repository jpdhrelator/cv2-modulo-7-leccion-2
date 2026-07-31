import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

/* Los valores vienen de .env.local.
   import.meta.env es la forma de Vite de leer variables de entorno
   (no existe process.env en el navegador). */
const configuracionFirebase = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID
}

/* initializeApp se ejecuta UNA sola vez en toda la aplicación.
   Como este módulo se importa desde varios lugares y JavaScript
   cachea los módulos, la instancia siempre es la misma. */
const app = initializeApp(configuracionFirebase)

/* db es la puerta de entrada a Firestore. Es lo que van a importar
   los componentes que necesiten leer o escribir datos. */
export const db = getFirestore(app)