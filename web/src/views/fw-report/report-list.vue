<!--
 * @Autor: linxu
 * @Date: 2023-05-31 17:58:12
 * @LastEditors: linxu
 * @LastEditTime: 2023-10-12 16:16:08
 * @Description: 
-->
<template>
  <div id="report-list">
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="4">
        <div class="label-container">
          报告名称:
          <Select v-model="searchForm.type" filterable>
            <Option value="-1">全部</Option>
            <Option v-for="item in serviceList" :value="item.id" :key="item.id">{{
              item.serverName
            }}</Option>
          </Select>
        </div>
      </Col>
      <Col span="5">
        <div class="label-container">
          <Input
            v-model="searchForm.keyword"
            placeholder="支持报告编号/机组信息/客户描述的关键字搜索"
          ></Input>
        </div>
      </Col>
      <Col span="4">
        <div class="label-container">
          客户名称:
          <Select v-model="searchForm.customerId" filterable>
            <Option value="-1">全部</Option>
            <Option v-for="item in customerList" :value="item.id" :key="item.id">{{
              item.companyName
            }}</Option>
          </Select>
        </div>
      </Col>
      <Col span="7">
        <div class="label-container">
          服务完成时间
          <DatePicker
            style="width: 100%"
            v-model="searchForm.startDate"
            type="date"
            placeholder="年-月-日"
          ></DatePicker>
          <span style="margin: 0 2px">至</span>
          <DatePicker
            style="width: 100%"
            v-model="searchForm.endDate"
            type="date"
            placeholder="年-月-日"
          ></DatePicker>
        </div>
      </Col>
      <Col>
        <Button type="info" @click="reset" icon="ios-refresh">重置</Button>
        <Button type="primary" icon="ios-search" @click="handleSearch">搜索</Button>
      </Col>
    </Row>
    <Row class="mt16" type="flex" align="middle" justify="start" :gutter="16">
      <Col span="7">
        <Dropdown trigger="click" @on-click="selectService">
          <Button type="primary"> 新增服务报告 <Icon type="ios-arrow-down"></Icon> </Button>
          <Dropdown-menu slot="list">
            <Dropdown-item v-for="item in serviceList" :name="item.id" :key="item.id">{{
              item.serverName
            }}</Dropdown-item>
          </Dropdown-menu>
        </Dropdown>
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
    <!-- 弹窗-动态组件 -->
    <!-- <template v-if="modalShowFlag"> -->
    <Modal
      :transfer="false"
      v-model="modalShowFlag"
      :title="currentView && currentView.title"
      @on-cancel="cancel"
      :mask-closable="false"
      :width="currentView && currentView.width"
    >
      <component
        v-if="modalShowFlag"
        ref="child"
        :is="currentView && currentView.componentName"
        :configData="configData"
        @comfirmSelect="comfirmSelect"
      ></component>
      <div slot="footer"></div>
    </Modal>
    <!-- </template> -->
  </div>
</template>

<script>
import dayjs from 'dayjs'
import FTable from '@/components/FPSSTable.vue'
import RemoteDebug from './component/remoteDebug.vue'
import FaultDiagnosis from './component/faultDiagnosis.vue'
import { serveiceComponentConfig } from './component/data'

