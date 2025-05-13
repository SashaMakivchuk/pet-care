<template>
  <div class="pet-form-page">
    <PetForm :petId="$route.params.id" />
  </div>
</template>

<script>
import PetForm from "@/components/PetForm.vue";

export default {
  components: { PetForm },
  computed: {
    petId() {
      return this.$route.params.id;
    },
  },
};
</script>

<style scoped>
.pet-form-page {
  text-align: center;
  padding: 20px;
}
</style>
