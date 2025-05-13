<template>
  <div v-if="isOpen" class="delete-alert-backdrop">
    <div class="delete-alert">
      <h3>Confirm Deletion</h3>
      <p>{{ message }}</p>
      <div class="alert-actions">
        <button class="confirm-button" @click="confirm">Confirm</button>
        <button class="cancel-button" @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "Are you sure you want to delete this item?",
    },
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped>
.delete-alert-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.delete-alert {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}
h3 {
  color: #2c3e50;
  font-size: 20px;
  margin-bottom: 10px;
}
p {
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 20px;
}
.alert-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.confirm-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.confirm-button {
  background-color: #007bff;
  color: white;
}
.confirm-button:hover {
  background-color: #0056b3;
}
.cancel-button {
  background-color: #dc3545;
  color: white;
}
.cancel-button:hover {
  background-color: #c82333;
}
</style>
