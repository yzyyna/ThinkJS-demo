<!-- 远程调试标定 -->
<template>
  <div>
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="3">
        <div class="label-container">
          <Select v-model="searchForm.platformId" filterable :disabled="IsEditStatus">
            <Option v-for="item in platFormList" :value="item.id" :key="item.id">{{
              item.platformName
            }}</Option>
          </Select>
        </div>
      </Col>
      <Col span="6">
        <div class="label-container">
          <Input
            v-model="searchForm.keyword"
            placeholder="请输入机组编号查询调参记录"
            :disabled="IsEditStatus"
          ></Input>
        </div>
      </Col>
      <Col span="9">
        <Row type="flex" align="middle" justify="space-between">
          <Button type="primary" icon="ios-search" @click="handleSearch">查询</Button>
        </Row>
      </Col>
    </Row>
    <template v-if="searchResult == 1">
      <Row class="table-container mt16">
        <f-table
          :columns="listColumns"
          :tableData="listTableData"
          :loading="loadingTable"
          :total="listTotal"
          :tableConfig="listTableConfig"
          @on-change="onChangeList"
          @on-page-size-change="onPageSizeChangeList"
        ></f-table>
      </Row>
    </template>
    <template v-else-if="searchResult == 2">
      <Row class="mt16">
        <Col>提示：未查询到对应调参订单，请修改后重试；</Col>
      </Row>
      <Row class="mt16">
        <Col>
          查询失败可能原因：1.调参单还不是服务完成状态；2.调参单与云平台不匹配；3.调参单编号错误；
        </Col>
      </Row>
    </template>

    <Modal
      class="protocol-parmas-modal"
      :transfer="false"
      v-model="modalShowFlag"
      title="请选择调参记录"
      :mask-closable="false"
      @on-cancel="cancel"
      :width="800"
    >
      <div>
        <Row type="flex" align="middle" justify="end">
          <Button type="primary" @click="comfirmSelect">确认选择 </Button>
        </Row>
        <Row class="mt16" type="flex" align="middle" justify="start" :gutter="16">
          <Col span="8"
            ><span>机组名称：</span><span>{{ selectData.gensetInfo.DisplayName }}</span></Col
          >
          <Col span="8"
            ><span>机组编号：</span><span>{{ selectData.gensetInfo.CollectorToken }}</span></Col
          >
          <Col span="8"
            ><span>调参时间：</span><span>{{ selectData.data.Confirm_Time }}</span></Col
          >
        </Row>
        <Row class="mt16" type="flex" align="middle" justify="start" :gutter="16">
          <Col span="8"
            ><span>客户名称：</span><span>{{ selectData.data.ClientPhone }}</span></Col
          >
          <Col span="8"
            ><span>客户姓名：</span><span>{{ selectData.data.ClientName }}</span></Col
          >
          <Col span="8"
            ><span>联系方式：</span><span>{{ selectData.data.ClientPhone }}</span></Col
          >
        </Row>
        <Row class="table-container mt16 protocol-parmas-table">
          <f-table :columns="columns" :tableData="tableData" :loading="loadingTable"></f-table>
          <!-- 
            :total="total"
            @on-change="onChange"
            @on-page-size-change="onPageSizeChange"
           -->
        </Row>
      </div>

      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import { mixins } from '@/mixin/index'
