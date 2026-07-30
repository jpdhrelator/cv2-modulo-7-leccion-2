<script setup>
import { ref, reactive } from 'vue';
import { http } from '../services/http.service';
import { guardarToken } from '../utils/utils';

const emit = defineEmits(['login-success']);

const form = reactive({
  usuario: '',
  password: '',
  frasePasoMaster: '',
});

const showPassword = ref(false);
const showFrasePaso = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);

const handleLogin = async () => {
  errorMessage.value = null;

  if (!form.usuario || !form.password) {
    errorMessage.value = 'Por favor completa el usuario y la contraseña.';
    return;
  }

  isLoading.value = true;

  try {
   
   const {status,data}= await http.post('/login',{
        "username": form.usuario,
        "password": form.password
    });

    console.log(status,data);
    
    if(status==200 && data?.message =='Login exitoso'){
        guardarToken(data.token)
        emit('login-success', true);
    }
    

    
  } catch (err) {
    console.log(err);
    
    errorMessage.value = 'Credenciales inválidas o error de conexión.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">🔐</div>
        <h1>Mesa de Ayuda</h1>
        <p>Acceso al sistema y bóveda cifrada</p>
      </div>

      <div v-if="errorMessage" class="alert-error">
        ⚠️ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Usuario o Correo</label>
          <input v-model="form.usuario" type="text" required placeholder="ej. carlos.mendoza" class="input-field" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="password-wrapper">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="input-field" />
            <button type="button" @click="showPassword = !showPassword" class="btn-toggle">{{ showPassword ? 'Ocultar' : 'Ver' }}</button>
          </div>
        </div>

        <!-- <div class="vault-section">
          <div class="flex-between">
            <label class="gold-label">🔐 Frase Master Bóveda</label>
            <span class="subtext">Zero-Knowledge</span>
          </div>
          <div class="password-wrapper">
            <input v-model="form.frasePasoMaster" :type="showFrasePaso ? 'text' : 'password'" placeholder="Opcional para descifrar" class="input-field dark" />
            <button type="button" @click="showFrasePaso = !showFrasePaso" class="btn-toggle dark">{{ showFrasePaso ? 'Ocultar' : 'Ver' }}</button>
          </div>
        </div> -->

        <button type="submit" :disabled="isLoading" class="btn-submit">
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.login-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-header h1 {
  color: #ffffff;
  font-size: 1.5rem;
  margin: 0;
}

.login-header p {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 600;
}

.input-field {
  background: #1e293b;
  border: 1px solid #334155;
  color: #ffffff;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #3b82f6;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
}

.vault-section {
  border-top: 1px solid #1e293b;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gold-label { color: #fbbf24; font-size: 0.75rem; font-weight: 600; }
.subtext { color: #64748b; font-size: 0.625rem; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.btn-submit {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #1d4ed8;
}

.btn-submit:disabled {
  background: #1e3a8a;
  cursor: not-allowed;
}
</style>