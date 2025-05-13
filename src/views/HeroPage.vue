<template>
  <main class="hero-section">
    <div class="hero">
      <h2>Welcome to Pet Care</h2>
      <p>
        Your one-stop solution for all your pet care needs. Join our community
        of pet lovers and share your experiences. Whether you have a dog, cat,
        or any other pet, we have something for you! From pet care tips to
        community forums, we are here to help you. Join us today and be a part
        of our pet-loving family! Explore our features and connect with other
        pet owners. We are excited to have you here!
      </p>
      <div class="buttons">
        <router-link to="/register" class="join">Join now</router-link>
        <router-link to="/about" class="learn">About us</router-link>
      </div>
    </div>
    <div class="img">
      <img :src="logo" alt="Pet Care Logo" />
    </div>
  </main>
</template>

<script>
import logo from "@/assets/logo2.png";

export default {
  name: "AboutPage",
  data() {
    return {
      logo,
    };
  },
};
</script>

<style scoped>
@import "@/assets/styles/views/HeroPage.css";
</style>
