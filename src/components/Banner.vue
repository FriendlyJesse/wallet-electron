<template>
  <section class="banner">
    <slot></slot>
  </section>
</template>

<script>

export default {
  name: 'Banner',
  data() {
    return {
      
    }
  }
}
</script>

<style lang="scss" scoped>
.banner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  background: linear-gradient(to right, #302b61, #58559f);

  &__text {
    font-size: 30px;
    color: #fff;
  }
}
</style>
