<script>
/**
 * @desc 封装选择机组组件[仅能通过完整机组编号筛选]
 * @auth demon3443002624@outlook.com
 * @date 2023-6-13 Tues. 10:10:01
 */

import FTable from '@/components/FPSSTable.vue'

export default {
  name: 'SelectGensetDialog',
  components: { FTable },
  data() {
    return {
      visibleState: false,
      searchForm: {
        platformId: '',
        keyword: ''
      },
      platFormList: [],
      columns: [
        {
          title: '序号',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return h(
              'span',
              {},
              params.index + (this.tableConfig.currentPage - 1) * this.tableConfig.pageSize + 1
            )
          }
        },
        {
          title: '名称',
          key: 'DisplayName'
        },
        {
          title: '机组编号',
          key: 'CollectorToken'
        },
        {
          title: '机组位置',
          key: 'InstallationSite'
        }
      ],
      tableData: [],
      total: 0,
      loadingTable: false,
      tableConfig: {
        pageSize: 10,
        currentPage: 1
      }
    }
  },
  props: {
    id: {
      required: true,
      type: String
    },
    visible: {
      required: true,
      type: Boolean
    },
    IsEditStatus: {
      required: true,
      type: Boolean
    },
    platformId: ''
  },
  computed: {},
  watch: {
    visible: {
      handler: function (nv) {
        this.visibleState = nv
      },
      immediate: true
    },
    platformId: {
      handler: function (nv) {
        this.$api.fwReport.allData().then((value) => {
          if (Array.isArray(value) && value.length > 0) {
            const platFormList = new Array()
            value.forEach((e) => {
              platFormList.push({
                ...e
              })
            })
            this.platFormList = platFormList
            nv && (this.searchForm.platformId = nv)
          }
        })
      }
    }
  },
  methods: {
    handleSearch() {
      const id = this.searchForm.platformId,
        number = this.searchForm.keyword
      if (!id) {
        this.$Message.warning('请选择平台')
      } else if (!number) {
        this.$Message.warning('请填写完整机组编号信息')
      } else {
        this.loadingTable = true
        this.$api.fwReport
          .getGensetInfo({
            platformId: id,
            gensetNumber: number
          })
          .then((value) => {
            this.loadingTable = false
            this.total = 1
            if (value) {
              this.tableData = [
                {
                  ...value
                }
              ]
            } else {
            }
          })
          .catch((result) => {
            this.loadingTable = false
          })
      }
    },
    onCancel() {
      this.$emit('on-cancel')
      this.tableData.length = 0
    },
    onChange(currentPage) {
      this.tableConfig.currentPage = currentPage
      this.handleSearch()
    },
    onPageSizeChange(pageSize) {
      this.tableConfig.pageSize = pageSize
      this.handleSearch()
    },
    onConfirm() {
      if (this.tableData.length < 1) {
        this.$Message.warning('未查询到机组')
        return
      } else {
        this.$emit('onConfirm', this.tableData[0], this.searchForm.platformId)
        this.onCancel()
      }
    }
  },
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
  <Modal
    title="请选择机组"
    :mask-closable="false"
    class="select-genset-dialog"
    :id="id"
    v-model="visibleState"
  >
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="8">
        <div class="label-container">
          <Select v-model="searchForm.platformId" filterable :disabled="IsEditStatus">
            <Option v-for="item in platFormList" :value="item.id" :key="item.id">{{
              item.platformName
            }}</Option>
          </Select>
        </div>
      </Col>
      <Col span="8">
        <div class="label-container">
          <Input
            v-model="searchForm.keyword"
            placeholder="请输入机组编号查询机组"
            :disabled="IsEditStatus"
          ></Input>
        </div>
      </Col>
      <Col span="8">
        <Row type="flex" align="middle" justify="space-between">
          <Button :loading="loadingTable" type="primary" icon="ios-search" @click="handleSearch"
            >查询</Button
          >
        </Row>
      </Col>
    </Row>
    <Row class="table-container mt16">
      <f-table
        :columns="columns"
        :tableData="tableData"
        :loading="loadingTable"
        :total="total"
        :tableConfig="tableConfig"
        @on-change="onChange"
        @on-page-size-change="onPageSizeChange"
      ></f-table>
    </Row>
    <Row slot="footer">
      <Button @click="onCancel">取消</Button>
      <Button @click="onConfirm" type="primary">确定选择</Button>
    </Row>
  </Modal>
</template>

<style lang='less' scoped>
/deep/ .ivu-modal-close {
  display: none;
}
</style>