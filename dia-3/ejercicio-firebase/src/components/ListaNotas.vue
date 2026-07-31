<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

/* ------------------------------------------------------------------
   ESTADO
------------------------------------------------------------------- */
const notas = ref([])          // lo que llega de Firestore
const nuevoTitulo = ref('')    // el input del formulario
const cargando = ref(true)     // true hasta el primer snapshot
const guardando = ref(false)   // bloquea el formulario mientras escribe
const error = ref('')          // mensaje humano

const pendientes = computed(
  () => notas.value.filter((n) => !n.completada).length
)
const COLLECTION_NAME='notas';

/* ------------------------------------------------------------------
   REFERENCIA A LA COLECCIÓN
   collection(db, 'notas') NO consulta nada todavía: solo apunta.
   Si la colección no existe, Firestore la crea al insertar el primer
   documento. No hay que "crear la tabla" en ninguna parte.
------------------------------------------------------------------- */
const coleccionNotas = collection(db, COLLECTION_NAME);

/* Guardamos aquí la función que corta la suscripción. */
let cancelarSuscripcion = null

/* ------------------------------------------------------------------
   SUSCRIPCIÓN EN TIEMPO REAL
   onMounted se ejecuta cuando el componente ya está en pantalla.
------------------------------------------------------------------- */
onMounted(() => {
  const consulta = query(coleccionNotas, orderBy('creadoEn', 'desc'))

  cancelarSuscripcion = onSnapshot(
    consulta,
    (instantanea) => {
      // Se ejecuta AHORA y cada vez que la colección cambie,
      // aunque el cambio venga de otra pestaña o de otra persona.
      notas.value = instantanea.docs.map((documento) => ({
        id: documento.id,        // el id vive fuera de los datos
        ...documento.data()      // titulo, completada, creadoEn
      }))
      cargando.value = false
      error.value = ''
    },
    (fallo) => {
      // Segundo callback: errores de la suscripción.
      // El más común aquí es permission-denied (reglas de seguridad).
      console.error(fallo)
      cargando.value = false
      error.value = traducirError(fallo)
    }
  )
})

/* ------------------------------------------------------------------
   CORTAR LA SUSCRIPCIÓN
   Si no haces esto, el listener sigue vivo aunque el componente ya
   no exista: consume memoria, sigue disparando y sigue facturando.
   Es la fuga de recursos más común con Firestore.
------------------------------------------------------------------- */
onUnmounted(() => {
  if (cancelarSuscripcion) cancelarSuscripcion()
})

/* ------------------------------------------------------------------
   CREAR
   Fíjate: después de addDoc NO tocamos notas.value.
   onSnapshot se entera solo. Ese es el punto de Firestore.
------------------------------------------------------------------- */
async function alCrear() {
  const titulo = nuevoTitulo.value.trim()
  if (!titulo) return

  guardando.value = true
  error.value = ''

  try {
    const nuevoDoc={
      titulo,
      completada: false,
      creadoEn: serverTimestamp()  // hora del servidor, no del equipo
    };
    await addDoc(coleccionNotas, nuevoDoc);
    nuevoTitulo.value = ''
  } catch (fallo) {
    console.error(fallo)
    error.value = traducirError(fallo)
  } finally {
    guardando.value = false
  }
}

/* ------------------------------------------------------------------
   ACTUALIZAR
   doc(db, 'notas', id) apunta a UN documento.
   updateDoc modifica solo los campos que le pases: el resto queda
   intacto. Es un PATCH, no un PUT.
------------------------------------------------------------------- */
async function alAlternar(nota) {
  error.value = ''
  try {
    await updateDoc(doc(db, COLLECTION_NAME, nota.id), 
    {
      completada: !nota.completada
    })
  } catch (fallo) {
    console.error(fallo)
    error.value = traducirError(fallo)
  }
}

/* ------------------------------------------------------------------
   ELIMINAR
------------------------------------------------------------------- */
async function alEliminar(id) {
  error.value = ''
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (fallo) {
    console.error(fallo)
    error.value = traducirError(fallo)
  }
}

