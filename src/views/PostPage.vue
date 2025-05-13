<template>
  <div class="post-page">
    <h1>{{ post?.title || "Post" }}</h1>
    <router-link to="/forum" class="back-link">Back to Forum</router-link>
    <div v-if="loading" class="loading">Loading post...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!post" class="no-post">Post not found.</div>
    <div v-else>
      <div class="post-item">
        <div class="post-header">
          <span class="post-author">{{ post.userName }}</span>
          <span class="post-date">{{ formatDateTime(post.createdAt) }}</span>
          <button
            v-if="post.userId === currentUserId"
            class="delete-post-button"
            @click="openDeleteAlert(post)"
          >
            Delete
          </button>
        </div>
        <h3>{{ post.title }}</h3>
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
          >
            Like ({{ post.likeCount || 0 }})
          </button>
          <button
            class="dislike-button"
            :class="{ active: userLike === -1 }"
            @click="toggleLike(-1)"
          >
            Dislike
          </button>
          <span class="comment-count"
            >Comments ({{ post.commentCount || 0 }})</span
          >
        </div>
      </div>
      <CommentForm v-if="isLoggedIn" :post-id="$route.params.postId" />
      <div v-if="commentsLoading" class="loading">Loading comments...</div>
      <div v-else-if="comments.length === 0" class="no-comments">
        No comments yet.
      </div>
      <div v-else class="comment-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @delete="openCommentDeleteAlert"
        />
      </div>
      <DeleteAlert
        :is-open="showDeleteAlert"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @cancel="closeDeleteAlert"
      />
      <DeleteAlert
        :is-open="showCommentDeleteAlert"
        :message="commentDeleteMessage"
        @confirm="confirmCommentDelete"
        @cancel="closeCommentDeleteAlert"
      />
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { mapState } from "vuex";
import CommentForm from "@/components/CommentForm.vue";
import CommentItem from "@/components/CommentItem.vue";
import DeleteAlert from "@/components/DeleteAlert.vue";

export default {
  components: { CommentForm, CommentItem, DeleteAlert },
  data() {
    return {
      post: null,
      comments: [],
      userLike: null,
      error: "",
      loading: true,
      commentsLoading: true,
      showDeleteAlert: false,
      showCommentDeleteAlert: false,
      deletePostId: null,
      deleteCommentId: null,
      deleteMessage: "",
      commentDeleteMessage: "",
    };
  },
  computed: {
    ...mapState(["isLoggedIn"]),
    currentUserId() {
      return auth.currentUser?.uid || null;
    },
  },
  created() {
    this.fetchPost();
    this.fetchComments();
    this.fetchUserLike();
  },
  methods: {
    async fetchPost() {
      try {
        const postRef = doc(db, "forumPosts", this.$route.params.postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          this.post = { id: postSnap.id, ...postSnap.data() };
        } else {
          this.error = "Post not found";
        }
        this.loading = false;
      } catch (error) {
        this.error = "Error loading post: " + error.message;
        this.loading = false;
      }
    },
    fetchComments() {
      const commentsCollection = collection(
        db,
        `forumPosts/${this.$route.params.postId}/comments`
      );
      const commentsQuery = query(commentsCollection);
      onSnapshot(
        commentsQuery,
        (snapshot) => {
          this.comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.commentsLoading = false;
          const postRef = doc(db, "forumPosts", this.$route.params.postId);
          updateDoc(postRef, { commentCount: this.comments.length });
        },
        (error) => {
          this.error = "Error loading comments: " + error.message;
          this.commentsLoading = false;
        }
      );
    },
    fetchUserLike() {
      if (!this.currentUserId) return;
      const likeRef = doc(
        db,
        `forumPosts/${this.$route.params.postId}/likes`,
        this.currentUserId
      );
      onSnapshot(likeRef, (doc) => {
        if (doc.exists()) {
          this.userLike = doc.data().value;
        } else {
          this.userLike = null;
        }
      });
    },
    async toggleLike(value) {
      if (!this.currentUserId) return;
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
    },
    openDeleteAlert(post) {
      this.deletePostId = post.id;
      this.deleteMessage = `Are you sure you want to delete the post "${post.title}"?`;
      this.showDeleteAlert = true;
    },
    openCommentDeleteAlert(comment) {
      this.deleteCommentId = comment.id;
      this.commentDeleteMessage = `Are you sure you want to delete your comment?`;
      this.showCommentDeleteAlert = true;
    },
    async confirmDelete() {
      try {
        const postRef = doc(db, "forumPosts", this.deletePostId);
        await deleteDoc(postRef);
        this.closeDeleteAlert();
        this.$router.push("/forum");
      } catch (error) {
        this.error = "Error deleting post: " + error.message;
        this.closeDeleteAlert();
      }
    },
    async confirmCommentDelete() {
      try {
        const commentRef = doc(
          db,
          `forumPosts/${this.$route.params.postId}/comments`,
          this.deleteCommentId
        );
        await deleteDoc(commentRef);
        this.closeCommentDeleteAlert();
      } catch (error) {
        this.error = "Error deleting comment: " + error.message;
        this.closeCommentDeleteAlert();
      }
    },
    closeDeleteAlert() {
      this.showDeleteAlert = false;
      this.deletePostId = null;
      this.deleteMessage = "";
    },
    closeCommentDeleteAlert() {
      this.showCommentDeleteAlert = false;
      this.deleteCommentId = null;
      this.commentDeleteMessage = "";
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
@import "@/assets/styles/views/PostPage.css";
</style>
