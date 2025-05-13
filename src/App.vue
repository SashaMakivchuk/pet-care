<template>
  <div id="app">
    <header class="header">
      <nav class="navbar">
        <div class="navbar-content">
          <router-link to="/" class="logo-link">
            <h2 class="logo">Pet Care</h2>
          </router-link>
          <input type="checkbox" id="menu-toggle" />
          <label for="menu-toggle" id="hamburger-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </label>
          <div class="links">
            <router-link to="/about">About</router-link>
            <router-link v-if="isLoggedIn" to="/home">Home</router-link>
            <router-link v-if="isLoggedIn" to="/gallery">Gallery</router-link>
            <router-link to="/forum">Forum</router-link>
            <a v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
          </div>
          <div class="buttons">
            <router-link v-if="!isLoggedIn" to="/login" class="signin"
              >Sign In</router-link
            >
            <router-link v-if="!isLoggedIn" to="/register" class="signup"
              >Sign Up</router-link
            >
          </div>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

export default {
  computed: {
    ...mapState(["isLoggedIn", "isAdmin"]),
  },
  methods: {
    ...mapActions(["checkAuth"]),
    async logout() {
        await signOut(auth);
        this.$router.push("/login");
  },
  created() {
    this.checkAuth();
  },
},
};
</script>

<style scoped>
@import "@/assets/styles/global.css";

#app {
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

main {
  flex-grow: 1;
}
</style>
