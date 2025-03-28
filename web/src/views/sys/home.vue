<script>
/**
 * @desc your description
 * @auth demon3443002624@outlook.com
 * @date 2022-10-20 Thur. 11:20:57[modify] Mon.|Tues.|Wed.|Thur.|Fri.|Sat.|Sun.
 */

export default {
  name: 'Home',
  components: {},
  data() {
    return {
      userName: localStorage.getItem('username')
    }
  },
  props: [''],
  // inject:[''],
  // provide () {
  //   return {

  //   };
  // },
  computed: {},
  watch: {},
  methods: {},
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdated() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
</script>
<template>
  <div id="fpss-tools-home">
    <h1>欢迎您，{{ userName }}</h1>
  </div>
</template>

<style lang='' scoped>
</style>