<template>
  <div class="forum-page">
    <h1>Pet Community Forum</h1>
    <h2>Community Posts</h2>
    <div v-if="!isLoggedIn" class="not-logged-in">
      Please <router-link to="/login">log in</router-link> to post or share
      media.
    </div>
    <div v-else class="create-post-container">
      <router-link to="/create-post" class="create-post-button">
        Create Post
      </router-link>
    </div>
    <PostList
      :posts="posts"
      :loading="loading"
      :current-user-id="currentUserId"
      @delete="openDeleteAlert"
    />
    <DeleteAlert
      :is-open="showDeleteAlert"
      :message="deleteMessage"
      @confirm="confirmDelete"
      @cancel="closeDeleteAlert"
    />
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { mapState } from "vuex";
import PostList from "@/components/PostList.vue";
import DeleteAlert from "@/components/DeleteAlert.vue";

export default {
  components: { PostList, DeleteAlert },
  data() {
    return {
      posts: [],
      error: "",
      loading: true,
      showDeleteAlert: false,
      deletePostId: null,
      deleteMessage: "",
    };
  },
  computed: {
    ...mapState(["isLoggedIn"]),
    currentUserId() {
      return auth.currentUser?.uid || null;
    },
  },
  created() {
    this.fetchPosts();
  },
  methods: {
    fetchPosts() {
      const postsCollection = collection(db, "forumPosts");
      const postsQuery = query(postsCollection, orderBy("createdAt", "desc"));
      onSnapshot(
        postsQuery,
        (snapshot) => {
          this.posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.loading = false;
        },
        (error) => {
          this.error = "Failed to load posts: " + error.message;
          this.loading = false;
        }
      );
    },
    openDeleteAlert(post) {
      this.deletePostId = post.id;
      this.deleteMessage = `Are you sure you want to delete the post "${post.title}"?`;
      this.showDeleteAlert = true;
    },
    async confirmDelete() {
      try {
        if (!this.currentUserId) throw new Error("User not authenticated");
        const postRef = doc(db, "forumPosts", this.deletePostId);
        await deleteDoc(postRef);
        this.closeDeleteAlert();
      } catch (error) {
        this.error = "Error deleting post: " + error.message;
        this.closeDeleteAlert();
      }
    },
    closeDeleteAlert() {
      this.showDeleteAlert = false;
      this.deletePostId = null;
      this.deleteMessage = "";
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/views/ForumPage.css";
.loading {
  font-size: 16px;
  color: #2c3e50;
  text-align: center;
  margin: 20px 0;
}
</style>
