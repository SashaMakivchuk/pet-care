<template>
  <div class="login-page">
    <h1>Login to Pet Care</h1>
    <Login />
  </div>
</template>

<script>
import Login from "@/components/LoginComponent.vue";

export default {
  components: { Login },
};
</script>

<style scoped>
.login-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px 20px;
  font-family: "Open Sans", sans-serif;
  color: #fff;
}

.login-page h1 {
  font-size: 3rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
  text-align: left;
}

@media screen and (max-width: 767px) {
  .login-page {
    padding: 70px 15px 15px;
  }

  .login-page h1 {
    font-size: 2rem;
  }
}
</style>
