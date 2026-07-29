<script setup>

import {http} from '../services/httpsService.js'


const { data } = await http.get('/items');


console.log('data axios',data);

</script>

<template>
</template>
