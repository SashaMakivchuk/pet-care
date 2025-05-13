import { createStore } from "vuex";
import { auth, db } from "@/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export default createStore({
  state: {
    isLoggedIn: false,
    isAdmin: false,
    authLoaded: false,
    user: null,
    pets: [],
    petsLoading: false,
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setAdmin(state, value) {
      state.isAdmin = value;
    },
    setAuthLoaded(state, value) {
      state.authLoaded = value;
    },
    setUser(state, user) {
      state.user = user;
    },
    setPets(state, pets) {
      state.pets = pets;
    },
    setPetsLoading(state, value) {
      state.petsLoading = value;
    },
  },
  actions: {
    async checkAuth({ commit }) {
      return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            commit("setLoggedIn", true);
            commit("setUser", {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
            });
            user.getIdTokenResult().then((idTokenResult) => {
              commit("setAdmin", !!idTokenResult.claims.isAdmin);
              commit("setAuthLoaded", true);
              resolve();
            });
          } else {
            commit("setLoggedIn", false);
            commit("setUser", null);
            commit("setAdmin", false);
            commit("setAuthLoaded", true);
            resolve();
          }
        });
      });
    },
    async fetchPets({ commit }) {
      const user = auth.currentUser;
      if (!user) {
        commit("setPets", []);
        commit("setPetsLoading", false);
        return;
      }
      commit("setPetsLoading", true);
      const petsCollection = collection(db, `users/${user.uid}/pets`);
      const petsQuery = query(petsCollection);
      onSnapshot(petsQuery, (snapshot) => {
        const pets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        commit("setPets", pets);
        commit("setPetsLoading", false);
      });
    },
  },
});
