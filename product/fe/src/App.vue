<template>
  <div id="app">
    <Navigation />

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Basic styling */
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}
</style>
