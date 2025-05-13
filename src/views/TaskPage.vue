<template>
  <div class="task-page">
    <h1>Tasks for Pet</h1>
    <router-link to="/home" class="back-link">Back to Home</router-link>
    <div v-if="loading" class="loading">Loading tasks...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="task-input">
        <div class="input-group">
          <label for="task-name">Task Name</label>
          <input
            id="task-name"
            v-model="newTask.task"
            placeholder="e.g., Feed Max"
            @keyup.enter="addTask"
          />
        </div>
        <div class="input-group">
          <label for="task-priority">Priority</label>
          <select id="task-priority" v-model="newTask.priority">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div class="input-group">
          <label for="task-description">Description</label>
          <textarea
            id="task-description"
            v-model="newTask.description"
            placeholder="Task description"
            rows="2"
          ></textarea>
        </div>
        <div class="input-group">
          <label for="task-due-date">Due Date</label>
          <input id="task-due-date" v-model="newTask.dueDate" type="date" />
        </div>
        <div class="input-group">
          <label for="task-due-time">Due Time</label>
          <input id="task-due-time" v-model="newTask.dueTime" type="time" />
        </div>
        <button
          class="add-task-button"
          @click="addTask"
          :disabled="!newTask.task.trim()"
        >
          Add Task
        </button>
      </div>
      <h2>Task List</h2>
      <ul class="task-list" v-if="tasks.length">
        <li
          v-for="task in tasks"
          :key="task.id"
          :class="{
            'priority-high': task.priority === 'High',
            'priority-medium': task.priority === 'Medium',
            'priority-low': task.priority === 'Low',
            completed: task.completed,
          }"
        >
          <div v-if="editingTaskId !== task.id">
            <div class="task-details">
              <strong>{{ task.task }}</strong> ({{ task.priority }})
              <span v-if="task.dueDateTime">
                - Due: {{ formatDateTime(task.dueDateTime) }}</span
              >
              <span v-if="task.completed"> (Done)</span>
              <p v-if="task.description" class="task-description">
                {{ task.description }}
              </p>
            </div>
            <div class="task-actions">
              <button class="edit-task-button" @click="startEditing(task)">
                Edit
              </button>
              <button class="done-task-button" @click="toggleDone(task)">
                {{ task.completed ? "Undo" : "Done" }}
              </button>
              <button class="delete-task-button" @click="openDeleteAlert(task)">
                Delete
              </button>
            </div>
          </div>
          <div v-else class="edit-form">
            <div class="input-group">
              <label for="edit-task-name">Task Name</label>
              <input
                id="edit-task-name"
                v-model="editingTask.task"
                placeholder="Task name"
              />
            </div>
            <div class="input-group">
              <label for="edit-task-priority">Priority</label>
              <select id="edit-task-priority" v-model="editingTask.priority">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="input-group">
              <label for="edit-task-description">Description</label>
              <textarea
                id="edit-task-description"
                v-model="editingTask.description"
                placeholder="Description"
                rows="2"
              ></textarea>
            </div>
            <div class="input-group">
              <label for="edit-task-due-date">Due Date</label>
              <input
                id="edit-task-due-date"
                v-model="editingTask.dueDate"
                type="date"
              />
            </div>
            <div class="input-group">
              <label for="edit-task-due-time">Due Time</label>
              <input
                id="edit-task-due-time"
                v-model="editingTask.dueTime"
                type="time"
              />
            </div>
            <button
              class="save-task-button"
              @click="saveTask"
              :disabled="!editingTask.task.trim()"
            >
              Save
            </button>
            <button class="cancel-task-button" @click="cancelEditing">
              Cancel
            </button>
          </div>
        </li>
      </ul>
      <p v-else class="no-tasks">No tasks yet. Add one above!</p>
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
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import DeleteAlert from "@/components/DeleteAlert.vue";

