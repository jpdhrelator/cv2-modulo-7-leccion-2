<script setup>
import FormularioLogin from './components/FormularioLogin.vue';
import {http} from './services/https.service.js'

function handlerSesionInicida(payload) {
  console.log(`payload desde el hijo: ${JSON.stringify(payload)}`);
  
}

async function crear() {

  const nuevoItem={
    "id": 5,
    "name": "Nuevo Item 5",
    "description": "Prueba desde app.vue",
    "category": "Test",
    "price": 1000,
    "createdAt": "2026-07-29T00:11:53.595Z"
};

  await http.post('/items', nuevoItem)
}


</script>

<template>
  <button @click="crear">Crear Item</button>
 <!-- <FormularioLogin @sesion-iniciada="handlerSesionInicida"/> -->
</template>
