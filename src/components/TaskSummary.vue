<template>
  <div class="task-summary">
    <h3>Tasks for {{ petName }}</h3>
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
        <router-link
          :to="`/tasks/${petId}/${task.id}`"
          class="task-box"
          :aria-label="`Toggle task ${task.task} status`"
          @click.prevent="toggleDone(task)"
        >
          <div class="task-content">
            {{ task.task }} ({{ task.priority }})
            <span v-if="task.dueDateTime">
              - Due: {{ formatDateTime(task.dueDateTime) }}</span
            >
            <span v-if="task.completed"> (Done)</span>
          </div>
        </router-link>
      </li>
    </ul>
    <p v-else class="no-tasks">No tasks yet.</p>
    <router-link
      :to="`/tasks/${petId}`"
      class="view-all-tasks"
      @click="logNavigation"
      >View All Tasks</router-link
    >
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default {
  props: {
    petId: { type: String, required: true },
    petName: { type: String, required: true },
  },
  data() {
    return {
      tasks: [],
    };
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    fetchTasks() {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      if (!this.petId) {
        return;
      }
      const tasksCollection = collection(
        db,
        `users/${user.uid}/pets/${this.petId}/tasks`
      );
      const tasksQuery = query(tasksCollection);
      onSnapshot(tasksQuery, (snapshot) => {
        this.tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },
    async toggleDone(task) {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const taskRef = doc(
        db,
        `users/${user.uid}/pets/${this.petId}/tasks`,
        task.id
      );
      await updateDoc(taskRef, { completed: !task.completed });
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
    logNavigation() {
      console.log("Navigating to /tasks/" + this.petId);
    },
  },
};
</script>
<style scoped>
@import "@/assets/styles/components/TaskSummary.css";
</style>
