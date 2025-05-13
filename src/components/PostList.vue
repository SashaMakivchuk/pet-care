<template>
  <div class="post-list">
    <div v-if="loading" class="loading"></div>
    <div v-else-if="posts.length === 0" class="no-posts">
      No posts yet. Be the first to share!
    </div>
    <div v-else>
      <PostItem
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :current-user-id="currentUserId"
        :user-like="userLikes[post.id]"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import PostItem from "@/components/PostItem.vue";
import { reactive } from "vue";

export default {
  components: { PostItem },
  props: {
    posts: { type: Array, required: true },
    loading: { type: Boolean, required: true },
    currentUserId: { type: String, default: null },
  },
  setup() {
    const userLikes = reactive({});
    return { userLikes };
  },
  watch: {
    posts: {
      handler(newPosts) {
        if (this.currentUserId) {
          newPosts.forEach((post) => {
            this.fetchUserLike(post.id);
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetchUserLike(postId) {
      if (!this.currentUserId) return;
      const likeRef = doc(db, `forumPosts/${postId}/likes`, this.currentUserId);
      onSnapshot(likeRef, (doc) => {
        if (doc.exists()) {
          this.userLikes[postId] = doc.data().value;
        } else {
          delete this.userLikes[postId];
        }
      });
    },
  },
};
</script>

<style scoped>
.post-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Open Sans", sans-serif;
}

.loading,
.no-posts {
  font-size: 1.6rem;
  text-align: center;
  padding: 20px;
  border-radius: 0.375rem;
  color: #c9c7c7;
  background: rgba(255, 255, 255, 0.1);
}

.loading {
  background: rgba(255, 255, 255, 0.1);
}

.no-posts {
  background: rgba(255, 255, 255, 0.1);
}

.post-list > div {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media screen and (max-width: 767px) {
  .post-list {
    padding: 15px;
  }

  .loading,
  .no-posts {
    font-size: 1.2rem;
    padding: 15px;
  }

  .post-list > div {
    gap: 15px;
  }
}
</style>
