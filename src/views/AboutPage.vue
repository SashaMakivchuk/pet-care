<template>
  <div class="about-page">
    <h1>About Pet Care</h1>
    <section class="about-section intro">
      <h2>Welcome to Pet Care</h2>
      <p>
        Pet Care is your all-in-one app for managing your pets’ needs and
        connecting with a vibrant pet-loving community. Whether you’re tracking
        daily tasks, sharing tips in our forum, or storing precious pet
        memories, we make pet care simple, secure, and social.
      </p>
    </section>
    <section class="about-section features">
      <h2>Key Features</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <i class="fas fa-paw" aria-hidden="true"></i>
          <h3>Pet Management</h3>
          <p>
            Add and manage your pets’ profiles, including health records and
            special needs.
          </p>
        </div>
        <div class="feature-card">
          <i class="fas fa-tasks" aria-hidden="true"></i>
          <h3>Task Tracking</h3>
          <p>
            Schedule and track feeding, grooming, vet visits, and more with
            ease.
          </p>
        </div>
        <div class="feature-card">
          <i class="fas fa-users" aria-hidden="true"></i>
          <h3>Community Forum</h3>
          <p>Share photos, videos, and advice with pet other owners.</p>
        </div>
      </div>
    </section>
    <section class="about-section cta">
      <h2>Join the Pet Care Community</h2>
      <p>
        Ready to simplify pet care and connect with others? Sign up today or
        explore our forum to see what our community is sharing!
      </p>
      <div class="cta-buttons">
        <router-link to="/register" class="join-button">
          <i class="fas fa-user-plus" aria-hidden="true"></i> Register
        </router-link>
        <router-link to="/forum" class="forum-button">
          <i class="fas fa-users" aria-hidden="true"></i> Visit Forum
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style scoped>
@import "@/assets/styles/views/AboutPage.css";
</style>
