<template>
  <div class="pet-form">
    <h1>{{ petId ? "Edit Pet" : "Create Pet" }}</h1>
    <form @submit.prevent="savePet">
      <div class="form-group">
        <label for="name">Pet Name</label>
        <input
          id="name"
          v-model="pet.name"
          placeholder="Enter pet name"
          required
        />
      </div>
      <div class="form-group">
        <label for="age">Age</label>
        <input
          id="age"
          v-model.number="pet.age"
          type="number"
          placeholder="Enter age"
          required
        />
      </div>
      <div class="form-group">
        <label for="species">Species/Breed</label>
        <input
          id="species"
          v-model="pet.species"
          placeholder="e.g., Dog - Labrador"
        />
      </div>
      <div class="form-group">
        <label for="gender">Gender</label>
        <select id="gender" v-model="pet.gender">
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <div class="form-group">
        <label for="size">Size</label>
        <input
          id="size"
          v-model="pet.size"
          placeholder="e.g., Small, Medium, Large"
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="pet.description"
          placeholder="Short description"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="microchip">ID Tag/Microchip Number</label>
        <input
          id="microchip"
          v-model="pet.microchip"
          placeholder="Enter ID or microchip number"
        />
      </div>
      <div class="form-group">
        <label>
          Neutered
          <input v-model="pet.neutered" type="checkbox" />
        </label>
      </div>
      <div class="form-group">
        <label for="photo">Photo (optional)</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          @change="handlePhotoUpload"
        />
      </div>
      <div class="form-group">
        <label for="documents">Documents (optional)</label>
        <input
          id="documents"
          type="file"
          multiple
          accept=".pdf,.jpg,.png"
          @change="handleDocsUpload"
        />
      </div>
      <button type="submit" :disabled="loading" class="submit-button">
        {{ petId ? "Update Pet" : "Create Pet" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { auth, db, storage } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  props: ["petId"],
  data() {
    return {
      pet: {
        name: "",
        age: "",
        species: "",
        gender: "",
        size: "",
        description: "",
        microchip: "",
        neutered: false,
        photo: null,
        documents: [],
        photoURL: "",
        createdAt: null,
      },
      error: "",
      loading: false,
    };
  },
  async created() {
    if (this.petId) {
      await this.loadPet();
    }
  },
  methods: {
    async loadPet() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petRef = doc(db, "users", user.uid, "pets", this.petId);
        const petDoc = await getDoc(petRef);
        if (petDoc.exists()) {
          this.pet = {
            ...petDoc.data(),
            documents: petDoc.data().documents || [],
            photo: null,
            createdAt: petDoc.data().createdAt || null,
          };
        } else {
          this.error = "Pet not found.";
        }
      } catch (error) {
        this.error = "Error loading pet: " + error.message;
      }
    },
    handlePhotoUpload(event) {
      this.pet.photo = event.target.files[0];
    },
    handleDocsUpload(event) {
      this.pet.documents = Array.from(event.target.files);
    },
    async savePet() {
      this.error = "";
      this.loading = true;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petId = this.petId || Date.now().toString();
        const petRef = doc(db, "users", user.uid, "pets", petId);

        let photoURL = this.pet.photoURL || "";
        if (this.pet.photo) {
          const photoRef = ref(
            storage,
            `users/${user.uid}/pets/${petId}/photo`
          );
          await uploadBytes(photoRef, this.pet.photo);
          photoURL = await getDownloadURL(photoRef);
        }

        const docURLs = await Promise.all(
          this.pet.documents.map(async (doc) => {
            const docRef = ref(
              storage,
              `users/${user.uid}/pets/${petId}/docs/${doc.name}`
            );
            await uploadBytes(docRef, doc);
            return { name: doc.name, url: await getDownloadURL(docRef) };
          })
        );

        await setDoc(petRef, {
          name: this.pet.name,
          age: this.pet.age,
          species: this.pet.species,
          gender: this.pet.gender,
          size: this.pet.size,
          description: this.pet.description,
          microchip: this.pet.microchip,
          neutered: this.pet.neutered,
          photoURL,
          documents: docURLs,
          ownerId: user.uid,
          createdAt: this.pet.createdAt || new Date(),
        });

        this.$router.push("/home");
      } catch (error) {
        this.error = "Error saving pet: " + error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/PetForm.css";
</style>
