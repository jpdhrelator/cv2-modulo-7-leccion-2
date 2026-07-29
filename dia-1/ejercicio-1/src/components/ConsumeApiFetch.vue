<script setup>

const respuesta= await fetch('http://localhost:3001/api/items', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
console.log('respuesta',respuesta);

const datos = await respuesta.json();

console.log('datos',datos);
const datoref= ref(datos);
</script>

<template>
</template>
