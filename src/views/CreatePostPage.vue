<template>
  <div class="create-post-page">
    <h1>Create a New Post</h1>
    <router-link to="/forum" class="back-link">Back to Forum</router-link>
    <div v-if="error" class="error">{{ error }}</div>
    <PostForm :is-logged-in="isLoggedIn" @submit="createPost" />
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { mapState } from "vuex";
import PostForm from "@/components/PostForm.vue";

export default {
  components: { PostForm },
  data() {
    return {
      error: "",
    };
  },
  computed: {
    ...mapState(["isLoggedIn"]),
  },
  methods: {
    async createPost(post) {
      try {
        if (!this.isLoggedIn || !auth.currentUser) {
          throw new Error("User not authenticated");
        }
        const postsCollection = collection(db, "forumPosts");
        await addDoc(postsCollection, {
          ...post,
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || "Anonymous",
          createdAt: new Date(),
          likeCount: 0,
          commentCount: 0,
        });
        this.$router.push("/forum");
      } catch (error) {
        this.error = "Error creating post: " + error.message;
      }
    },
  },
};
</script>

<style scoped>
.create-post-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px 20px;
  font-family: "Open Sans", sans-serif;
  color: #fff;
}

.create-post-page h1 {
  font-size: 3rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
  text-align: left;
}

.back-link {
  display: inline-block;
  font-size: 1.2rem;
  color: #47b2e4;
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: 600;
  transition: 0.2s ease;
}

.back-link:hover {
  color: #3391c3;
  text-decoration: underline;
}

.error {
  font-size: 1.6rem;
  text-align: center;
  padding: 20px;
  border-radius: 0.375rem;
  color: #ff9999;
  background: rgba(255, 0, 0, 0.2);
  margin: 20px 0;
}

@media screen and (max-width: 767px) {
  .create-post-page {
    padding: 70px 15px 15px;
  }

  .create-post-page h1 {
    font-size: 2rem;
  }

  .back-link {
    font-size: 1rem;
    margin-bottom: 15px;
  }

  .error {
    font-size: 1.2rem;
    padding: 15px;
    margin: 15px 0;
  }
}
</style>
