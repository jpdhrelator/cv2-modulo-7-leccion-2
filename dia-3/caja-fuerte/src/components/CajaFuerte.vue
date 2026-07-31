<script setup>
import { ref, computed } from 'vue'

/* ------------------------------------------------------------------
   ESTADO
   ref() crea una variable reactiva. En el template se usa sin .value;
   dentro del script SIEMPRE hay que escribir .value. Ese es el trato.
------------------------------------------------------------------- */
const textoPlano = ref('')       // lo que el usuario escribe
const frase = ref('')            // la frase de paso (la llave)
const paquete = ref('')          // el resultado cifrado, en Base64
const textoRecuperado = ref('')  // el resultado de descifrar
const error = ref('')            // mensaje humano de error
const trabajando = ref(false)    // bloquea la UI mientras se cifra/descifra

/* computed = valor derivado que se recalcula solo cuando cambian sus dependencias */
const puedeCifrar = computed(
  () => textoPlano.value.trim().length > 0 && frase.value.length >= 8
)

/* ------------------------------------------------------------------
   CONSTANTES DE CRIPTOGRAFÍA
------------------------------------------------------------------- */
const ITERACIONES = 250000  // costo de PBKDF2: lento a propósito
const BYTES_SALT = 16       // tamaño del salt
const BYTES_IV = 12         // tamaño del IV que exige AES-GCM

const codificador = new TextEncoder()  // texto  -> bytes
const decodificador = new TextDecoder() // bytes -> texto

/* ------------------------------------------------------------------
   AUXILIARES: bytes <-> Base64
   Los bytes crudos no se pueden meter en un JSON ni mostrar en pantalla.
   Base64 los convierte en texto imprimible. Esto es CODIFICAR, no cifrar.
------------------------------------------------------------------- */
function bytesABase64(bytes) {
  let binario = ''
  for (let i = 0; i < bytes.length; i++) {
    binario += String.fromCharCode(bytes[i])
  }
  return btoa(binario)
}

function base64ABytes(texto) {
  const binario = atob(texto)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i)
  }
  return bytes
}

/* ------------------------------------------------------------------
   DERIVAR LA CLAVE
   Una frase humana no sirve como clave AES. PBKDF2 la estira hasta
   256 bits, mezclándola con el salt y repitiendo el proceso 250.000
   veces para que probar frases una por una salga caro.
------------------------------------------------------------------- */
async function derivarClave(fraseTexto, salt) {
  // 1. La frase entra como "material", no como clave todavía.
  const material = await crypto.subtle.importKey(
    'raw',
    codificador.encode(fraseTexto),
    'PBKDF2',
    false,               // no exportable: el JS no puede leer sus bytes
    ['deriveKey']
  )

  // 2. El material + salt se convierten en una clave AES-GCM de 256 bits.
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERACIONES, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/* ------------------------------------------------------------------
   CIFRAR
   Salida = [ salt (16) | iv (12) | datos cifrados ] todo en Base64.
   Guardamos salt e IV junto al dato porque los necesitamos para
   descifrar. NO son secretos: son valores aleatorios públicos.
------------------------------------------------------------------- */
async function cifrar(texto, fraseTexto) {
  const salt = crypto.getRandomValues(new Uint8Array(BYTES_SALT))
  const iv = crypto.getRandomValues(new Uint8Array(BYTES_IV))

  const clave = await derivarClave(fraseTexto, salt)

  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    clave,
    codificador.encode(texto)
  )

  // Concatenamos las tres partes en un solo arreglo de bytes.
  const cifradoBytes = new Uint8Array(cifrado)
  const todo = new Uint8Array(salt.length + iv.length + cifradoBytes.length)
  todo.set(salt, 0)
  todo.set(iv, salt.length)
  todo.set(cifradoBytes, salt.length + iv.length)

  return bytesABase64(todo)
}

