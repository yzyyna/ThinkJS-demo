<!-- 故障远程诊断 -->
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
          <Date-picker
            :value="searchForm.dateRange"
            format="yyyy-MM-dd"
            type="daterange"
            placement="bottom-end"
            placeholder="选择日期"
            @on-change="selectDateChange"
          ></Date-picker>
        </div>
      </Col>
      <Col span="6">
        <div class="label-container">
          <Input
            v-model="searchForm.keyword"
            placeholder="请输入机组编号查询机组"
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
      <Row class="mt16" type="flex" align="middle" justify="start" :gutter="16">
        <Col span="8">
          <span>机组名称：</span>
          <span>{{ gensetInfo.DisplayName }}</span>
        </Col>
        <Col span="8">
          <span>机组状态：</span>
          <span>{{ showStatusText() }}</span>
        </Col>
        <Col span="8">
          <span>机组位置：</span>
          <span>{{ gensetInfo && gensetInfo.InstallationSite }}</span>
        </Col>
      </Row>
      <Tabs :value="selectTab" @on-click="changeTab">
        <Tab-pane v-for="item in TabsList" :key="item.key" :label="item.label" :name="item.name">
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
        </Tab-pane>
      </Tabs>
    </template>
    <template v-else-if="searchResult == 2">
      <Row class="mt16">
        <Col>提示：未查询到对应机组，请修改后重试；</Col>
      </Row>
      <Row class="mt16">
        <Col> 查询失败可能原因：1.机组编号错误；2.机组编号与云平台不匹配； </Col>
      </Row>
    </template>
  </div>
</template>

<script>
import { mixins } from '@/mixin/index'
import dayjs from 'dayjs'
import FTable from '@/components/FPSSTable.vue'
export default {
  name: 'FaultDiagnosis',
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
      selectTab: '1',
      TabsList: [
        { key: 1, label: '报警曲线', name: '1' },
        { key: 2, label: '实时报警', name: '2' },
        { key: 3, label: '历史报警', name: '3' }
      ],
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
          key: 'Describe'
        },
        {
          title: '类型',
          key: 'TypeName'
        },
        {
          title: '开始时间',
          key: 'StartTime'
        },
        {
          title: '结束时间',
          key: 'EndTime'
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
                      this.comfirmSelect(params.row)
                    }
                  }
                },
                '选择'
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
      IsEditStatus: false,
      searchForm: {
        platformId: '',
        dateRange: [dayjs().add(-1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        keyword: ''
      },
      gensetInfo: {},
      searchResult: 0,

      selectData: {
        platformId: '', // 平台Id
        gensetInfo: {}, // 机组信息
        data: {} // 服务单信息
      }
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
      if (this.tableConfig.currentPage != 1) {
        this.$set(this.tableConfig, 'currentPage', 1)
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
          if (this.selectTab == 1) {
            this.getRecordList()
          } else if (this.selectTab == 2) {
            this.getNowAlarm()
          } else {
            this.getHistoryAlarm()
          }
        })
        .catch((err) => {
          this.gensetInfo = {}
          this.searchResult = 2
        })
    },
    // 查询报警曲线
    getRecordList() {
      const tableConfig = this.tableConfig
      const params = {
        pageSize: tableConfig.pageSize,
        currentPage: tableConfig.currentPage,
        platformId: this.searchForm.platformId,
        gensetNumber: this.searchForm.keyword,
        Type: '报警记录',
        Trigger: '报警-',
        type: this.selectTab
      }
      this.loadingTable = true
      this.$api.fwReport
        .findGensetRecordListByPage(params)
        .then((data) => {
          let tableData = data.Data.map((item) => {
            return {
              id: item.IdX,
              Describe: item.Trigger,
              TypeName: '-',
              StartTime:
                item.Time && this.$util.formatTime(item.Time).format('YYYY-MM-DD HH:mm:ss'),
              EndTime: '-'
            }
          })
          this.$set(this, 'tableData', tableData)
          this.total = data.TotalItemCount
          this.loadingTable = false
        })
        .catch((err) => {
          this.tableData = []
          this.total = 0
          this.loadingTable = false
        })
    },
    // 查询实时报警
    getNowAlarm() {
      const tableConfig = this.tableConfig
      const params = {
        pageSize: tableConfig.pageSize,
        currentPage: tableConfig.currentPage,
        platformId: this.searchForm.platformId,
        gensetNumber: this.searchForm.keyword,
        type: this.selectTab
      }
      this.loadingTable = true
      this.$api.fwReport
        .findGensetNowAlarmByPage(params)
        .then((data) => {
          let tableData = data.Data.map((item) => {
            return {
              id: item.No,
              Describe: item.Describe,
              TypeName: item.TypeName.slice(0, 2),
              StartTime:
                item.ServerTime &&
                this.$util.formatTime(item.ServerTime).format('YYYY-MM-DD HH:mm:ss'),
              EndTime: '-'
            }
          })

          this.$set(this, 'tableData', tableData)
          this.total = data.TotalItemCount
          this.loadingTable = false
        })
        .catch((err) => {
          this.tableData = []
          this.total = 0
          this.loadingTable = false
        })
    },
    // 查询报警历史
    getHistoryAlarm() {
      const tableConfig = this.tableConfig
      let startTime = this.searchForm.dateRange && this.searchForm.dateRange[0]
      let endTime = this.searchForm.dateRange && this.searchForm.dateRange[1]
      const params = {
        pageSize: tableConfig.pageSize,
        currentPage: tableConfig.currentPage,
        platformId: this.searchForm.platformId,
        gensetNumber: this.searchForm.keyword,
        startTime: startTime,
        endTime: endTime,
        type: this.selectTab
      }

      this.loadingTable = true
      this.$api.fwReport
        .findGensetHistoryAlarmByPage(params)
        .then((data) => {
          let tableData = data.Data.map((item) => {
            return {
              id: item.GeneratorSetHistoryDataId,
              Describe: item.Describe,
              TypeName: item.TypeName.slice(0, 2),
              StartTime:
                item.StartTime &&
                this.$util.formatTime(item.StartTime).format('YYYY-MM-DD HH:mm:ss'),
              EndTime:
                item.EndTime && this.$util.formatTime(item.EndTime).format('YYYY-MM-DD HH:mm:ss')
            }
          })

          this.$set(this, 'tableData', tableData)
          this.total = data.TotalItemCount
          this.loadingTable = false
        })
        .catch((err) => {
          this.tableData = []
          this.total = 0
          this.loadingTable = false
        })
    },
    showStatusText() {
      return this.$util.checkNullObject(this.gensetInfo)
        ? '-'
        : this.$util.showByCrewStatus(this.gensetInfo.Status).text
    },
    changeTab(name) {
      if (name !== this.selectTab) {
        this.tableConfig.currentPage = 1
        this.selectTab = name
        this.search()
      }
    },
    comfirmSelect(val) {
      this.$set(this.selectData, 'platformId', this.searchForm.platformId)
      this.$set(this.selectData, 'gensetInfo', this.gensetInfo)
      this.$set(this.selectData, 'data', val)
      this.$emit('comfirmSelect', this.selectData)
    },
    resetFields() {
      // 清空child数据
      Object.assign(this.$data, this.$options.data())
    },
    onChange(currentPage) {
      this.tableConfig.currentPage = currentPage
      this.search()
    },
    onPageSizeChange(pageSize) {
      this.tableConfig.pageSize = pageSize
      this.search()
    },
    selectDateChange(value) {
      this.$set(this.searchForm, 'dateRange', value)
    }
  },
  mounted() {},
  beforeDestroy() {}
}
</script>

<style lang="less" scoped></style>
