<template>
  <div class="pet-folder">
    <h3>{{ pet.name }}</h3>
    <div class="media-grid">
      <MediaItem
        v-for="media in pet.media"
        :key="media.id"
        :media="media"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script>
import MediaItem from "./MediaItem.vue";

export default {
  components: { MediaItem },
  props: {
    pet: {
      type: Object,
      required: true,
      validator: (pet) => "name" in pet && "media" in pet,
    },
  },
  methods: {
    handleDelete(media) {
      this.$emit("delete", media);
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/PetFolder.css";
</style>
