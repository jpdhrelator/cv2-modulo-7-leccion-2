<script setup>
import { traducirError } from '../utils/errores.js'

try {
  const { data } = await http.get('/items')
  items.value = data
} catch (e) {
  error.value = traducirError(e)   // ← al usuario
  console.error(e)                 // ← al programador
}

</script>

<template>
</template>
