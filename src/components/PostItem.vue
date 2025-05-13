<template>
  <div class="post-item">
    <div class="post-header">
      <span class="post-author">{{ post.userName }}</span>
      <span class="post-date">{{ formatDateTime(post.createdAt) }}</span>
      <button
        v-if="post.userId === currentUserId"
        class="delete-post-button"
        @click="$emit('delete', post)"
      >
        Delete
      </button>
    </div>
    <router-link :to="`/forum/${post.id}`">
      <h3>{{ post.title }}</h3>
    </router-link>
    <p>{{ post.content }}</p>
    <div v-if="post.mediaURL" class="post-media">
      <img
        v-if="post.mediaType === 'photo'"
        :src="post.mediaURL"
        alt="Post image"
      />
      <video v-else-if="post.mediaType === 'video'" controls>
        <source :src="post.mediaURL" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="post-actions">
      <button
        class="like-button"
        :class="{ active: userLike === 1 }"
        @click="toggleLike(1)"
        aria-label="Like post"
      >
        <i class="fas fa-thumbs-up" aria-hidden="true"></i>
      </button>
      <button
        class="dislike-button"
        :class="{ active: userLike === -1 }"
        @click="toggleLike(-1)"
        aria-label="Dislike post"
      >
        <i class="fas fa-thumbs-down" aria-hidden="true"></i>
      </button>
      <p>({{ post.likeCount || 0 }})</p>
      <router-link :to="`/forum/${post.id}`" class="comment-link">
        Comments ({{ post.commentCount || 0 }})
      </router-link>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

export default {
  props: {
    post: { type: Object, required: true },
    currentUserId: { type: String, default: null },
    userLike: { type: Number, default: null },
  },
  methods: {
    async toggleLike(value) {
      if (!this.currentUserId) return;
      try {
        const likeRef = doc(
          db,
          `forumPosts/${this.post.id}/likes`,
          this.currentUserId
        );
        const postRef = doc(db, "forumPosts", this.post.id);
        const currentLike = this.userLike;
        if (currentLike === value) {
          await deleteDoc(likeRef);
          await updateDoc(postRef, {
            likeCount: (this.post.likeCount || 0) - value,
          });
        } else {
          await setDoc(likeRef, { value });
          await updateDoc(postRef, {
            likeCount:
              (this.post.likeCount || 0) +
              (currentLike ? -currentLike + value : value),
          });
        }
      } catch (error) {
        console.error("Toggle like error:", error);
      }
    },
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
@import "@/assets/styles/components/PostItem.css";
</style>