/* ------------------------------------------------------------------
   DESCIFRAR
   Cortamos el paquete en sus tres partes y hacemos el camino inverso.
   Si la frase está mal o alguien alteró un solo bit, decrypt() LANZA
   una excepción. AES-GCM no devuelve basura: falla. Eso es una virtud.
------------------------------------------------------------------- */
async function descifrar(paqueteBase64, fraseTexto) {
  const todo = base64ABytes(paqueteBase64)

  const salt = todo.slice(0, BYTES_SALT)
  const iv = todo.slice(BYTES_SALT, BYTES_SALT + BYTES_IV)
  const datos = todo.slice(BYTES_SALT + BYTES_IV)

  const clave = await derivarClave(fraseTexto, salt)

  const plano = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    clave,
    datos
  )

  return decodificador.decode(plano)
}

/* ------------------------------------------------------------------
   MANEJADORES DE EVENTOS
   Aquí es donde la criptografía se conecta con la interfaz.
------------------------------------------------------------------- */
async function alCifrar() {
  error.value = ''
  textoRecuperado.value = ''
  trabajando.value = true

  try {
    paquete.value = await cifrar(textoPlano.value, frase.value)
  } catch (e) {
    // El error técnico va a la consola; el usuario recibe una frase.
    console.error(e)
    error.value = 'No se pudo cifrar. Revisa que estés en localhost o https.'
  } finally {
    trabajando.value = false
  }
}

async function alDescifrar() {
  error.value = ''
  textoRecuperado.value = ''
  trabajando.value = true

  try {
    textoRecuperado.value = await descifrar(paquete.value, frase.value)
  } catch (e) {
    console.error(e)
    error.value = 'Frase incorrecta o dato alterado. No se pudo recuperar el texto.'
  } finally {
    trabajando.value = false
  }
}

function limpiar() {
  textoPlano.value = ''
  frase.value = ''
  paquete.value = ''
  textoRecuperado.value = ''
  error.value = ''
}
</script>
<template>
  <section class="caja">
    <header class="caja__cabecera">
      <h2>🔐 Caja fuerte del navegador</h2>
      <p>Todo ocurre en tu equipo. Nada se envía a ningún servidor.</p>
    </header>

    <!-- ENTRADA: el secreto y la frase de paso -->
    <div class="campo">
      <label for="secreto">Texto secreto</label>
      <textarea
        id="secreto"
        v-model="textoPlano"
        rows="3"
        placeholder="Escribe aquí lo que quieres proteger..."
      ></textarea>
    </div>

    <div class="campo">
      <label for="frase">Frase de paso</label>
      <input
        id="frase"
        v-model="frase"
        type="password"
        placeholder="La llave. Si la olvidas, no hay vuelta atrás."
      />
      <small class="campo__ayuda">
        Mínimo 8 caracteres. No se guarda en ninguna parte: vive solo en memoria.
      </small>
    </div>

    <!-- ACCIONES -->
    <div class="acciones">
      <button
        type="button"
        class="btn btn--primario"
        :disabled="!puedeCifrar || trabajando"
        @click="alCifrar"
      >
        {{ trabajando ? 'Trabajando...' : 'Cifrar' }}
      </button>

      <button
        type="button"
        class="btn btn--secundario"
        :disabled="!paquete || trabajando"
        @click="alDescifrar"
      >
        Descifrar
      </button>

      <button
        type="button"
        class="btn btn--fantasma"
        :disabled="trabajando"
        @click="limpiar"
      >
        Limpiar
      </button>
    </div>

    <!-- ERROR: mensaje humano, no un código técnico -->
    <p v-if="error" class="alerta alerta--error" role="alert">
      {{ error }}
    </p>

    <!-- RESULTADO CIFRADO -->
    <div v-if="paquete" class="resultado">
      <h3>Dato cifrado</h3>
      <p class="resultado__pista">
        Esto es lo que enviarías a un servidor. Contiene salt + IV + texto cifrado, todo en Base64.
      </p>
      <pre class="resultado__caja">{{ paquete }}</pre>
      <p class="resultado__meta">{{ paquete.length }} caracteres</p>
    </div>

    <!-- RESULTADO DESCIFRADO -->
    <div v-if="textoRecuperado" class="resultado resultado--ok">
      <h3>Texto recuperado</h3>
      <pre class="resultado__caja">{{ textoRecuperado }}</pre>
    </div>

    <!-- ESTADO VACÍO -->
    <div v-if="!paquete && !error" class="vacio">
      <span class="vacio__icono">🗝️</span>
      <p>Escribe un secreto y una frase de paso para empezar.</p>
    </div>
  </section>