/* ------------------------------------------------------------------
   FORMATEAR FECHA
   creadoEn es un Timestamp de Firestore, no un Date de JavaScript.
   Hay que llamar .toDate() para convertirlo.

   OJO: justo después de crear una nota, creadoEn llega null por unos
   milisegundos. Firestore muestra el documento en pantalla ANTES de
   que el servidor asigne la hora (se llama compensación de latencia).
   Si no controlas ese null, te explota el template.
------------------------------------------------------------------- */
function formatearFecha(marcaDeTiempo) {
  if (!marcaDeTiempo) return 'Guardando...'

  return marcaDeTiempo.toDate().toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/* ------------------------------------------------------------------
   TRADUCIR ERRORES
   El usuario no tiene por qué leer "FirebaseError: Missing or
   insufficient permissions". Le hablamos en su idioma.
------------------------------------------------------------------- */
function traducirError(fallo) {
  const codigo = fallo?.code || ''

  if (codigo === 'permission-denied') {
    return 'No tienes permiso para acceder a estos datos. Revisa las reglas de Firestore.'
  }
  if (codigo === 'unavailable') {
    return 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
  }
  if (codigo === 'failed-precondition') {
    return 'La consulta necesita un índice. Revisa el enlace que aparece en la consola.'
  }
  return 'Ocurrió un problema al guardar tus notas. Inténtalo nuevamente.'
}
</script>
<template>
  <section class="notas">
    <header class="notas__cabecera">
      <h2>📝 Mis notas</h2>
      <p>Guardadas en Firestore. Abre esta página en dos pestañas y mira qué pasa.</p>
    </header>

    <!-- FORMULARIO: crear nota -->
    <form class="formulario" @submit.prevent="alCrear">
      <input
        v-model="nuevoTitulo"
        type="text"
        placeholder="Escribe una nota y presiona Enter..."
        class="formulario__campo"
        :disabled="guardando"
      />
      <button
        type="submit"
        class="btn btn--primario"
        :disabled="!nuevoTitulo.trim() || guardando"
      >
        {{ guardando ? 'Guardando...' : 'Agregar' }}
      </button>
    </form>

    <!-- ERROR -->
    <p v-if="error" class="alerta alerta--error" role="alert">
      {{ error }}
    </p>

    <!-- CARGANDO: esqueletos, no un spinner -->
    <div v-if="cargando" class="esqueletos" aria-busy="true">
      <div class="esqueleto" v-for="n in 3" :key="n"></div>
    </div>

    <!-- ESTADO VACÍO -->
    <div v-else-if="notas.length === 0" class="vacio">
      <span class="vacio__icono">📭</span>
      <p>Todavía no hay notas.</p>
      <p class="vacio__pista">Escribe la primera arriba.</p>
    </div>

    <!-- LISTA -->
    <ul v-else class="lista">
      <li
        v-for="nota in notas"
        :key="nota.id"
        class="lista__item"
        :class="{ 'lista__item--lista': nota.completada }"
      >
        <label class="lista__check">
          <input
            type="checkbox"
            :checked="nota.completada"
            @change="alAlternar(nota)"
          />
          <span class="lista__titulo">{{ nota.titulo }}</span>
        </label>

        <div class="lista__pie">
          <span class="lista__fecha">{{ formatearFecha(nota.creadoEn) }}</span>
          <button
            type="button"
            class="btn-icono"
            aria-label="Eliminar nota"
            @click="alEliminar(nota.id)"
          >
            🗑️
          </button>
        </div>
      </li>
    </ul>

    <footer v-if="!cargando && notas.length > 0" class="notas__pie">
      {{ pendientes }} pendiente(s) de {{ notas.length }}
    </footer>
  </section>
</template>
<style scoped>
/* Mismo sistema de espaciado de 8pt del ejercicio 1. */

.notas {
  max-width: 640px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e6ea;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1b1f24;
}

.notas__cabecera { margin-bottom: 1.5rem; }
.notas__cabecera h2 { margin: 0 0 0.5rem; font-size: 1.35rem; }
.notas__cabecera p  { margin: 0; color: #4a5560; font-size: 0.9rem; }

/* ---------- FORMULARIO ---------- */
.formulario {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.formulario__campo {
  flex: 1;
  min-width: 0;              /* evita que el input desborde el flex */
  padding: 0.75rem;
  border: 1px solid #cdd4da;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  background: #fbfcfd;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.formulario__campo:focus {
  outline: none;
  border-color: #f5820b;
  box-shadow: 0 0 0 3px rgba(245, 130, 11, 0.18);
}

.formulario__campo:disabled { opacity: 0.6; }

/* ---------- BOTONES ---------- */
.btn {
  min-height: 44px;
  padding: 0 1.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn--primario { background: #f5820b; color: #2b1704; }
.btn--primario:hover:not(:disabled) { background: #d96f04; color: #ffffff; }

.btn-icono {
  min-width: 44px;
  min-height: 44px;          /* área táctil: no un ícono de 16px */
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-icono:hover { background: #fdecea; }

/* ---------- ALERTAS ---------- */
.alerta {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
}

.alerta--error {
  background: #fdecea;
  border-left: 4px solid #c0392b;
  color: #a5281b;
}

/* ---------- ESQUELETOS DE CARGA ----------
   Un esqueleto comunica la forma de lo que viene.
   Un spinner solo dice "espera". */
.esqueletos { display: flex; flex-direction: column; gap: 0.5rem; }

.esqueleto {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eef1f4 25%, #e2e6ea 50%, #eef1f4 75%);
  background-size: 200% 100%;
  animation: brillo 1.4s ease-in-out infinite;
}

@keyframes brillo {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* Respeta a quien pidió menos movimiento en su sistema operativo. */
@media (prefers-reduced-motion: reduce) {
  .esqueleto { animation: none; }
}

/* ---------- ESTADO VACÍO ---------- */
.vacio {
  padding: 2.5rem 1rem;
  text-align: center;
  border: 2px dashed #dfe4e9;
  border-radius: 8px;
  color: #6b7681;
}

.vacio__icono { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
.vacio p { margin: 0; font-size: 0.95rem; }
.vacio__pista { margin-top: 0.5rem !important; font-size: 0.82rem; }

/* ---------- LISTA ---------- */
.lista { list-style: none; margin: 0; padding: 0; }

.lista__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e6ea;
  border-radius: 8px;
  background: #fbfcfd;
  transition: background 0.15s ease;
}

.lista__item:hover { background: #f6f7f9; }

.lista__item--lista .lista__titulo {
  text-decoration: line-through;
  color: #8a949e;
}

.lista__check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.lista__check input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

.lista__titulo {
  font-size: 0.95rem;
  overflow-wrap: anywhere;   /* títulos largos no rompen el layout */
}

.lista__pie { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.lista__fecha { font-size: 0.75rem; color: #8a949e; white-space: nowrap; }

/* ---------- PIE ---------- */
.notas__pie {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e6ea;
  font-size: 0.82rem;
  color: #6b7681;
  text-align: right;
}

/* ---------- RESPONSIVO ---------- */
@media (max-width: 640px) {
  .notas { margin: 1rem; padding: 1.5rem 1rem; }
  .formulario { flex-direction: column; }
  .lista__fecha { display: none; }   /* en móvil el título manda */
}
</style>