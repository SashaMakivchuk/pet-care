<template>
  <div class="gallery-page">
    <h1>My Pet Gallery</h1>
    <router-link to="/home" class="back-link">Back to Home</router-link>
    <div v-if="!isLoggedIn" class="not-logged-in">
      Please <router-link to="/login">log in</router-link> to manage your
      gallery.
    </div>
    <div v-else>
      <div v-if="petsLoading" class="loading">Loading pets...</div>
      <div v-else-if="pets.length === 0" class="no-pets">
        No pets found. Add a pet in
        <router-link to="/create-pet">Create Pet</router-link>.
      </div>
      <div v-else>
        <MediaUploadForm :pets="pets" @media-uploaded="fetchMedia" />
        <h2>Your Gallery</h2>
        <div v-if="loading" class="loading">Loading gallery...</div>
        <div v-else-if="mediaItems.length === 0" class="no-media">
          No media yet. Upload some photos or videos above!
        </div>
        <div v-else class="pet-folders">
          <PetFolder
            v-for="pet in petsWithMedia"
            :key="pet.id"
            :pet="pet"
            @delete="openDeleteAlert"
          />
        </div>
      </div>
      <DeleteAlert
        :is-open="showDeleteAlert"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @cancel="closeDeleteAlert"
      />
    </div>
  </div>
</template>

<script>
import { auth, db, storage } from "@/firebase";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { mapState } from "vuex";
import MediaUploadForm from "@/components/MediaUploadForm.vue";
import PetFolder from "@/components/PetFolder.vue";
import DeleteAlert from "@/components/DeleteAlert.vue";

export default {
  components: { MediaUploadForm, PetFolder, DeleteAlert },
  data() {
    return {
      mediaItems: [],
      error: "",
      loading: true,
      showDeleteAlert: false,
      deleteMediaId: null,
      deleteMessage: "",
      deleteStoragePath: null,
    };
  },
  computed: {
    ...mapState(["pets", "petsLoading", "isLoggedIn"]),
    petsWithMedia() {
      return this.pets
        .map((pet) => ({
          ...pet,
          media: this.mediaItems.filter((media) => media.petId === pet.id),
        }))
        .filter((pet) => pet.media.length > 0);
    },
  },
  created() {
    if (this.isLoggedIn) {
      this.fetchMedia();
      this.$store.dispatch("fetchPets").catch((error) => {
        this.error = "Failed to load pets: " + error.message;
      });
    } else {
      this.loading = false;
    }
  },
  methods: {
    fetchMedia() {
      const user = auth.currentUser;
      if (!user) {
        this.error = "User not authenticated";
        this.loading = false;
        return;
      }
      const galleryCollection = collection(db, `users/${user.uid}/gallery`);
      const galleryQuery = query(galleryCollection);
      onSnapshot(
        galleryQuery,
        (snapshot) => {
          this.mediaItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.loading = false;
        },
        (error) => {
          this.error = "Failed to load gallery: " + error.message;
          this.loading = false;
        }
      );
    },
    openDeleteAlert(media) {
      this.deleteMediaId = media.id;
      this.deleteStoragePath = media.mediaURL;
      this.deleteMessage = `Are you sure you want to delete "${media.fileName}"?`;
      this.showDeleteAlert = true;
    },
    async confirmDelete() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const mediaRef = doc(
          db,
          `users/${user.uid}/gallery`,
          this.deleteMediaId
        );
        await deleteDoc(mediaRef);
        if (this.deleteStoragePath) {
          const pathMatch = this.deleteStoragePath.match(/gallery%2F.*$/);
          if (pathMatch) {
            const storagePath = decodeURIComponent(
              pathMatch[0].replace(/gallery%2F/, "gallery/")
            );
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
          }
        }
        this.closeDeleteAlert();
      } catch (error) {
        this.error = "Error deleting media: " + error.message;
        this.closeDeleteAlert();
      }
    },
    closeDeleteAlert() {
      this.showDeleteAlert = false;
      this.deleteMediaId = null;
      this.deleteMessage = "";
      this.deleteStoragePath = null;
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/views/GalleryPage.css";
</style>
