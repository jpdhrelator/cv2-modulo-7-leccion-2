<script setup>
import { onMounted, ref } from 'vue';
import LoginComponent from './components/LoginComponent.vue';
import BaseComponent from './components/BaseComponent.vue';
import { obtenerToken, tokenExpirado } from './utils/utils.js';

const isLogin= ref(false);


const heandledLoginSucess=(resutl)=>{
  isLogin.value=resutl;
}
onMounted(()=>{
  const token= obtenerToken();  
  if(tokenExpirado(token)) {
   isLogin.value=false;
    return;
  }
  isLogin.value=true;
 
});
</script>

<template>
  <BaseComponent v-if="isLogin"/>

  <LoginComponent @login-success="heandledLoginSucess" v-else/>
</template>
