<template>
  <div class="register-page">
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label for="name">Username</label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Enter your username"
          required
          @input="validateName"
        />
        <p v-if="nameError" class="error">{{ nameError }}</p>
      </div>
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
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          required
        />
      </div>
      <button
        type="submit"
        class="submit-button"
        :disabled="loading || nameError"
      >
        <i class="fas fa-user-plus" aria-hidden="true"></i>
        {{ loading ? "Registering..." : "Register" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p>
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </form>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      error: "",
      nameError: "",
      loading: false,
    };
  },
  methods: {
    async validateName() {
      this.nameError = "";
      const trimmedName = this.name.trim();
      if (trimmedName.length < 3) {
        this.nameError = "Username must be at least 3 characters.";
        return;
      }
      if (trimmedName.length > 20) {
        this.nameError = "Username cannot exceed 20 characters.";
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
        this.nameError =
          "Username can only contain letters, numbers, and underscores.";
        return;
      }
      try {
        const q = query(
          collection(db, "users"),
          where("name", "==", trimmedName)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          this.nameError = "This username is already taken.";
        }
      } catch (error) {
        console.error("Username check error:", error);
      }
    },
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match!";
        return;
      }
      if (this.nameError) {
        this.error = "Please fix username errors.";
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const user = userCredential.user;
        const trimmedName = this.name.trim();
        await updateProfile(user, {
          displayName: trimmedName,
        });
        await setDoc(doc(db, "users", user.uid), {
          name: trimmedName,
          email: this.email,
          isAdmin: false,
          createdAt: new Date(),
        });
        this.$router.push("/home");
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(code) {
      switch (code) {
        case "auth/email-already-in-use":
          return "This email is already registered.";
        case "auth/invalid-email":
          return "Invalid email format.";
        case "auth/weak-password":
          return "Password must be at least 6 characters.";
        default:
          return "An error occurred. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/RegisterComponent.css";
</style>
