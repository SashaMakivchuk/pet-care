<template>
  <div class="home-page">
    <header class="page-header">
      <h1>My Pets</h1>
    </header>
    <main class="page-content">
      <div v-if="petsLoading" class="loading">Loading pets...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="pets.length === 0" class="no-pets">
        No pets found. Add a
        <router-link to="/create-pet">new pet </router-link> to get started!
      </div>
      <div v-else class="pet-list">
        <div class="pet-cards-box">
          <h2>Pets</h2>
          <div class="pet-cards">
            <router-link
              v-for="pet in pets"
              :key="pet.id"
              :to="`/edit-pet/${pet.id}`"
              class="pet-card-wrapper"
            >
              <PetCard
                :pet="pet"
                @delete="handlePetDeleted"
                @error="handleError"
              />
            </router-link>
            <router-link
              to="/create-pet"
              class="add-pet-button"
              aria-label="Add new pet"
            >
              <i class="fas fa-plus" aria-hidden="true"></i>
            </router-link>
          </div>
        </div>
        <div class="tasks-box">
          <h2>Tasks</h2>
          <div class="tasks-list">
            <TaskSummary
              v-for="pet in pets"
              :key="pet.id"
              :petId="pet.id"
              :petName="pet.name"
            />
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="logout-button" @click="logout">
          <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import PetCard from "@/components/PetCard.vue";
import TaskSummary from "@/components/TaskSummary.vue";

export default {
  components: { PetCard, TaskSummary },
  data() {
    return {
      error: "",
    };
  },
  computed: {
    ...mapState(["pets", "petsLoading"]),
  },
  created() {
    this.checkAuth().then(() => {
      this.fetchPets().catch((error) => {
        this.error = "Failed to load pets: " + error.message;
      });
    });
  },
  methods: {
    ...mapActions(["checkAuth", "fetchPets"]),
    handlePetDeleted(petId) {
      this.$store.commit(
        "setPets",
        this.pets.filter((pet) => pet.id !== petId)
      );
    },
    handleError(errorMsg) {
      this.error = errorMsg;
    },
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit("setLoggedIn", false);
        this.$store.commit("setAdmin", false);
        this.$store.commit("setPets", []);
        this.$router.push("/login");
      } catch (error) {
        this.error = "Failed to log out: " + error.message;
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/views/HomeView.css";
</style>
