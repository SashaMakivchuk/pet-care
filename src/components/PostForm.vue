<template>
  <div class="post-form">
    <div class="input-group">
      <label for="post-title">Post Title</label>
      <input
        id="post-title"
        v-model="postData.title"
        placeholder="e.g., My Dog's New Trick"
      />
    </div>
    <div class="input-group">
      <label for="post-content">Content</label>
      <textarea
        id="post-content"
        v-model="postData.content"
        placeholder="Share your question or story..."
        rows="4"
      ></textarea>
    </div>
    <div class="input-group">
      <label for="post-media">Photo/Video (optional)</label>
      <input
        id="post-media"
        type="file"
        accept="image/*,video/*"
        @change="handleMediaUpload"
      />
    </div>
    <button
      class="submit-post-button"
      @click="submitPost"
      :disabled="
        !postData.title.trim() || !postData.content.trim() || uploading
      "
    >
      {{ uploading ? "Uploading..." : "Share Post" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { auth, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  props: {
    isLoggedIn: { type: Boolean, required: true },
  },
  data() {
    return {
      postData: { title: "", content: "", media: null, mediaType: "" },
      error: "",
      uploading: false,
    };
  },
  methods: {
    handleMediaUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.postData.media = file;
        this.postData.mediaType = file.type.startsWith("image/")
          ? "photo"
          : "video";
      } else {
        this.postData.media = null;
        this.postData.mediaType = "";
      }
    },
    async submitPost() {
      if (!this.postData.title.trim() || !this.postData.content.trim()) return;
      this.uploading = true;
      this.error = "";
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        let mediaURL = "";
        if (this.postData.media) {
          const storageRef = ref(
            storage,
            `forumMedia/${Date.now()}_${this.postData.media.name}`
          );
          const snapshot = await uploadBytes(storageRef, this.postData.media);
          mediaURL = await getDownloadURL(snapshot.ref);
        }
        const post = {
          title: this.postData.title.trim(),
          content: this.postData.content.trim(),
          mediaURL,
          mediaType: this.postData.mediaType,
          userId: user.uid,
          userName: user.displayName || user.email.split("@")[0],
          createdAt: new Date(),
          likeCount: 0,
          commentCount: 0,
        };
        this.$emit("submit", post);
        this.postData = { title: "", content: "", media: null, mediaType: "" };
        this.uploading = false;
      } catch (error) {
        this.error = "Error creating post: " + error.message;
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/PostForm.css";
</style>
