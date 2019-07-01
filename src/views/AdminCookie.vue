<template>
  <div class="admin">
    <button @click="setAdmin()">SetCookie</button>
  </div>
</template>

<script>

export default {
  name: "adminCookie",
  methods: {
    setAdmin () {
        this.$store.dispatch('setAdminCookie');
    }
  }

};
</script>
