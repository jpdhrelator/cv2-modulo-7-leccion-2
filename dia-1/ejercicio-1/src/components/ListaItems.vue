<script setup>
import { ref, onMounted } from 'vue'
import { http } from '../services/https.service.js'

const items    = ref([])
const cargando = ref(false)
const error    = ref(null)

async function cargarItems() {
  cargando.value = true
  error.value = null

  try {
    // Axios devuelve un objeto grande: { data, status, headers, config... }
    // Casi siempre solo nos interesa data, así que lo desestructuramos.
    const { data } = await http.get('/items')
    items.value = data
  } catch (e) {
    error.value = 'No pudimos cargar el inventario.'
    console.error(e)                    // el detalle técnico va a consola
  } finally {
    // finally SIEMPRE se ejecuta: haya salido bien o mal.
    // Por eso apagamos el "cargando" acá y no en los dos caminos.
    cargando.value = false
  }
}

// La carga arranca cuando el componente ya está en el DOM.
onMounted(cargarItems)
</script>

<template>
  <section class="lista">
    <header class="lista__head">
      <h2>Inventario</h2>
      <button type="button" @click="cargarItems" :disabled="cargando">
        {{ cargando ? 'Cargando…' : 'Recargar' }}
      </button>
    </header>

    <!-- ESTADO 1: cargando -->
    <div v-if="cargando" class="skeleton">
      <div class="linea"></div><div class="linea"></div><div class="linea corta"></div>
    </div>

    <!-- ESTADO 2: error -->
    <p v-else-if="error" class="error" role="alert">{{ error }}</p>

    <!-- ESTADO 3: vacío -->
    <p v-else-if="!items.length" class="vacio">No hay items en el inventario.</p>

    <!-- ESTADO 4: datos -->
    <ul v-else class="items">
      <li v-for="item in items" :key="item.id">
        <strong>{{ item.name }}</strong>
        <span class="cat">{{ item.category }}</span>
        <span class="precio">$ {{ item.price }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.lista__head { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
.items { list-style:none; padding:0; margin:0; display:grid; gap:.5rem; }
.items li {
  display:flex; align-items:center; gap:1rem;
  padding:.75rem 1rem; border:1px solid #e2e6ea; border-radius:8px; background:#fff;
}
.cat { color:#6b7680; font-size:.85rem; }
.precio { margin-left:auto; font-weight:700; color:#2f8f66; }
.error { color:#c0392b; background:#fdecea; padding:1rem; border-radius:8px; }
.vacio { color:#8b949e; text-align:center; padding:2rem; }
button { min-height:44px; padding:0 1rem; border:none; border-radius:8px; background:#42b883; color:#0d2b1e; font-weight:700; cursor:pointer; }
button:disabled { background:#d5dade; color:#8b949e; cursor:not-allowed; }
.skeleton .linea { height:3rem; background:#e2e6ea; border-radius:8px; margin-bottom:.5rem; animation:pulso 1.5s infinite; }
.skeleton .corta { width:60%; }
@keyframes pulso { 0%,100%{opacity:1} 50%{opacity:.5} }
</style>