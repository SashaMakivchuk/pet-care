<template>
  <div class="upload-form">
    <div class="input-group">
      <label for="pet-select">Select Pet</label>
      <select id="pet-select" v-model="newMedia.petId" required>
        <option value="" disabled>Select a pet</option>
        <option v-for="pet in pets" :key="pet.id" :value="pet.id">
          {{ pet.name }}
        </option>
      </select>
    </div>
    <div class="input-group">
      <label for="media-upload">Photo/Video</label>
      <input
        id="media-upload"
        type="file"
        accept="image/*,video/*"
        @change="handleMediaUpload"
        required
      />
    </div>
    <button
      class="upload-button"
      @click="uploadMedia"
      :disabled="!newMedia.petId || !newMedia.file || uploading"
    >
      {{ uploading ? "Uploading..." : "Upload Media" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { auth, db, storage } from "@/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  props: {
    pets: { type: Array, required: true },
  },
  data() {
    return {
      newMedia: { petId: "", file: null, mediaType: "" },
      error: "",
      uploading: false,
    };
  },
  methods: {
    handleMediaUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newMedia.file = file;
        this.newMedia.mediaType = file.type.startsWith("image/")
          ? "photo"
          : "video";
      } else {
        this.newMedia.file = null;
        this.newMedia.mediaType = "";
      }
    },
    async uploadMedia() {
      if (!this.newMedia.petId || !this.newMedia.file) {
        this.error = "Please select a pet and a file.";
        return;
      }
      this.uploading = true;
      this.error = "";
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const petRef = doc(db, `users/${user.uid}/pets`, this.newMedia.petId);
        const petSnap = await getDoc(petRef);
        if (!petSnap.exists()) {
          throw new Error(`Invalid pet ID: ${this.newMedia.petId}`);
        }

        const mediaId = Date.now().toString();
        const fileName = this.newMedia.file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );
        const storagePath = `gallery/${user.uid}/${this.newMedia.petId}/${mediaId}_${fileName}`;

        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, this.newMedia.file);
        const mediaURL = await getDownloadURL(snapshot.ref);

        const galleryCollection = collection(db, `users/${user.uid}/gallery`);
        await addDoc(galleryCollection, {
          petId: this.newMedia.petId,
          fileName,
          mediaURL,
          mediaType: this.newMedia.mediaType,
          uploadedAt: new Date(),
        });

        this.newMedia = { petId: "", file: null, mediaType: "" };
        this.$emit("media-uploaded");
      } catch (error) {
        this.error = `Error uploading media: ${error.message}`;
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/components/MediaUploadForm.css";
</style>