import dayjs from 'dayjs'
import FTable from '@/components/FPSSTable.vue'
export default {
  name: 'RemoteDebug',
  components: { FTable },
  mixins: [mixins],
  /**
   * configData
   * -platformId 平台id
   * -gensetNumber 机组编号
   */
  props: ['configData'],
  data() {
    return {
      listColumns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h(
              'span',
              {},
              params.index +
                (this.listTableConfig.currentPage - 1) * this.listTableConfig.pageSize +
                1
            )
          }
        },
        {
          title: '服务单编号',
          key: 'No'
        },
        {
          title: '申请人',
          key: 'Create_Name',
          width: 80
        },
        {
          title: '申请时间',
          key: 'Create_Time',
          width: 100
        },
        {
          title: '机组名称',
          key: 'GeneratorName',
          render: (h, params) => {
            return h('div', {}, [
              h(
                'p',
                {
                  style: {
                    marginBottom: '4px'
                  }
                },
                this.listTableData[params.index].GeneratorName
              ),
              h('p', {}, this.listTableData[params.index].GeneratorCollectorToken)
            ])
          }
        },
        {
          title: '客户姓名',
          key: 'ClientName',
          width: 85
        },
        {
          title: '客户联系方式',
          key: 'ClientPhone',
          width: 115
        },
        {
          title: '调参人',
          key: 'Confirm_Name',
          width: 80
        },
        {
          title: '调参时间',
          key: 'Confirm_Time',
          width: 100
        },
        {
          title: '操作',
          key: 'action',
          width: 80,
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
                      this.showDetail(params.row)
                    }
                  }
                },
                '详情'
              )
            ])
          }
        }
      ],
      listTableConfig: {
        pageSize: 10,
        currentPage: 1
      },
      listTotal: 0,
      listTableData: [],
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
          title: '参数名称',
          key: 'Name'
        },
        {
          title: '调参前',
          key: 'OldValue'
        },
        {
          title: '调参后',
          key: 'NowValue'
        },
        {
          title: '单位',
          key: 'Unit'
        }
      ],
      tableConfig: {
        pageSize: 10,
        currentPage: 1
      },
      total: 0,
      tableData: [],
      loadingTable: false,
      IsEditStatus: false,
      searchForm: {
        platformId: '',
        keyword: ''
      },
      selectData: {
        platformId: '', // 平台Id
        gensetInfo: {}, // 机组信息
        data: {} // 服务单信息
      },
      gensetInfo: {},
      searchResult: 0,
      modalShowFlag: false
    }
  },
  watch: {
    configData: {
      handler: function (newVal, oldVal) {
        if (newVal && newVal.platformId && newVal.platformId) {
          this.$set(this.searchForm, 'platformId', newVal.platformId)
          this.$set(this.searchForm, 'keyword', newVal.gensetNumber)
          this.IsEditStatus = true
          this.search()
          return
        }

        this.IsEditStatus = false
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleSearch() {
      if (this.listTableConfig.currentPage != 1) {
        this.$set(this.listTableConfig, 'currentPage', 1)
      }
      this.search()
    },
    search() {
      if (!this.searchForm.keyword) {
        this.$Message.error('请输入机组编号')
        return
      }
      let params = {
        platformId: this.searchForm.platformId,
        gensetNumber: this.searchForm.keyword
      }
      this.$api.fwReport
        .getGensetInfo(params)
        .then((data) => {
          this.gensetInfo = data
          this.searchResult = 1
          if (!this.modalShowFlag) {
            this.getServiceSheet()
          } else {
            this.getProtocolParmas()
          }
        })
        .catch((err) => {
          this.gensetInfo = {}
          this.searchResult = 2
        })
    },
    // 查询调参列表
    getServiceSheet() {
      const tableConfig = this.listTableConfig
      const params = {
        pageSize: tableConfig.pageSize,
        currentPage: tableConfig.currentPage,
        platformId: this.searchForm.platformId,
        gensetNumber: this.searchForm.keyword
      }

      this.loadingTable = true
      this.$api.fwReport
        .getServiceSheet(params)
        .then((data) => {
          this.listTableData = data.Data.map((item) => {
            return {
              ...item,
              Create_Time:
                item.Create_Time &&
                this.$util.formatTime(item.Create_Time).format('YYYY-MM-DD hh:mm:ss'),
              Confirm_Time:
                item.Confirm_Time &&
                this.$util.formatTime(item.Confirm_Time).format('YYYY-MM-DD hh:mm:ss')
            }
          })
          this.listTotal = data.TotalItemCount
          this.loadingTable = false
        })
        .catch((err) => {
          this.tableData = []
          this.total = 0
          this.loadingTable = false
        })
    },
    // 查询调参历史
    getProtocolParmas() {
      const tableConfig = this.tableConfig
      const params = {
        platformId: this.searchForm.platformId,
        id: this.selectData.data.Id
      }

      this.loadingTable = true
      this.$api.fwReport
        .getProtocolParmas(params)
        .then((data) => {
          this.tableData = data
          // this.total = data.TotalItemCount
          // this.$set(this.selectData.data, 'tableData', data.Data)
          this.loadingTable = false
        })
        .catch((err) => {
          this.tableData = []
          this.total = 0
          this.loadingTable = false
        })
    },
    showDetail(row) {
      // this.selectData = row
      this.$set(this.selectData, 'platformId', this.searchForm.platformId)
      this.$set(this.selectData, 'gensetInfo', this.gensetInfo)
      this.$set(this.selectData, 'data', row)
      this.listTableConfig.currentPage = 1
      this.modalShowFlag = true

      this.search()
    },
    cancel() {
      this.modalShowFlag = false
    },
    comfirmSelect() {
      this.$emit('comfirmSelect', this.selectData)
    },
    resetFields() {
      // 清空child数据
      Object.assign(this.$data, this.$options.data())
    },

    // 调参记录列表分页
    onChangeList(currentPage) {
      this.listTableConfig.currentPage = currentPage
      this.search()
    },
    onPageSizeChangeList(pageSize) {
      this.listTableConfig.pageSize = pageSize
      this.search()
    }
    // 调参历史分页
    // onChange(currentPage) {
    //   this.tableConfig.currentPage = currentPage
    //   this.search()
    // },
    // onPageSizeChange(pageSize) {
    //   this.tableConfig.pageSize = pageSize
    //   this.search()
    // }
  },
  mounted() {},
  beforeDestroy() {}
}
</script>

<style lang="less" scoped>
.protocol-parmas-modal {
  /deep/.ivu-modal {
    .ivu-modal-body {
      max-height: 650px;
      overflow-y: auto;
    }
    .ivu-modal-footer {
      display: none !important;
    }
  }

  // .protocol-parmas-table /deep/.ivu-table-wrapper {
  //   max-height: 520px;
  //   overflow: auto;
  // }
}
</style>