export default {
  components: { DeleteAlert },
  data() {
    return {
      tasks: [],
      newTask: {
        task: "",
        priority: "Medium",
        description: "",
        dueDate: "",
        dueTime: "",
      },
      editingTaskId: null,
      editingTask: {
        task: "",
        priority: "",
        description: "",
        dueDate: "",
        dueTime: "",
      },
      error: "",
      loading: true,
      showDeleteAlert: false,
      deleteTaskId: null,
      deleteMessage: "",
    };
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    fetchTasks() {
      const user = auth.currentUser;
      const petId = this.$route.params.petId;
      if (!user) {
        this.error = "User not authenticated";
        this.loading = false;
        return;
      }
      if (!petId) {
        this.error = "Invalid pet ID";
        this.loading = false;
        return;
      }
      const tasksCollection = collection(
        db,
        `users/${user.uid}/pets/${petId}/tasks`
      );
      const tasksQuery = query(tasksCollection);
      onSnapshot(
        tasksQuery,
        (snapshot) => {
          this.tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.loading = false;
        },
        (error) => {
          this.error = "Failed to load tasks: " + error.message;
          this.loading = false;
        }
      );
    },
    async addTask() {
      if (!this.newTask.task.trim()) return;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petId = this.$route.params.petId;
        const tasksCollection = collection(
          db,
          `users/${user.uid}/pets/${petId}/tasks`
        );
        const dueDateTime = this.combineDateTime(
          this.newTask.dueDate,
          this.newTask.dueTime
        );
        await addDoc(tasksCollection, {
          task: this.newTask.task.trim(),
          priority: this.newTask.priority,
          description: this.newTask.description.trim(),
          dueDateTime: dueDateTime ? dueDateTime : null,
          completed: false,
          createdAt: new Date(),
        });
        this.newTask = {
          task: "",
          priority: "Medium",
          description: "",
          dueDate: "",
          dueTime: "",
        };
      } catch (error) {
        this.error = "Error adding task: " + error.message;
      }
    },
    async toggleDone(task) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petId = this.$route.params.petId;
        const taskRef = doc(
          db,
          `users/${user.uid}/pets/${petId}/tasks`,
          task.id
        );
        await updateDoc(taskRef, { completed: !task.completed });
      } catch (error) {
        this.error = "Error updating task status: " + error.message;
      }
    },
    openDeleteAlert(task) {
      this.deleteTaskId = task.id;
      this.deleteMessage = `Are you sure you want to delete the task "${task.task}"?`;
      this.showDeleteAlert = true;
    },
    async confirmDelete() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petId = this.$route.params.petId;
        const taskRef = doc(
          db,
          `users/${user.uid}/pets/${petId}/tasks`,
          this.deleteTaskId
        );
        await deleteDoc(taskRef);
        this.closeDeleteAlert();
      } catch (error) {
        this.error = "Error deleting task: " + error.message;
        this.closeDeleteAlert();
      }
    },
    closeDeleteAlert() {
      this.showDeleteAlert = false;
      this.deleteTaskId = null;
      this.deleteMessage = "";
    },
    startEditing(task) {
      this.editingTaskId = task.id;
      const due = task.dueDateTime ? task.dueDateTime.toDate() : null;
      this.editingTask = {
        task: task.task,
        priority: task.priority,
        description: task.description || "",
        dueDate: due ? due.toISOString().split("T")[0] : "",
        dueTime: due ? due.toTimeString().slice(0, 5) : "",
      };
    },
    async saveTask() {
      if (!this.editingTask.task.trim()) return;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const petId = this.$route.params.petId;
        const taskRef = doc(
          db,
          `users/${user.uid}/pets/${petId}/tasks`,
          this.editingTaskId
        );
        const dueDateTime = this.combineDateTime(
          this.editingTask.dueDate,
          this.editingTask.dueTime
        );
        await updateDoc(taskRef, {
          task: this.editingTask.task.trim(),
          priority: this.editingTask.priority,
          description: this.editingTask.description.trim(),
          dueDateTime: dueDateTime ? dueDateTime : null,
        });
        this.editingTaskId = null;
        this.editingTask = {
          task: "",
          priority: "",
          description: "",
          dueDate: "",
          dueTime: "",
        };
      } catch (error) {
        this.error = "Error saving task: " + error.message;
      }
    },
    cancelEditing() {
      this.editingTaskId = null;
      this.editingTask = {
        task: "",
        priority: "",
        description: "",
        dueDate: "",
        dueTime: "",
      };
    },
    combineDateTime(date, time) {
      if (!date || !time) return null;
      const dateTimeString = `${date}T${time}:00`;
      return new Date(dateTimeString);
    },
    formatDateTime(timestamp) {
      if (!timestamp) return "";
      const date = timestamp.toDate();
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/views/TaskPage.css";
</style>
