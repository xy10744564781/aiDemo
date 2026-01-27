<template>
  <!-- <MainLayout /> -->
  <RouterView />
</template>

<script setup>
// import MainLayout from './components/MainLayout/MainLayout.vue';
</script>
<style >

::-webkit-scrollbar {
    width: 4px ;    
    height: 4px ;   
}

::-webkit-scrollbar-track {
    background: #ffffff;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #c2c2c2;
    border-radius: 4px;
    transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
    background: #8f8f8f;
    cursor: pointer;
}

</style>
