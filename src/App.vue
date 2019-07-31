<template>
  <div id="app">
    <el-menu :default-active="$route.path" mode="horizontal" router>
      <el-menu-item v-for="(item, key) in routers" :key="key" :index="item.path">{{item.name}}</el-menu-item>
    </el-menu>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app',
  data() {
    return {
      
    }
  },
  computed: {
    routers() {
      return [
        {
          path: '/',
          name: this.$t('home')
        },
        {
          path: '/transfer',
          name: this.$t('transfer')
        },
        {
          path: '/contact',
          name: this.$t('contact')
        },
        {
          path: '/setting',
          name: this.$t('setting')
        }
      ]
    }
  }
}
</script>

<style>
body {
  margin: 0;
  background: #ececec;
}
.el-menu {
  border-bottom: none !important;
}
</style>
