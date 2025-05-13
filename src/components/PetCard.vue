<template>
  <div class="pet-card">
    <div class="card-content">
      <div class="card-image">
        <img v-if="pet.photoURL" :src="pet.photoURL" alt="Pet Photo" />
      </div>
      <div class="text-content">
        <h2>{{ pet.name }}</h2>
        <div class="pet-details-grid">
          <p><strong>Age:</strong> {{ pet.age }}</p>
          <p><strong>Species/Breed:</strong> {{ pet.species || "N/A" }}</p>
          <p><strong>Gender:</strong> {{ pet.gender || "N/A" }}</p>
          <p><strong>Size:</strong> {{ pet.size || "N/A" }}</p>
          <p><strong>Microchip/ID:</strong> {{ pet.microchip || "N/A" }}</p>
          <p><strong>Neutered:</strong> {{ pet.neutered ? "Yes" : "No" }}</p>
        </div>
        <p class="description">
          <strong>Description:</strong> {{ pet.description || "N/A" }}
        </p>
        <div v-if="pet.documents && pet.documents.length">
          <strong>Documents:</strong>
          <ul>
            <li v-for="doc in pet.documents" :key="doc.name">
              <a :href="doc.url" target="_blank">{{ doc.name }}</a>
            </li>
          </ul>
        </div>
        <div class="actions">
          <router-link :to="`/edit-pet/${pet.id}`">Edit</router-link>
          <button @click="deletePet">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default {
  props: {
    pet: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async deletePet() {
      if (!confirm(`Are you sure you want to delete ${this.pet.name}?`)) return;
      try {
        const user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid, "pets", this.pet.id));
        this.$emit("delete", this.pet.id);
      } catch (error) {
        alert("Error deleting pet: " + error.message);
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/PetCard.css";
</style>
