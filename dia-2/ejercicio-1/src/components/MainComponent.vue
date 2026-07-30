<script setup>
import { ref, computed, onMounted } from 'vue';
import { http } from '../services/http.service';
import TicketFormModal from './TicketFormModal.vue';
import TicketDetailModal from './TicketDetailModal.vue';

const tickets = ref([]);

async function obtenerTickets(){
   const {data}= await http.get('/tickets');

   if(data && data?.datos){
        tickets.value=data.datos;
   }
   
}

const busqueda = ref('');
const filtroEstado = ref('');
const filtroPrioridad = ref('');

const showFormModal = ref(false);
const showDetailModal = ref(false);
const selectedTicket = ref(null);



const ticketsFiltrados = computed(async () => {

    const params={};
    if(busqueda.value.toLowerCase()){
        params.buscar=busqueda.value.toLowerCase();
    }
    if(filtroEstado.value){
        params.estado=filtroEstado.value;
    }
    if(filtroPrioridad.value){
        params.prioridad= filtroPrioridad.value;
    }

     const {data}= await http.get('/tickets',{params});      
    if(data && data?.datos){
        tickets.value=data.datos;
        return tickets;
    }
    return [];

});

const openCreateModal = () => {
  selectedTicket.value = null;
  showFormModal.value = true;
};

const openEditModal =async (idTicket) => {

  const {data}= await http.get(`/tickets/${idTicket}`);
      
  selectedTicket.value = { ...data };
  showFormModal.value = true;
};

const openDetailModal = (ticket) => {
  selectedTicket.value = ticket;
  showDetailModal.value = true;
};

onMounted(()=>{
    obtenerTickets();
});

async function guardarTicket(ticket) {

    if(ticket?.id>0){
       await http.put(`/tickets/${ticket.id}`,ticket);
    }else{
        await http.post('/tickets',ticket);
    }
   
    
}
async function cerrarTicket(ticket) {
    await http.patch(`/tickets/${ticket.id}`,{ estado:'cerrado'});
    obtenerTickets();
}
async function eliminarTicket(idTicket) {
    await http.delete(`/tickets/${idTicket}`);
    obtenerTickets();
}

</script>

<template>
  <div class="crud-container">
    <!-- Header -->
    <header class="crud-header">
      <div>
        <h1>Mesa de Ayuda - Tickets</h1>
        <p>Gestión de tickets y soporte con cifrado cliente</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">+ Nuevo Ticket</button>
    </header>

    <!-- Filtros -->
    <div class="filters-card">
      <input 
        v-model="busqueda"
        type="text" 
        placeholder="Buscar por código, asunto o solicitante..." 
        class="input-field search-input"
      />
      <div class="select-group">
        <select v-model="filtroEstado" class="input-field">
          <option value="">Todos los Estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En Proceso</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <select v-model="filtroPrioridad" class="input-field">
          <option value="">Todas las Prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Código / Asunto</th>
              <th>Solicitante</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Dato Seguro</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tickets" :key="t.id">
              <td>
                <div class="codigo">{{ t.codigo }}</div>
                <div class="asunto-subtext">{{ t.asunto }}</div>
              </td>
              <td>{{ t.solicitante }}</td>
              <td>
                <span :class="['badge', 'prio-' + t.prioridad]">{{ t.prioridad }}</span>
              </td>
              <td>
                <span :class="['badge', 'status-' + t.estado]">{{ t.estado.replace('_', ' ') }}</span>
              </td>
              <td>
                <span v-if="t.datoSeguro" class="badge-secure">🔒 {{ t.datoSeguro.etiqueta }}</span>
                <span v-else class="text-muted">Sin datos</span>
              </td>
              <td class="text-right actions-cell">
                <button @click="openDetailModal(t)" class="btn-link">Ver / Notas</button>
                <button @click="openEditModal(t.id)" class="btn-link secondary">Editar</button>
                <button @click="cerrarTicket(t)" class="btn-link primary">Cerrar Ticket</button>
                <button @click="eliminarTicket(t.id)" class="btn-link peligro">Borrar Ticket</button>
              </td>
            </tr>
            <tr v-if="ticketsFiltrados.length === 0">
              <td colspan="6" class="empty-state">No se encontraron tickets.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales -->
    <TicketFormModal 
      v-if="showFormModal" 
      :ticket="selectedTicket" 
      @close="showFormModal = false" 
      @save="guardarTicket"
    />
 
    <TicketDetailModal 
      v-if="showDetailModal && selectedTicket" 
      :ticket="selectedTicket" 
      @close="showDetailModal = false" 
    />
 
  </div>
</template>

<style scoped>
.crud-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.crud-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.crud-header p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

/* Filtros */
.filters-card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.search-input {
  flex: 1;
}

.select-group {
  display: flex;
  gap: 0.5rem;
}

.input-field {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #2563eb;
}

/* Tabla */
.table-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.codigo {
  font-weight: 600;
  color: #0f172a;
}

.asunto-subtext {
  color: #64748b;
  font-size: 0.75rem;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}

.prio-baja { background: #dcfce7; color: #166534; }
.prio-media { background: #fef9c3; color: #854d0e; }
.prio-alta { background: #fee2e2; color: #991b1b; }

.status-abierto { background: #dbeafe; color: #1e40af; }
.status-en_proceso { background: #f3e8ff; color: #6b21a8; }
.status-cerrado { background: #e2e8f0; color: #475569; }

.badge-secure {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
}

.text-muted { color: #94a3b8; font-size: 0.75rem; }
.text-right { text-align: right; }
.empty-state { text-align: center; padding: 2rem; color: #94a3b8; }

/* Botones */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-link.secondary { color: #64748b; }
.btn-link.peligro { color: #991b1b; }
.btn-link.primary { color: #2563eb; }
.btn-link:hover { text-decoration: underline; }
.actions-cell { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>