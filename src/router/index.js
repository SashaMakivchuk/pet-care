import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import Home from "@/views/HomeView.vue";
import PetFormPage from "@/views/PetFormPage.vue";
import HeroPage from "@/views/HeroPage.vue";
import TaskPage from "@/views/TaskPage.vue";
import ForumPage from "@/views/ForumPage.vue";
import PostPage from "@/views/PostPage.vue";
import CreatePostPage from "@/views/CreatePostPage.vue";
import AboutPage from "@/views/AboutPage.vue";
import GalleryPage from "@/views/GalleryPage.vue";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const routes = [
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/home", component: Home, meta: { requiresAuth: true } },
  { path: "/create-pet", component: PetFormPage, meta: { requiresAuth: true } },
  {
    path: "/edit-pet/:id",
    component: PetFormPage,
    meta: { requiresAuth: true },
  },
  { path: "/forum/:postId", component: PostPage },
  { path: "/tasks/:petId", component: TaskPage, meta: { requiresAuth: true } },
  { path: "/forum", component: ForumPage },
  { path: "/", component: HeroPage },
  {
    path: "/create-post",
    component: CreatePostPage,
    meta: { requiresAuth: true },
  },
  { path: "/about", component: AboutPage },
  { path: "/gallery", component: GalleryPage, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;
  if (to.meta.requiresAuth && !user) {
    next("/login");
  } else if (to.path.startsWith("/tasks/")) {
    const petId = to.params.petId;
    if (user && petId) {
      try {
        const petRef = doc(db, `users/${user.uid}/pets`, petId);
        const petSnap = await getDoc(petRef);
        if (!petSnap.exists()) {
          next("/home");
        } else {
          next();
        }
      } catch (error) {
        next("/home");
      }
    } else {
      next("/home");
    }
  } else {
    next();
  }
});

export default router;