</template>
<style scoped>
/* Sistema de espaciado de 8pt: 0.5rem / 1rem / 1.5rem / 2rem.
   Nada de valores al azar como 13px o 27px. */

.caja {
  max-width: 640px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e6ea;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1b1f24;
}

.caja__cabecera { margin-bottom: 1.5rem; }
.caja__cabecera h2 { margin: 0 0 0.5rem; font-size: 1.35rem; }
.caja__cabecera p  { margin: 0; color: #4a5560; font-size: 0.9rem; }

/* ---------- CAMPOS ---------- */
.campo { margin-bottom: 1rem; }

.campo label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #34495e;
}

.campo textarea,
.campo input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cdd4da;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: inherit;
  background: #fbfcfd;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/* Foco visible: sin esto, quien navega con teclado queda perdido. */
.campo textarea:focus,
.campo input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.18);
}

.campo__ayuda {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: #6b7681;
}

/* ---------- BOTONES ---------- */
.acciones {
  display: flex;
  flex-wrap: wrap;      /* en móvil bajan solos, sin desbordar */
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
}

.btn {
  min-height: 44px;      /* área táctil mínima recomendada */
  padding: 0 1.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn--primario            { background: #42b883; color: #0d2b1e; }
.btn--primario:hover:not(:disabled) { background: #2f8f66; color: #ffffff; }

.btn--secundario          { background: #34495e; color: #ffffff; }
.btn--secundario:hover:not(:disabled) { background: #22313f; }

.btn--fantasma            { background: transparent; color: #4a5560; border-color: #cdd4da; }
.btn--fantasma:hover:not(:disabled) { background: #f0f2f5; }

/* ---------- ALERTAS ---------- */
.alerta {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
}

.alerta--error {
  background: #fdecea;
  border-left: 4px solid #c0392b;
  color: #a5281b;
}

/* ---------- RESULTADOS ---------- */
.resultado {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f6f7f9;
  border: 1px solid #e2e6ea;
  border-radius: 8px;
}

.resultado--ok {
  background: #f0f9f5;
  border-color: #bfe6d3;
}

.resultado h3 { margin: 0 0 0.5rem; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; color: #4a5560; }
.resultado__pista { margin: 0 0 0.5rem; font-size: 0.8rem; color: #6b7681; }
.resultado__meta  { margin: 0.5rem 0 0; font-size: 0.75rem; color: #6b7681; }

.resultado__caja {
  margin: 0;
  padding: 0.75rem;
  background: #1e2430;
  color: #e6edf3;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: pre-wrap;   /* que corte línea en vez de desbordar */
  word-break: break-all;
}

/* ---------- ESTADO VACÍO ---------- */
.vacio {
  margin-top: 1.5rem;
  padding: 2rem 1rem;
  text-align: center;
  border: 2px dashed #dfe4e9;
  border-radius: 8px;
  color: #6b7681;
}

.vacio__icono { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
.vacio p { margin: 0; font-size: 0.9rem; }

/* ---------- RESPONSIVO ---------- */
@media (max-width: 640px) {
  .caja { margin: 1rem; padding: 1.5rem 1rem; }
  .btn  { flex: 1 1 100%; }   /* botones a ancho completo en móvil */
}
</style>