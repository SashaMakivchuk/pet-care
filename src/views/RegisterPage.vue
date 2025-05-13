<template>
  <div class="register-page">
    <h1>Register to Pet Care</h1>
    <Register />
  </div>
</template>
<script>
import Register from "@/components/RegisterComponent.vue";
export default {
  components: { Register },
};
</script>
<style scoped>
.register-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px 20px;
  font-family: "Open Sans", sans-serif;
  color: #fff;
}

.register-page h1 {
  font-size: 3rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
  text-align: left;
}

@media screen and (max-width: 767px) {
  .register-page {
    padding: 70px 15px 15px;
  }

  .register-page h1 {
    font-size: 2rem;
  }
}
</style>
