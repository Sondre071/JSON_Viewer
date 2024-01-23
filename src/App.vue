<script setup lang="ts">
import Table from './components/Table.vue'
</script>

<script>
</script>

<template>
  <div class="container text-center mt-5 mb-5">
    <div class="table-responsive my-5">
      <Table></Table>
    </div>
  </div>
  <main>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
