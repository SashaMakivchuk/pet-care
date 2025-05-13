<template>
  <div class="comment-item">
    <div class="comment-header">
      <span class="comment-author">{{ comment.userName }}</span>
      <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
      <button
        v-if="comment.userId === currentUserId"
        class="delete-comment-button"
        @click="$emit('delete', comment)"
      >
        Delete
      </button>
    </div>
    <p>{{ comment.content }}</p>
  </div>
</template>

<script>
export default {
  props: {
    comment: { type: Object, required: true },
    currentUserId: { type: String, default: null },
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
.comment-item {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
  color: #fff;
  font-family: "Open Sans", sans-serif;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.comment-author {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.comment-date {
  font-size: 14px;
  color: #c9c7c7;
}

.delete-comment-button {
  margin-left: auto;
  padding: 6px 12px;
  background-color: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.delete-comment-button:hover {
  background-color: #cc0000;
}

.comment-item p {
  font-size: 16px;
  color: #c9c7c7;
  line-height: 1.6;
  margin: 0;
}

@media screen and (max-width: 767px) {
  .comment-item {
    padding: 12px;
    margin-bottom: 10px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .comment-author {
    font-size: 16px;
  }

  .comment-date {
    font-size: 13px;
  }

  .delete-comment-button {
    margin-left: 0;
    padding: 5px 10px;
    font-size: 13px;
  }

  .comment-item p {
    font-size: 14px;
  }
}
</style>
