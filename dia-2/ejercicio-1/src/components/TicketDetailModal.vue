<script setup>
import { ref } from 'vue';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close']);

const frasePaso = ref('');
const datoSeguroDescifrado = ref(null);




</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span class="codigo-tag">{{ ticket.codigo }}</span>
          <h2>{{ ticket.asunto }}</h2>
          <span class="subtext">Solicitado por {{ ticket.solicitante }}</span>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="section">
          <h3>Descripción</h3>
          <p class="desc-box">{{ ticket.descripcion }}</p>
        </div>

 
        


       
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Cerrar</button>
      </div>
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
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.codigo-tag {
  background: #dbeafe;
  color: #1e40af;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.25rem 0 0;
  color: #0f172a;
}

.subtext { font-size: 0.75rem; color: #64748b; }
.btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 0.5rem;
}

.desc-box {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin: 0;
}

.vault-card {
  background: #0f172a;
  color: #ffffff;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vault-header { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; }
.vault-tag { background: #1e293b; color: #94a3b8; padding: 0.1rem 0.4rem; border-radius: 0.25rem; }
.vault-card p { font-size: 0.75rem; color: #94a3b8; margin: 0; }

.input-field.dark {
  background: #1e293b;
  border: 1px solid #334155;
  color: #ffffff;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.secure-detail-box {
  border: 1px solid #fde68a;
  background: #fffbeb;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.secret-output {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: #1e293b;
}

.secret-output.small { font-size: 0.75rem; background: #f8fafc; }

.note-card {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-card h4 { margin: 0; font-size: 0.875rem; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.modal-footer { padding: 1rem; border-top: 1px solid #e2e8f0; text-align: right; }
.btn { padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-weight: 600; font-size: 0.75rem; cursor: pointer; border: none; }
.btn-warning { background: #d97706; color: #ffffff; }
.btn-outline { background: none; border: 1px solid #cbd5e1; color: #334155; }
.btn-secondary { background: #e2e8f0; color: #334155; }
</style>