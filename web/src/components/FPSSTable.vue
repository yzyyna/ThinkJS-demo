<!--
 * @Autor: linxu
 * @Date: 2023-03-10 09:17:03
 * @LastEditors: linxu
 * @LastEditTime: 2023-06-12 16:36:26
 * @Description: 
-->
<script>
/**
 * @desc 封装列表组件
 * @auth demon3443002624@outlook.com
 * @date 2023-03-07 Tues. 10:37:41
 */
export default {
  name: 'FPSSTable',
  props: ['columns', 'loading', 'total', 'tableData', 'tableConfig'],
  data() {
    return {
      current: 1
    }
  },
  created() {},
  methods: {
    onChange(currentPage) {
      this.$emit('on-change', currentPage)
    },
    onPageSizeChange(pageSize) {
      this.$emit('on-page-size-change', pageSize)
    }
  }
}
</script>
<template>
  <div>
    <Row><Table border :loading="loading" :columns="columns" :data="tableData"></Table></Row>
    <Row class="page-container" v-if="total"
      ><Page
        @on-change="onChange"
        @on-page-size-change="onPageSizeChange"
        :total="total"
        :current="tableConfig && tableConfig.currentPage"
        show-elevator
        show-sizer
        show-total
      ></Page
    ></Row>
  </div>
</template>
<style lang="less" scoped>
.page-container {
  display: flex;
  margin: 16px 0 0 0;
  align-items: center;
  justify-content: end;
}
</style>
