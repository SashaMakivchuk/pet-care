<template>
  <div class="login-form">
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" :disabled="loading" class="submit-button">
        <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Login
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p>
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </p>
    </form>
  </div>
</template>

<script>
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false,
    };
  },
  methods: {
    async login() {
      this.error = "";
      this.loading = true;
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push("/home");
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(code) {
      switch (code) {
        case "auth/wrong-password":
          return "Incorrect password. Please try again.";
        case "auth/user-not-found":
          return "No account found with this email.";
        case "auth/invalid-email":
          return "Invalid email format.";
        case "auth/too-many-requests":
          return "Too many attempts. Please try again later.";
        default:
          return "An error occurred. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/LoginComponent.css";
</style>
