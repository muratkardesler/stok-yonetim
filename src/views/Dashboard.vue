<template>
  <div>
    <h1>Dashboard</h1>
    <p>Hoş geldiniz, {{ userEmail }}</p>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      userEmail: localStorage.getItem('userEmail') || ''
    }
  }
}
</script> 