export default {
  name: 'ReportList',
  components: {
    FTable,
    RemoteDebug,
    FaultDiagnosis
  },
  data() {
    return {
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
          title: '报告编号',
          key: 'reportNumber'
        },
        {
          title: '报告名称',
          key: 'reportName'
        },
        {
          title: '服务客户',
          key: 'customerName'
        },
        {
          title: '相关机组',
          key: 'gensetInfo',
          render: (h, params) => {
            return h('div', {}, [
              h(
                'p',
                {
                  class: {
                    MulLineHiding_2: true
                  },
                  style: {
                    marginBottom: '4px'
                  }
                },
                this.tableData[params.index].gensetName
              ),
              h('p', {}, this.tableData[params.index].gensetNumber)
            ])
          }
        },
        {
          title: '服务人员',
          key: 'servicePerson'
        },
        {
          title: '服务开始时间',
          key: 'serviceStartTime'
        },
        {
          title: '服务完成时间',
          key: 'serviceEndTime'
        },
        {
          title: '客户描述',
          key: 'requestContent',
          render: (h, params) => {
            return h(
              'p',
              {
                class: { MulLineHiding: true }
              },
              params.row.requestContent
            )
          }
        },
        {
          title: '更新时间',
          key: 'updateTime'
        },
        {
          title: '操作',
          key: 'action',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'text'
                  },
                  style: {
                    color: '#57a3f3',
                    padding: '6px 5px'
                  },
                  on: {
                    click: () => {
                      this.showDetail(params)
                    }
                  }
                },
                '详情'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'text'
                  },
                  style: {
                    color: '#57a3f3',
                    padding: '6px 5px'
                  },
                  on: {
                    click: () => {
                      this.showCustomerDetail(params)
                    }
                  }
                },
                '电子报告'
              )
            ])
          }
        }
      ],
      tableConfig: {
        pageSize: 10,
        currentPage: 1
      },
      total: 0,
      tableData: [],
      loadingTable: false,
      searchForm: {
        type: '-1',
        keyword: '',
        customerId: '-1',
        startDate: '',
        endDate: ''
      },
      serviceList: [], // 服务类型
      customerList: [], // 平台客户
      platfornList: [], // 平台
      currentServiceType: null,
      currentView: null,
      modalShowFlag: false,
      configData: {}
    }
  },
  watch: {
    tableConfig: {
      handler: function (nv) {
        this.search()
      },
      deep: true
    }
  },
  methods: {
    selectPlatformList() {
      this.$api.fwReport.allData({}).then((data) => {
        this.platfornList = Array.isArray(data) && data.length > 0 ? data : []
      })
    },
    getServiceList() {
      this.$api.fwReport.getServiceList({}).then((data) => {
        this.serviceList =
          Array.isArray(data) && data.length > 0
            ? data.map((item) => {
                return {
                  ...item,
                  name: item.serverName
                }
              })
            : []
      })
    },
    getPlatformCustomerList() {
      this.$api.fwReport.getPlatformCustomerList({}).then((data) => {
        this.customerList = Array.isArray(data) && data.length > 0 ? data : []
      })
    },
    handleSearch() {
      if (this.tableConfig.currentPage != 1) {
        this.$set(this.tableConfig, 'currentPage', 1)
        return
      }
      this.search()
    },
    search() {
      const tableConfig = this.tableConfig
      const params = {
        pageSize: tableConfig.pageSize,
        currentPage: tableConfig.currentPage,
        // time: this.time && dayjs(this.time).format('YYYY-MM-DD')
        type: this.searchForm.type != '-1' ? this.searchForm.type : '',
        keyword: this.searchForm.keyword,
        customerId: this.searchForm.customerId != '-1' ? this.searchForm.customerId : '',
        startDate:
          this.searchForm.startDate && dayjs(this.searchForm.startDate).format('YYYY-MM-DD'),
        endDate: this.searchForm.endDate && dayjs(this.searchForm.endDate).format('YYYY-MM-DD')
      }

      this.loadingTable = true
      this.$api.fwReport
        .getReportPageData(params)
        .then((value) => {
          const tableData = new Array()

          // if (value.data && value.data.length > 0) {
          value.data.forEach((f) => {
            const obj = {
              ...f,
              gensetInfo: f.gensetName + ' ' + f.gensetNumber
            }
            tableData.push(obj)
          })
          // }
          this.tableData = tableData
          this.total = value.count
          this.loadingTable = false
        })
        .catch((err) => {})
    },
    reset() {
      this.searchForm = {
        type: '-1',
        keyword: '',
        customerId: '-1',
        startDate: '',
        endDate: ''
      }
    },

    onChange(currentPage) {
      this.tableConfig.currentPage = currentPage
    },
    onPageSizeChange(pageSize) {
      this.tableConfig.pageSize = pageSize
    },
    selectService(type) {
      this.currentServiceType = type
      this.currentView = serveiceComponentConfig.filter((item) => item.key == type)[0]
      this.configData = {}
      this.modalShowFlag = true
    },
    cancel() {
      this.modalShowFlag = false
      this.$refs['child'].resetFields()
    },
    // 新增 弹窗确认选择数据
    comfirmSelect(data) {
      const params = Object.assign(data, {
        ServiceType: this.currentServiceType,
        ServiceName: this.serviceList.find((item) => item.id == this.currentServiceType).serverName
      })

      this.cancel()
      this.$router.push({ path: '/fw-report-detail', query: { ...params, type: 'add' } })
    },
    showDetail(data) {
      const id = data.row.id
      // this.$router.push({ path: '/fw-report-detail', query: { id, type: 'edit' } })
      // 2023-6-19 15:00:25 赖国洋:先跳转到预览(导出)页面,点击编辑后跳转编辑页面
      this.$router.push({ path: '/fw-report-detail-export', query: { id, type: 'edit' } })
    },
    //客户电子服务报告
    showCustomerDetail(data) {
      const id = data.row.id
      this.$router.push({ path: '/fw-report-detail-customer', query: { id } })
    }
  },
  mounted() {
    this.getServiceList()
    this.getPlatformCustomerList()
    this.search()
  },
  beforeDestroy() {}
}
</script>

<style lang="less" scoped>
@import '~@/styles/common.less';
#report-list {
  .label-container {
    width: 100%;
    display: flex;
    align-items: center;
    white-space: nowrap;
    > div:first-child {
      margin: 0 0 0 5px;
    }
  }
}
// 单元格超出三行显示省略号
/deep/ .ivu-table-cell {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  padding: 0 8px;
}
/deep/.ivu-modal {
  .ivu-modal-body {
    min-height: 500px;
  }
  .ivu-modal-footer {
    display: none !important;
  }
}
</style>
