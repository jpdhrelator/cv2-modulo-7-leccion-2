<script setup>
import { ref, computed } from 'vue'
import { login, guardarToken, leerPayload } from '../services/auth.service'
import { traducirError } from '../utils/errores'

const emit = defineEmits(['sesion-iniciada'])

const usuario  = ref('')
const clave    = ref('')
const cargando = ref(false)
const error    = ref(null)

const formularioValido = computed(
  () => usuario.value.trim().length > 0 && clave.value.length > 0
)

async function enviar() {
  if (!formularioValido.value) return

  cargando.value = true
  error.value = null

  try {
    const token = await login(usuario.value.trim(), clave.value)
    guardarToken(token)

    // Avisamos hacia arriba. El hijo no decide qué pasa después del login.
    emit('sesion-iniciada', { token, payload: leerPayload(token) })

    clave.value = ''                    // nunca dejes la clave en memoria de más
  } catch (e) {
    error.value = traducirError(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <!-- @submit.prevent evita que el navegador recargue la página -->
  <form class="login" @submit.prevent="enviar">
    <h2>Iniciar sesión</h2>

    <label>
      Usuario
      <input v-model.trim="usuario" type="text" autocomplete="username" required>
    </label>

    <label>
      Contraseña
      <input v-model="clave" type="password" autocomplete="current-password" required>
    </label>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <button type="submit" :disabled="cargando || !formularioValido">
      {{ cargando ? 'Verificando…' : 'Entrar' }}
    </button>

    <p class="ayuda">Credenciales de prueba: admin / admin123</p>
  </form>
</template>

<style scoped>
.login { display:grid; gap:1rem; max-width:360px; padding:1.5rem; border:1px solid #e2e6ea; border-radius:12px; background:#fff; }
.login h2 { margin:0; font-size:1.25rem; }
label { display:grid; gap:.25rem; font-size:.875rem; color:#4a5560; }
input { padding:.75rem; border:1px solid #e2e6ea; border-radius:8px; font-size:1rem; }
input:focus { outline:2px solid #42b883; outline-offset:1px; }
button { min-height:44px; border:none; border-radius:8px; background:#42b883; color:#0d2b1e; font-weight:700; cursor:pointer; }
button:disabled { background:#d5dade; color:#8b949e; cursor:not-allowed; }
.error { color:#c0392b; background:#fdecea; padding:.75rem; border-radius:8px; margin:0; font-size:.9rem; }
.ayuda { color:#8b949e; font-size:.8rem; margin:0; }
</style>