<template>
  <div class="setting">

    <v-banner>
      <div class="banner__text">
        {{$t('setting')}}
      </div>
    </v-banner>

    <section class="select_lang">
      {{$t('lang')}}
      <el-select v-model="active" @change="Language" placeholder="请选择语言">
        <el-option
          v-for="item in lang"
          :key="item.code"
          :label="item.name"
          :value="item.code">
        </el-option>
      </el-select>
    </section>

  </div>
</template>

<script>
import vBanner from '../components/Banner'

export default {
  name: 'Setting',
  components: {
    vBanner
  },
  data() {
    return {
      active: 'cn',
      lang: [
        {
          code: 'cn',
          name: '中文'
        },
        {
          code: 'en',
          name: 'English'
        }
      ]
    }
  },
  created() {
    this.active = this.$i18n.locale
  },
  methods: {
    Language() {
      this.$i18n.locale = this.active
      localStorage.setItem('lang', this.active)
    }
  }
}
</script>

<style lang="scss" scoped>
.select_lang {
  margin-top: 50px;
  text-align: center;
  color: #30485a;
}
</style>
