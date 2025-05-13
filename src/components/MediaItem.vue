<template>
  <div class="media-item">
    <div class="media-preview">
      <img
        v-if="media.mediaType === 'photo'"
        :src="media.mediaURL"
        :alt="media.fileName"
      />
      <video
        v-else-if="media.mediaType === 'video'"
        controls
        :poster="media.mediaURL"
      >
        <source :src="media.mediaURL" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="media-info">
      <p class="file-name">{{ media.fileName }}</p>
      <p class="timestamp">{{ formatDateTime(media.uploadedAt) }}</p>
      <button class="delete-button" @click="$emit('delete', media)">
        Delete
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    media: {
      type: Object,
      required: true,
      validator: (media) =>
        "id" in media && "mediaURL" in media && "mediaType" in media,
    },
  },
  methods: {
    formatDateTime(timestamp) {
      if (!timestamp) return "";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/MediaItem.css";
</style>
