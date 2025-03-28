<script>
/**
 * @desc 远程调试标定服务报告详情页面-导出页面
 * @auth demon3443002624@outlook.com
 * @date 2023-6-6 Tues. 14:33:27
 */

import { VueEditor } from 'vue2-editor'
import dayjs from 'dayjs'

import UploadImgMultiple from '@/components/UploadImgMultiple.vue'
import AlertEChartVue from './component/AlertEChart.vue'
import RemoteDebug from './component/remoteDebug.vue'
import FaultDiagnosis from './component/faultDiagnosis.vue'
import { serveiceComponentConfig } from './component/data'

const tableIndex = {
  title: '序号',
  key: 'index',
  width: 65,
  align: 'center',
  render(h, params) {
    return h('span', params.index + 1)
  }
}

export default {
  name: 'FwReportDetailExportPage',
  components: { VueEditor, UploadImgMultiple, AlertEChartVue, RemoteDebug, FaultDiagnosis },
  data() {
    return {
      reportID: this.$route.query.id,
      platformId: '',
      pageType: 'add', // 页面的状态 add 添加 | edit 编辑
      gensetNumber: '',
      // 远程调试标定服务报告 1,故障远程诊断服务报告 2,
      reportType: 2,
      reportTitle: '',
      fortrustLogoUrl: require('@/images/fortrust-logo.png'),
      customerInfo: {
        data: {
          customerId: '',
          contact: '',
          phone: '',
          email: '',
          requestContent: '',
          requestTime: ''
        },
        option: {
          names: []
        }
      },
      serviceInfo: {
        data: {
          gensetName: '',
          gensetNumber: '',
          servicePerson: '',
          serviceStartTime: '',
          serviceEndTime: ''
        }
      },
      table: {
        debugRecord: {
          columns: [
            {
              ...tableIndex
            },
            {
              title: '参数名称',
              key: 'name'
            },
            {
              title: '调参前',
              key: 'before'
            },
            {
              title: '调参后',
              key: 'after'
            },
            {
              title: '调参时间',
              key: 'time'
            },
            {
              title: '调参单编号',
              key: 'no'
            }
            // {
            //   title: '操作',
            //   key: 'action',
            //   width: 120,
            //   align: 'center',
            //   render: (h, params) => {
            //     const _vm = this
            //     return h(
            //       'Button',
            //       {
            //         props: {
            //           type: 'error'
            //         },
            //         on: {
            //           click: (_) => {
            //             this.onClickDelete(1, params.index)
            //           }
            //         }
            //       },
            //       '移除',
            //       []
            //     )
            //   }
            // }
          ],
          data: []
        },
        helpRecord: {
          columns: [
            {
              ...tableIndex
            },
            {
              title: '指导方式(电话/社交账号等)',
              key: 'typeDescription',
              render: (h, params) => {
                const row = params.row
                const _vm = this
                return h('div', row.typeDescription || '')
              }
            },
            {
              title: '指导时间',
              key: 'time',
              render: (h, params) => {
                const _vm = this
                const row = params.row
                return h('div', row.time)
              }
            },
            {
              title: '指导内容',
              key: 'content',
              render: (h, params) => {
                const row = params.row
                const _vm = this
                return h('div', row.content || '')
              }
            }
            // {
            //   title: '操作',
            //   width: 120,
            //   align: 'center',
            //   key: 'operation',
            //   render: (h, params) => {
            //     const _vm = this
            //     return h(
            //       'Button',
            //       {
            //         props: {
            //           type: 'error'
            //         },
            //         on: {
            //           click: (_) => _vm.onClickDelete(2, params.index)
            //         }
            //       },
            //       '移除'
            //     )
            //   }
            // }
          ],
          data: [{}]
        }
      },
      richTextOtherDescribe: '',
      textareaHowToDo: '',
      textareaResult: '',
      // 报警曲线模块数据
      alertData: {
        faultName: '',
        faultType: '',
        startTime: '',
        serviceRemark: ''
      },
      handleResult: '',
      proposal: '',
      remarks: '',
      reportDetails: {},
      currentView: null,
      configData: {},
      modalShowFlag: false,
      // '1' 调参,'2' 故障
      currentDialogType: '1',
      getChartOption: {},
      // 编辑时的默认图片
      defaultList: [],
      uploadImgList: [],
      reportNumber: ''
    }
  },
  props: [''],
  // inject: [''],
  // provide() {
  //   return {}
  // },
  computed: {},
  watch: {
    'customerInfo.data.requestTime': function (nv) {
      // 注意：value 使用 v-model 时，值是 Date 类型，可以配合 @on-change 使用
      if (nv) this.customerInfo.data.requestTime = dayjs(nv).format('YYYY-MM-DD')
    },
    'serviceInfo.data.serviceEndTime': function (nv) {
      if (nv) this.serviceInfo.data.serviceEndTime = dayjs(nv).format('YYYY-MM-DD HH:mm')
    },
    'serviceInfo.data.serviceStartTime': function (nv) {
      if (nv) this.serviceInfo.data.serviceStartTime = dayjs(nv).format('YYYY-MM-DD HH:mm')
    }
  },
  methods: {
    getReportDetails(id) {
      return this.$api.fwReport.getReportDetails({ id }).then((value) => {
        if (value) {
          this.platformId = value.platformId
          this.gensetNumber = value.gensetNumber
          this.reportDetails = value
          this.reportType = value.serviceTypeId
          this.reportNumber = value.reportNumber
          // 导出时需要显示值
          this.customerInfo.data.customerId = value.customerId
          this.customerInfo.option.names.forEach((e) => {
            if (e.value == value.customerId) {
              this.customerInfo.data.customerId = e.label
            }
          })
          this.customerInfo.data.contact = value.contact
          this.customerInfo.data.phone = value.phone
          this.customerInfo.data.email = value.email
          this.customerInfo.data.requestContent = value.requestContent
          this.customerInfo.data.requestTime = value.requestTime

          this.serviceInfo.data.gensetName = value.gensetName
          this.serviceInfo.data.gensetNumber = value.gensetNumber
          this.serviceInfo.data.servicePerson = value.servicePerson
          this.serviceInfo.data.serviceStartTime = value.serviceStartTime
          this.serviceInfo.data.serviceEndTime = value.serviceEndTime

          this.alertData.faultName = value.faultRecord.faultName
          this.alertData.faultType = value.faultRecord.faultType
          this.alertData.startTime = value.faultRecord.startTime
          this.alertData.serviceRemark = value.serviceRemark
          this.remarks = value.faultRecord.remarks
          this.handleResult = value.faultRecord.handleResult

          this.richTextOtherDescribe =
            value.faultRecord.description &&
            value.faultRecord.description.replaceAll(
              '<img src=',
              '<img crossOrigin="anonymous" src='
            )
          this.proposal = value.proposal
          const imgArr = value.image.split(',')
          if (imgArr.length > 0 && imgArr[0] != '') {
            imgArr.forEach((e, i) => {
              this.$set(this.defaultList, this.defaultList.length, {
                name: i + 'image.jpg',
                url: e,
                status: 'finished'
              })
            })
            this.$set(this, 'uploadImgList', imgArr)
          }
          // 报警
          if (this.reportType == 2) {
            this.getChartOption = {
              platformId: this.platformId,
              gensetNumber: this.gensetNumber,
              recordId: value.faultRecord.recordId,
              Type: '报警记录',
              Trigger: '报警-',
              Describe: value.faultRecord.faultName
            }
          }
          // 远程调参记录
          const debugRecordData = []
          value.adjustmentRecords.forEach((e) => {
            debugRecordData.push({
              name: e.parametName,
              before: e.adjustmentBefore,
              after: e.adjustmentAfter,
              time: e.adjustmentTime,
              no: e.adjustmentNumber,

              ...e
            })
          })
          debugRecordData.sort((a, b) => {
            return Number(a.id) - Number(b.id)
          })
          this.table.debugRecord.data = debugRecordData
          // 远程知道记录
          const helpRecordData = []
          value.guidanceRecords.forEach((e) => {
            helpRecordData.push({
              typeDescription: e.guidanceMethond,
              time: e.guidanceTime,
              content: e.guidanceContent,
              ...e
            })
          })
          helpRecordData.sort((a, b) => {
            return Number(a.id) - Number(b.id)
          })
          this.table.helpRecord.data = helpRecordData

          this.$set(this.configData, 'platformId', value.platformId)
          this.$set(this.configData, 'gensetNumber', value.gensetNumber)
        }
      })
    },
    getPlatformCustomerList() {
      this.$api.fwReport.getPlatformCustomerList({ platformId: '' }).then((value) => {
        if (value) {
          const option = []
          value.forEach((e) => {
            option.push({
              value: e.id,
              label: e.companyName
            })
          })
          this.customerInfo.option.names = option
        }
      })
    },
    // rich-text upload image handler
    handleImageAdded: function (file, Editor, cursorLocation) {
      if (!this.$util.checkImgFile(this, file, 10)) {
        return false
      }
      this.$util.imageUpload(this, file, function (datas) {
        let url = UPLOAD_IMG_URL + datas // Get url from response
        Editor.insertEmbed(cursorLocation, 'image', url)
      })
    },
    onBlur($event) {
      const target = $event.target
      const value = target.value
      // 正则验证手机号
    },
    onChangeName() {},
    onChangeRequestTime(e) {
      // 注意：value 使用 v-model 时，值是 Date 类型，可以配合 @on-change 使用
      this.customerInfo.data.requestTime = e
    },
    onClickSaveReport() {
      this.$Message.success('保存报告成功!')
      const p = {
        id: this.reportID,
        serviceTypeId: this.reportType,
        ...this.customerInfo.data,
        ...this.serviceInfo.data,
        reportName: '远程调试标定服务',
        image: '',
        serviceRemark: this.alertData.serviceRemark,
        proposal: this.proposal,
        faultRecord: {
          ...this.alertData,
          recordId: '102',
          endTime: '',
          handleResult: this.handleResult,
          remarks: this.remarks
        },
        adjustmentRecords: [],
        guidanceRecords: []
      }
      const adjustmentRecords = []
      const guidanceRecords = []

      this.table.debugRecord.data.forEach((e) => {
        adjustmentRecords.push({ ...e })
      })
      this.table.helpRecord.data.forEach((e) => {
        guidanceRecords.push({ ...e })
      })
      p.adjustmentRecords = adjustmentRecords
      p.guidanceRecords = guidanceRecords
    },
    onClickExportReport() {
      this.$router.push('/fw-report-detail-export')
    },
    onClickAdd(type) {
      switch (type) {
        // 添加远程调参记录事件处理
        case 1:
          this.onClickSelectDialog('1')
          break
        // 添加远程指导记录事件处理
        case 2:
          this.$set(this.table.helpRecord.data, this.table.helpRecord.data.length, {})
          break
        default:
          break
      }
    },
    onClickDelete(type, index) {
      switch (type) {
        case 1:
          this.$delete(this.table.debugRecord.data, index)
          break
        case 2:
          this.$delete(this.table.helpRecord.data, index)
          break
        default:
          break
      }
    },
    onInputHelpRecordDataChanged(nv, type = 'typeDescription', index = 0) {
      const helpRecord = this.table.helpRecord
      // 状态中有没有这一行数据?
      // undefined || object
      const hasCurrentRow = helpRecord.data.at(index)
      if (!hasCurrentRow) {
        this.$set(helpRecord, index, {
          typeDescription: '',
          time: '',
          content: ''
        })
      } else {
        helpRecord.data[index][type] = type === 'time' ? dayjs(nv).format('YYYY-MM-DD HH:mm') : nv
      }
    },
    async init() {
      await this.getPlatformCustomerList()
      const query = this.$route.query
      const pageType = query.type
      this.pageType = pageType
      if (pageType === 'add') {
        this.reportType = query.ServiceType
        this.platformId = query.platformId
        this.serviceInfo.data.gensetName = query.gensetInfo.DisplayName
        this.serviceInfo.data.gensetNumber = query.gensetInfo.CollectorToken
        if (query.ServiceType == 1) {
          await this.$api.fwReport
            .getProtocolParmas({
              platformId: this.platformId,
              id: query.data.Id
            })
            .then((value) => {
              if (Array.isArray(value) && value.length > 0) {
                const list = new Array()
                value.forEach((e) => {
                  list.push({
                    name: e.Name,
                    before: e.OldValue + e.Unit,
                    after: e.NowValue + e.Unit,
                    time: query.data.confirmTime,
                    no: e.Id
                  })
                })
                this.table.debugRecord.data = list
              }
            })
        } else {
          this.getChartOption = {
            platformId: this.platformId,
            gensetNumber: this.gensetNumber,
            recordId: query.data.id,
            Type: '报警记录',
            Trigger: '报警-',
            Describe: query.data.Describe
          }
          this.alertData.faultName = query.data.Describe
          this.alertData.faultType = query.data.TypeName
          this.alertData.startTime = query.data.StartTime
        }
      } else {
        //if (pageType === 'edit')
        const id = this.$route.query.id
        if (id) {
          await this.getReportDetails(id)
        }
      }
      const reportTypeList = await this.$api.fwReport.getServiceList()
      if (Array.isArray(reportTypeList) && reportTypeList.length > 0) {
        reportTypeList.forEach((e) => {
          if (e.id == this.reportType) {
            this.reportTitle = `发电机组${e.serverName}服务报告`
          }
        })
      }
    },
    // 动态弹窗相关
    onClickSelectDialog(type) {
      this.currentDialogType = type
      this.currentView = serveiceComponentConfig.filter((item) => item.key == type)[0]
      this.modalShowFlag = true
    },
    cancel() {
      this.modalShowFlag = false
      this.$refs['child'].resetFields()
    },
    // 新增 弹窗确认选择数据
    comfirmSelect(data) {
      switch (this.currentDialogType) {
        case '1':
          const confirmTime = data.data.Confirm_Time
          this.$api.fwReport
            .getProtocolParmas({
              platformId: this.platformId
              // id: '3607'
            })
            .then((value) => {
              if (Array.isArray(value) && value.length > 0) {
                const list = new Array()
                value.forEach((e) => {
                  list.push({
                    name: e.Name,
                    before: e.OldValue + e.Unit,
                    after: e.NowValue + e.Unit,
                    time: confirmTime,
                    no: e.Id
                  })
                })
                if (this.table.debugRecord.data.length === 0) {
                  this.table.debugRecord.data = list
                } else {
                  // 要判断原来的 table data 中是否存在了该 Id 的数据,有的话忽略,没有的话添加
                  const judgeArr = new Array()
                  const arrQuote = this.table.debugRecord.data
                  arrQuote.forEach((e) => {
                    judgeArr.push(e.no)
                  })
                  list.forEach((e) => {
                    if (!judgeArr.includes(e.no)) {
                      this.$set(arrQuote, arrQuote.length, e)
                    } else {
                    }
                  })
                }
                this.$Message.success('添加成功')
              }
            })
          break
        case '2':
          this.getChartOption = {
            platformId: this.platformId,
            gensetNumber: this.gensetNumber,
            recordId: data.data.id,
            Type: '报警记录',
            Trigger: '报警-',
            Describe: data.data.Describe
          }
          this.$Message.success('操作成功')
          break
        default:
          break
      }
      this.cancel()
    },
    exportImage() {
      // 检测用户浏览器缩放比例,必须100%,否则导出出问题
      const devicePixelRatio = window.devicePixelRatio
      if (devicePixelRatio === 1 || 1 === 1) {
        // [x] 解决导出之后只有窗口可视部分的问题(绝对定位改为相对)
        const el = document.querySelector('.single-page-con')
        const elButton = this.$refs.exportButton.$el
        const editButton = this.$refs.editButton.$el
        elButton.style.display = 'none'
        editButton.style.display = 'none'
        el.style.position = 'relative'
        // 2023-6-14 16:27:32 赖国洋
        // 导出的文件名命名规则为：“客户名称+机组编号+报告名称”，如“江苏熊猫FPSS7822090060G发电机组远程调试标定服务报告”
        // 2023-08-01 16:28:03 刘强:
        // 导出文件名称规则改为:机组名称+描述+报告名称+客户名称
        this.$util.htmlToPdf(
          {
            title:
              this.serviceInfo.data.gensetName +
              this.customerInfo.data.requestContent +
              this.reportTitle +
              this.customerInfo.data.customerId,
            contentId: '#fw-report-detail-export-page'
          },
          () => {
            el.style.position = 'absolute'
            elButton.style.display = ''
            editButton.style.display = ''
          }
        )
      } else {
        this.$Message.warning('<p>为保证导出文件质量,</p><p>请确保您的浏览器缩放比例为100%</p>')
      }
    },
    exchangeToEdit() {
      this.$router.push({ path: '/fw-report-detail', query: this.$route.query })
    },
    uploadImgSuccess(list) {
      this.uploadImgList = list
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init()
  },
  beforeUpdated() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
</script>
<template>
  <div id="fw-report-detail-export-page">
    <!-- <Row class="title-box" type="flex" justify="start" align="middle">
      <h2>报告详情</h2>
      <Col class="title-box-right-btns">
        <Row type="flex" justify="end">
          <Button v-if="pageType === 'edit'" type="primary" @click="onClickExportReport"
            >导出报告</Button
          >
          &nbsp;&nbsp;&nbsp;
          <Button type="success" @click="onClickSaveReport">保存报告</Button>
        </Row>
      </Col>
    </Row> -->
    <div :class="pageType === 'edit' || pageType === 'add' ? 'normalShow' : 'customShow'">
      <Button type="primary" ref="exportButton" @click="exportImage">导出</Button>

      <Button type="success" ref="editButton" v-show="pageType === 'edit'" @click="exchangeToEdit"
        >编辑</Button
      >
    </div>
    <div class="report-box">
      <Row type="flex" justify="start" align="bottom" class="report-box-top-info">
        <Col span="8">
          <img :src="fortrustLogoUrl" :style="{ height: '50px' }" />
        </Col>
        <Col span="16" v-if="reportNumber">
          <Row type="flex" justify="end" align="middle" style="padding: 0 0 5px 0">
            <span>报告编号:{{ reportNumber }}</span></Row
          >
        </Col>
      </Row>
      <Row type="flex" justify="center" class="report-box-report-title">
        <h1>{{ reportTitle }}</h1>
      </Row>
      <Row class="report-box-item-title">
        <h2>客户信息</h2>
      </Row>
      <div class="report-box-item-table table-no-bottom-border">
        <div class="cell flex-span1">
          <div required>客户名称</div>
          <div>{{ customerInfo.data.customerId }}</div>
        </div>
        <div class="cell flex-span1">
          <div>联系人</div>
          <div>{{ customerInfo.data.contact }}</div>
        </div>
        <div class="cell flex-span1">
          <div>电话</div>
          <div>{{ customerInfo.data.phone }}</div>
        </div>
        <div class="flex-span1">
          <div>邮箱</div>
          <div>{{ customerInfo.data.email }}</div>
        </div>
      </div>
      <div class="report-box-item-table">
        <div class="flex-span1 cell" style="display: block">
          <Row type="flex" align="middle" style="width: 100%">
            <Col span="6" required>客户描述</Col>
            <Col span="18">
              <Row type="flex" justify="end" align="middle" style="width: 100%">
                <div required>提报时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>

                <div style="flex: 1; max-width: 180px">
                  {{ customerInfo.data.requestTime }}
                </div>
              </Row>
            </Col>
          </Row>
          <Input
            type="textarea"
            placeholder=""
            disabled
            :autosize="true"
            v-model="customerInfo.data.requestContent"
            style="padding: 10px"
          ></Input>
        </div>
        <!-- 导出时不显示 -->
        <!-- <div class="flex-span1" style="display: block">
          <Row style="width: 100%; line-height: 32px">相关图像</Row>
          <UploadImgMultiple
            @handleSuccess="uploadImgSuccess"
            :defaultList="defaultList"
          ></UploadImgMultiple>
        </div> -->
      </div>
      <Row class="report-box-item-title">
        <h2>服务信息</h2>
      </Row>
      <div class="report-box-item-table table-no-bottom-border">
        <div class="flex-span1 cell">
          <div required>机组名称</div>
          <div>{{ serviceInfo.data.gensetName }}</div>
        </div>
        <div class="flex-span1 cell">
          <div required>机组编号</div>
          <div>{{ serviceInfo.data.gensetNumber }}</div>
        </div>
        <div class="flex-span1">
          <div required>服务人员</div>
          <div>{{ serviceInfo.data.servicePerson }}</div>
        </div>
      </div>
      <div class="report-box-item-table table-no-bottom-border">
        <div class="flex-span1 cell">
          <div required style="width: 115px">服务开始时间</div>
          <div>{{ serviceInfo.data.serviceStartTime }}</div>
        </div>
        <div class="flex-span1 cell">
          <div required style="width: 115px">服务完成时间</div>
          <div>{{ serviceInfo.data.serviceEndTime }}</div>
        </div>
        <div class="flex-span1">&nbsp;</div>
      </div>
      <div class="report-box-item-table record-table">
        <Row v-if="reportType === 2">
          <h3>故障/报警诊断记录</h3>
          <div style="padding: 5px 0">
            <span>诊断事项:</span><span>{{ alertData.faultName }}</span> &nbsp;&nbsp;&nbsp;
            <span>类型:</span><span>{{ alertData.faultType }}</span
            >&nbsp;&nbsp;&nbsp; <span>时间:</span>&nbsp;&nbsp;&nbsp;<span>{{
              alertData.startTime
            }}</span
            >&nbsp;&nbsp;&nbsp;
            <Button class="visibility" type="primary" @click="onClickSelectDialog('2')" size="small"
              >更换诊断事项</Button
            >
          </div>
        </Row>

        <div v-if="reportType === 2">
          <AlertEChartVue
            :getChartOption="getChartOption"
            id="report-detail-alert-chart"
            :showTooltipFlag="true"
          ></AlertEChartVue>
        </div>
        <div v-if="reportType === 2" style="margin-bottom: 10px" class="rich-text-alert-chart">
          <vue-editor
            :disabled="true"
            id="editor"
            useCustomImageHandler
            @image-added="handleImageAdded"
            v-model="richTextOtherDescribe"
          ></vue-editor>
        </div>

        <Row
          type="flex"
          align="middle"
          v-if="table.debugRecord.data && table.debugRecord.data.length > 0"
        >
          <h3>远程调参记录</h3>
          &nbsp;&nbsp;&nbsp;
          <Button class="visibility" type="primary" size="small" @click="onClickAdd(1)"
            >添加</Button
          >
        </Row>
        <div
          class="record-table-inner"
          v-if="table.debugRecord.data && table.debugRecord.data.length > 0"
        >
          <Table
            :border="true"
            :columns="table.debugRecord.columns"
            :data="table.debugRecord.data"
          ></Table>
        </div>
        <Row
          v-if="table.helpRecord.data && table.helpRecord.data.length > 0"
          type="flex"
          align="middle"
        >
          <h3>远程指导记录</h3>
          &nbsp;&nbsp;&nbsp;
          <Button class="visibility" type="primary" size="small" @click="onClickAdd(2)">
            添加
          </Button>
        </Row>
        <div
          class="record-table-inner"
          v-if="table.helpRecord.data && table.helpRecord.data.length > 0"
        >
          <Table
            :border="true"
            :columns="table.helpRecord.columns"
            :data="table.helpRecord.data"
          ></Table>
        </div>
        <Row type="flex" align="middle" v-if="!!alertData.serviceRemark">
          <h3>其他说明</h3>
          &nbsp;&nbsp;&nbsp;
        </Row>
        <div class="rich-text-box" style="margin: 10px 0" v-if="!!alertData.serviceRemark">
          <vue-editor
            id="editor"
            :disabled="true"
            useCustomImageHandler
            @image-added="handleImageAdded"
            v-model="alertData.serviceRemark"
          ></vue-editor>
        </div>
        <Row v-if="reportType === 2 && !!proposal" type="flex" align="middle">
          <h3>建议方案</h3>
        </Row>
        <div v-if="reportType === 2 && !!proposal" style="margin: 10px 0">
          <Input
            disabled
            :autosize="true"
            placeholder=""
            type="textarea"
            v-model="proposal"
          ></Input>
        </div>
        <Row v-if="reportType === 2" type="flex" align="middle">
          <h3>故障处理结果</h3>
          &nbsp;&nbsp;&nbsp;{{ handleResult }}
          <!-- <Radio-group v-model="handleResult">
            <Radio label="正常">
              <span>正常</span>
            </Radio>
            <Radio label="不正常">
              <span>不正常</span>
            </Radio>
            <Radio label="其他">
              <span>其他</span>
            </Radio>
          </Radio-group> -->
        </Row>
        <div v-if="reportType === 2 && remarks" style="margin: 10px 0">
          <Input disabled :autosize="true" placeholder="" type="textarea" v-model="remarks"></Input>
        </div>
      </div>
      <Row class="company-info-box">
        <Col span="9">
          <h1>服务动力 强国富民</h1>
          <div class="company-name">孚创信息科技(成都)有限公司</div>
          <div>地址:四川省成都市物联—路8号电子科技园B区9栋</div>
          <div>电话:4006365107</div>
        </Col>
        <Col span="15">
          <Row type="flex" :gutter="24">
            <!-- <Col span="6" class="hidden">
              <div class="qr-code-box">
                <img src="../../images/WeChat258x258.jpg" class="qr-code" />
                <div>电子版服务报告</div>
              </div>
            </Col> -->
            <Col span="6">
              <div class="qr-code-box">
                <img src="../../images/app430x430.jpg" class="qr-code" />
                <div>孚创动力</div>
              </div></Col
            >
            <Col span="6">
              <div class="qr-code-box">
                <img src="../../images/WeChat258x258.jpg" class="qr-code" />
                <div>发电熊猫云租赁</div>
              </div>
            </Col>
            <Col span="6">
              <div class="qr-code-box">
                <img src="../../images/dy800x800.png" class="qr-code" />
                <div>抖音号</div>
              </div></Col
            >
            <Col span="6">
              <div class="qr-code-box">
                <img src="../../images/fpss-app.png" class="qr-code" />
                <div>APP下载</div>
              </div></Col
            >
          </Row>
        </Col>
      </Row>
    </div>

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

<style lang="less" scoped>
@font-size: 15px;
#fw-report-detail-export-page {
  background-color: #fff;
  min-width: 1000px;
  max-width: 1920px;
  font-size: @font-size;
  position: relative;
  .normalShow {
    width: 100%;
    position: absolute;
    top: 10px;
    display: flex;
    justify-content: center;
    z-index: 99;
    > button:first-child {
      margin-right: 8px;
    }
  }
  .customShow {
    width: 100%;
    position: absolute;
    top: 10px;
    display: flex;
    justify-content: center;
    z-index: 99;
  }
  /deep/ .ql-toolbar {
    display: none;
  }
  /deep/ .ql-container {
    border-top: 1px solid #ccc;
  }
  /deep/ .ivu-input[disabled],
  fieldset[disabled] .ivu-input {
    background: white;
    color: #495060;
  }
  /deep/ .ivu-table {
    font-size: @font-size;
  }
  /deep/ .ql-editor {
    min-height: unset;
  }
  .title-box {
    margin: 0 10px;
    padding: 10px 0;
    border-bottom: 1px solid gray;
    &-right-btns {
      flex: 1;
    }
  }
  .report-box {
    padding: 10px 50px;
    &-top-info {
      border-bottom: 1px solid black;
    }
    &-report-title {
      padding: 10px 0 0 0;
    }
    &-item-title {
      padding: 10px 0;
    }
    @table_border:1px solid black;
    &-item-table {
      border: @table_border;
      display: flex;
      // 导出时不需要展示"必填"项
      // div[required]::before {
      //   content: '*';
      //   color: red;
      //   font-weight: bold;
      // }
      .cell {
        border-right: @table_border;
      }
      .flex-span1 {
        flex: 1;
      }
      .flex-span2 {
        flex: 2;
      }
      .flex-span3 {
        flex: 3;
      }
      .flex-span4 {
        flex: 4;
      }
      div[class*='flex-span'] {
        padding: 5px 10px;
        display: flex;
        align-items: center;
        > div:first-child {
          width: 80px;
        }
      }
      &[class~='record-table'] {
        padding: 10px;
        display: block;
        .record-table-inner {
          margin: 10px 0 10px 0;
          width: 100%;
        }
      }
      .date-picker {
        flex: 1;
      }
    }
    .table-no-bottom-border {
      border-bottom: 0;
    }
    .company-info-box {
      padding: 12px 0;

      .company-name {
        padding: 5px 0;
        font-size: 1.2rem;
      }
      .qr-code-box {
        text-align: center;

        .qr-code {
          height: 130px;
        }
      }
    }
  }
}
</style>
