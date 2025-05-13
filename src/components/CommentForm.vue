<template>
  <div class="comment-form">
    <div class="input-group">
      <label for="comment-content">Add a Comment</label>
      <textarea
        id="comment-content"
        v-model="commentContent"
        placeholder="Write your comment..."
        rows="3"
      ></textarea>
    </div>
    <button
      class="submit-comment-button"
      @click="submitComment"
      :disabled="!commentContent.trim() || submitting"
    >
      {{ submitting ? "Submitting..." : "Post Comment" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export default {
  props: {
    postId: { type: String, required: true },
  },
  data() {
    return {
      commentContent: "",
      error: "",
      submitting: false,
    };
  },
  methods: {
    async submitComment() {
      if (!this.commentContent.trim()) return;
      this.submitting = true;
      this.error = "";
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("not authenticated");
        const commentsCollection = collection(
          db,
          `forumPosts/${this.postId}/comments`
        );
        await addDoc(commentsCollection, {
          content: this.commentContent.trim(),
          userId: user.uid,
          userName: user.displayName || user.email.split("@")[0],
          createdAt: new Date(),
        });
        this.commentContent = "";
        this.submitting = false;
      } catch (error) {
        this.error = "Error posting comment: " + error.message;
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.comment-form {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  font-family: "Open Sans", sans-serif;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.input-group label {
  font-size: 19px;
  font-weight: 600;
  color: #fff;
}

.input-group textarea {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #330c43;
  font-size: 18px;
  font-family: "Open Sans", sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: 0.2s ease;
}

.input-group textarea:focus {
  outline: none;
  border: 2px solid #47b2e4;
  background: #fff;
}

.submit-comment-button {
  padding: 8px 16px;
  background-color: #47b2e4;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.submit-comment-button:hover {
  background-color: #3391c3;
}

.submit-comment-button:disabled {
  background-color: #c9c7c7;
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  font-size: 18px;
  color: #ff9999;
  background: rgba(255, 0, 0, 0.2);
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  margin-top: 10px;
}

@media screen and (max-width: 767px) {
  .comment-form {
    padding: 12px;
    max-width: 100%;
    margin: 15px auto;
  }

  .input-group {
    margin-bottom: 10px;
    gap: 6px;
  }

  .input-group label {
    font-size: 18px;
  }

  .input-group textarea {
    padding: 8px;
    font-size: 16px;
    min-height: 70px;
  }

  .submit-comment-button {
    padding: 6px 12px;
    font-size: 14px;
  }

  .error {
    font-size: 16px;
    padding: 8px;
  }
}
</style>
