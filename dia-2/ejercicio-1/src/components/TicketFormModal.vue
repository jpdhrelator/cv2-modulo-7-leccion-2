<script setup>
import { reactive, onMounted } from 'vue';

const props = defineProps({
  ticket: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);

const PRIORIDADES = ['baja', 'media', 'alta'];
const ESTADOS = ['abierto', 'en_proceso', 'cerrado'];

const form = reactive({
  id:0,  
  asunto: '',
  descripcion: '',
  solicitante: '',
  prioridad: 'media',
  estado: 'abierto',
  solucion: '',
  incluirDatoSeguro: false,
  datoSeguroEtiqueta: '',
  datoSeguroValorEnClaro: ''
});

onMounted(() => {
  if (props.ticket) {

    form.id = props.ticket.id;
    form.asunto = props.ticket.asunto;
    form.descripcion = props.ticket.descripcion;
    form.solicitante = props.ticket.solicitante;
    form.prioridad = props.ticket.prioridad;
    form.estado = props.ticket.estado;
    form.solucion = props.ticket.solucion || '';
    if (props.ticket.datoSeguro) {
      form.incluirDatoSeguro = true;
      form.datoSeguroEtiqueta = props.ticket.datoSeguro.etiqueta;
    }
  }
});

const handleSubmit = () => {
  emit('save', { ...form });
  emit('close');
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ props.ticket ? 'Editar Ticket: ' + props.ticket.codigo : 'Crear Nuevo Ticket' }}</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Solicitante</label>
            <input v-model="form.solicitante" required type="text" class="input-field" />
          </div>
          <div class="form-group">
            <label>Prioridad</label>
            <select v-model="form.prioridad" class="input-field">
              <option v-for="p in PRIORIDADES" :key="p" :value="p">{{ p.toUpperCase() }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Asunto</label>
          <input v-model="form.asunto" required type="text" class="input-field" />
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.descripcion" rows="3" required class="input-field"></textarea>
        </div>

        <div v-if="props.ticket" class="form-group">
          <label>Estado</label>
          <select v-model="form.estado" class="input-field">
            <option v-for="e in ESTADOS" :key="e" :value="e">{{ e.replace('_', ' ').toUpperCase() }}</option>
          </select>
        </div>

        <div v-if="props.ticket && form.estado === 'cerrado'" class="form-group">
          <label>Solución del Ticket</label>
          <textarea v-model="form.solucion" rows="2" class="input-field" placeholder="Detalle de la resolución..."></textarea>
        </div>

        <!-- Dato Seguro -->
        <div class="secure-box">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.incluirDatoSeguro" />
            <span>Adjuntar Dato Sensible Cifrado (Opcional)</span>
          </label>

          <div v-if="form.incluirDatoSeguro" class="secure-fields">
            <div class="form-group">
              <label>Etiqueta (En claro)</label>
              <input v-model="form.datoSeguroEtiqueta" type="text" placeholder="Ej: Teléfono directo, RUT" class="input-field" />
            </div>
            <div class="form-group">
              <label>Dato Secreto (Se cifrará en el navegador)</label>
              <input v-model="form.datoSeguroValorEnClaro" type="password" placeholder="Contenido confidencial..." class="input-field" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.modal-card {
  background: #ffffff;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.input-field {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
}

.input-field:focus {
  border-color: #2563eb;
}

.secure-box {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.secure-fields {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
}

.btn-primary { background: #2563eb; color: #fff; }
.btn-secondary { background: #f1f5f9; color: #475569; }
</style>