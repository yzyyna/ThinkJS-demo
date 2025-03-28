<script>
/**
 * @desc 远程调试标定服务报告详情页面
 * @auth demon3443002624@outlook.com
 * @date 2023-6-1 Thur. 15:45:59
 */

import { VueEditor } from 'vue2-editor'
import dayjs from 'dayjs'

import UploadImgMultiple from '@/components/UploadImgMultiple.vue'
import AlertEChartVue from './component/AlertEChart.vue'
import RemoteDebug from './component/remoteDebug.vue'
import FaultDiagnosis from './component/faultDiagnosis.vue'
import { serveiceComponentConfig } from './component/data'
import SelectGensetDialogVue from '@/components/SelectGensetDialog.vue'
import AlertEChartDetailModal from './component/AlertEChartDetailModal.vue'

const tableIndex = {
  title: '序号',
  key: 'index',
  width: 65,
  align: 'center',
  render(h, params) {
    return h('span', params.index + 1)
  }
}
const inputStyle = {
  width: '100%',
  borderRadius: '4px',
  border: '1px solid #dddee1',
  height: '32px'
}

export default {
  name: 'FwReportDetailPage',
  components: {
    SelectGensetDialogVue,
    VueEditor,
    UploadImgMultiple,
    AlertEChartVue,
    RemoteDebug,
    FaultDiagnosis,
    AlertEChartDetailModal
  },
  data() {
    return {
      reportID: this.$route.query.id,
      platformId: '',
      pageType: 'add', // 页面的状态 add 添加 | edit 编辑
      gensetNumber: '',
      // 远程调试标定服务报告 1,故障远程诊断服务报告 2,
      reportType: 2,
      reportTitle: '',
      reportName: '',
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
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              align: 'center',
              render: (h, params) => {
                const _vm = this
                return h(
                  'Button',
                  {
                    props: {
                      type: 'error'
                    },
                    on: {
                      click: (_) => {
                        this.onClickDelete(1, params.index)
                      }
                    }
                  },
                  '移除',
                  []
                )
              }
            }
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
                return h('Input', {
                  props: {
                    placeholder: '请输入',
                    value: row.typeDescription || ''
                  },
                  on: {
                    input: (nv) => {
                      _vm.onInputHelpRecordDataChanged(nv, 'typeDescription', params.index)
                    }
                  }
                })
              }
            },
            {
              title: '指导时间',
              key: 'time',
              render: (h, params) => {
                const _vm = this
                const row = params.row
                return h('DatePicker', {
                  props: {
                    type: 'datetime',
                    format: 'yyyy-MM-dd HH:mm',
                    value: row.time || '',
                    transfer: true
                  },
                  style: {
                    width: '100%',
                    transfer: true
                  },
                  on: {
                    input: (nv) => {
                      _vm.onInputHelpRecordDataChanged(nv, 'time', params.index)
                    }
                  }
                })
              }
            },
            {
              title: '指导内容',
              key: 'content',
              render: (h, params) => {
                const row = params.row
                const _vm = this
                return h('Input', {
                  props: {
                    type: 'textarea',
                    autosize: { minRows: 1, maxRows: 10 },
                    spellcheck: true,
                    value: row.content || '',
                    maxlength: 1000
                  },
                  on: {
                    input: (nv) => {
                      _vm.onInputHelpRecordDataChanged(nv, 'content', params.index)
                    }
                  }
                })
              }
            },
            {
              title: '操作',
              width: 120,
              align: 'center',
              key: 'operation',
              render: (h, params) => {
                const _vm = this
                return h(
                  'Button',
                  {
                    props: {
                      type: 'error'
                    },
                    on: {
                      click: (_) => _vm.onClickDelete(2, params.index)
                    }
                  },
                  '移除'
                )
              }
            }
          ],
          data: []
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
        serviceRemark: '',
        recordId: ''
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
      visible: false,
      // 编辑时的默认图片
      defaultList: [],
      uploadImgList: [],
      reportNumber: '',
      loadingSaveBtn: false,

      getChartOptionDetails: {},
      showAlertCurveDetailVisible: false
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
          this.customerInfo.data.customerId = value.customerId
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
          this.alertData.recordId = value.faultRecord.recordId
          this.remarks = value.faultRecord.remarks
          this.handleResult = value.faultRecord.handleResult

          this.richTextOtherDescribe = value.faultRecord.description
          this.proposal = value.proposal
          const imgArr = value.image.split(',')
          if (imgArr.length > 0 && imgArr[0] != '') {
            // 先置空否则出现重复图片
            this.defaultList = []
            imgArr.forEach((e, i) => {
              this.$set(this.defaultList, this.defaultList.length, {
                name: i + 'image.jpg',
                url: e,
                status: 'finished'
              })
            })
            this.$set(this, 'uploadImgList', imgArr)
          }
          if (this.reportType == 2) {
            // 报警
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
      this.$api.fwReport.getPlatformCustomerList({ platformId: this.platformId }).then((value) => {
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
        // 不清空无法重复添加同一张图片
        document.querySelectorAll('.quillWrapper input').forEach((e) => {
          e.value = ''
        })
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
    _valid() {
      let result =
        this.customerInfo.data.customerId &&
        this.customerInfo.data.requestTime &&
        this.customerInfo.data.requestContent &&
        this.serviceInfo.data.gensetName &&
        this.serviceInfo.data.gensetNumber &&
        this.serviceInfo.data.servicePerson &&
        this.serviceInfo.data.serviceStartTime &&
        this.serviceInfo.data.serviceEndTime

      result = true

      const serviceInfo = this.serviceInfo
      if (dayjs(serviceInfo.data.serviceStartTime).diff(serviceInfo.data.serviceEndTime) > 0) {
        this.$Message.warning('请确保服务开始时间在服务结束时间之后')
        result = false
      }
      // if (!result) {
      //   this.$Message.warning('请填写必填信息!')
      // }

      // 2023-6-14 16:59:32 赖国洋 不验证
      // 没有写完整，导出来的报告自然也不完整，他们也自然会把它写完整才会交给客户
      return result
    },
    onClickSaveReport() {
      this.loadingSaveBtn = true
      if (this._valid()) {
        const p = {
          serviceTypeId: this.reportType,
          platformId: this.platformId,
          ...this.customerInfo.data,
          ...this.serviceInfo.data,
          reportName: this.reportName,
          image: '',
          serviceRemark: this.alertData.serviceRemark,
          proposal: this.proposal,
          faultRecord: {
            ...this.alertData,
            endTime: '',
            handleResult: this.handleResult,
            remarks: this.remarks,
            description: this.richTextOtherDescribe
          },
          adjustmentRecords: [],
          guidanceRecords: []
        }

        const adjustmentRecords = []
        const guidanceRecords = []

        this.table.debugRecord.data.forEach((e) => {
          adjustmentRecords.push({
            recordId: e.Id,
            parametName: e.name,
            unit: e.Unit,
            adjustmentBefore: e.before,
            adjustmentAfter: e.after,
            adjustmentTime: e.time,
            adjustmentNumber: e.no
          })
        })
        this.table.helpRecord.data.forEach((e) => {
          guidanceRecords.push({
            guidanceMethond: e.typeDescription,
            guidanceTime: e.time,
            guidanceContent: e.content
          })
        })
        p.adjustmentRecords = adjustmentRecords
        p.guidanceRecords = guidanceRecords
        p.image = this.uploadImgList.join()

        if (this.pageType === 'edit') {
          p.id = this.reportID
          this.$api.fwReport
            .saveEdit(p)
            .then((value) => {
              this.$Message.success('保存报告成功!')
              this.init()
              this.loadingSaveBtn = false
            })
            .catch((result) => {
              this.$Message.warning('保存失败!')
              this.loadingSaveBtn = false
            })
        } else {
          this.$api.fwReport.saveAdd(p).then((value) => {
            this.loadingSaveBtn = false
            this.$Message.success('保存成功!')
            const name = this.$route.name
            this.$store.commit('removeTag', name)
            this.$store.commit('closePage', name)
            this.$router.push({ path: '/fw-report/report-list', query: {} })
          })
        }
      }
    },
    onClickExportReport() {
      this.$router.push({ path: '/fw-report-detail-export', query: this.$route.query })
    },
    onClickAdd(type) {
      switch (type) {
        // 添加远程调参记录事件处理
        case 1:
          this.onClickSelectDialog('1')
          break
        // 添加远程指导记录事件处理
        case 2:
          this.$set(this.table.helpRecord.data, this.table.helpRecord.data.length, {
            typeDescription: '',
            time: '',
            content: ''
          })
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
      const query = this.$route.query
      const pageType = query.type
      this.pageType = pageType
      if (pageType === 'edit') {
        const id = this.$route.query.id
        if (id) {
          await this.getReportDetails(id)
        }
      } else if (pageType === 'add') {
        this.$set(this.configData, 'platformId', query.platformId)
        this.$set(this.configData, 'gensetNumber', query.gensetInfo.CollectorToken)
        this.reportType = query.ServiceType
        this.platformId = query.platformId
        this.gensetNumber = query.gensetInfo.CollectorToken
        this.serviceInfo.data.gensetName = query.gensetInfo.DisplayName
        this.serviceInfo.data.gensetNumber = query.gensetInfo.CollectorToken

        const confirmTime = query.data.Confirm_Time
        const no = query.data.No
        if (query.ServiceType == 1) {
          this.serviceInfo.data.serviceStartTime = confirmTime
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
                    time: confirmTime,
                    no: no,
                    ...e
                  })
                })
                this.table.debugRecord.data = list
              }
            })
        } else {
          this.getChartOption = {
            platformId: this.platformId,
            gensetNumber: query.gensetInfo.CollectorToken,
            recordId: query.data.id,
            Type: '报警记录',
            Trigger: '报警-',
            Describe: query.data.Describe
          }
          this.alertData.faultName = query.data.Describe
          this.alertData.faultType = query.data.TypeName
          this.alertData.startTime = query.data.StartTime
          this.alertData.recordId = query.data.id
          this.customerInfo.data.requestContent = query.data.Describe
        }
      }
      const reportTypeList = await this.$api.fwReport.getServiceList()
      await this.getPlatformCustomerList({ platformId: this.platformId })
      if (Array.isArray(reportTypeList) && reportTypeList.length > 0) {
        reportTypeList.forEach((e) => {
          if (e.id == this.reportType) {
            this.reportTitle = `发电机组${e.serverName}服务报告`
            this.reportName = e.serverName + '服务'
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
          const no = data.data.No
          this.$api.fwReport
            .getProtocolParmas({
              platformId: this.platformId,
              id: data.data.Id
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
                    no: no,
                    ...e
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
          this.alertData.faultName = data.data.Describe
          this.alertData.faultType = data.data.TypeName
          this.alertData.startTime = data.data.StartTime
          this.alertData.recordId = data.data.id
          this.$Message.success('操作成功')
          break
        default:
          break
      }
      this.cancel()
    },
    // 选择机组[仅能通过完整的机组编号查询]
    onClickSelectGenset() {
      this.visible = true
    },
    onConfirmSelectGenset(data, platformId) {
      this.$set(this.configData, 'platformId', platformId)
      this.$set(this.configData, 'gensetNumber', data.CollectorToken)
      const oldGenset = this.serviceInfo.data.gensetName
      const newGenset = data.DisplayName
      const operation = () => {
        this.serviceInfo.data.gensetName = data.DisplayName
        this.serviceInfo.data.gensetNumber = data.CollectorToken
      }
      if (oldGenset && oldGenset != newGenset) {
        this.$Modal.confirm({
          title: '提示',
          content: '<h3>机组不一致，更换机组后，调参记录会清空,是否确认?</h3>',
          onOk: () => {
            operation()
          },
          onCancel: () => {}
        })
      } else {
        operation()
      }
    },
    uploadImgSuccess(list) {
      this.uploadImgList = list
    },
    disabledDateHandler(date) {
      let result = false
      if (this.serviceInfo.data.serviceEndTime) {
        const end = dayjs(this.serviceInfo.data.serviceEndTime)
        const start = dayjs(date)
        if (end.diff(start) > 0) {
          result = false
        } else {
          result = true
        }
      }
      return false
    },
    disabledDateHandler2(date) {
      let result = false
      if (this.serviceInfo.data.serviceStartTime) {
        const start = dayjs(this.serviceInfo.data.serviceStartTime)
        const end = dayjs(date)
        if (end.diff(start) > 0) {
          result = false
        } else {
          result = true
        }
      }
      return false
    },
    // 查看详细曲线
    showAlertCurveDetail() {
      this.getChartOptionDetails = {
        platformId: this.platformId,
        gensetNumber: this.gensetNumber,
        recordId: this.alertData.recordId,
        Type: '报警记录',
        Trigger: '报警-',
        Describe: this.alertData.faultName,
        title: `${this.alertData.faultName}[${this.alertData.startTime}]-详细曲线`
      }
      this.showAlertCurveDetailVisible = true
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
  <div id="fw-report-detail-page">
    <Row class="title-box" type="flex" justify="start" align="middle">
      <h2>报告详情</h2>
      <Col class="title-box-right-btns">
        <Row type="flex" justify="end">
          <Button
            v-if="pageType === 'edit'"
            icon="md-download"
            type="primary"
            style="right: 150px"
            class="fixed-button"
            @click="onClickExportReport"
            >导出报告</Button
          >
          &nbsp;&nbsp;&nbsp;
          <Button
            type="success"
            icon="md-folder"
            class="fixed-button"
            @click="onClickSaveReport"
            :loading="loadingSaveBtn"
            >保存报告</Button
          >
        </Row>
      </Col>
    </Row>
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
          <Select
            @on-change="onChangeName"
            v-model="customerInfo.data.customerId"
            :clearable="true"
            style="flex: 1"
          >
            <Option
              v-for="item in customerInfo.option.names"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</Option
            >
          </Select>
        </div>
        <div class="cell flex-span1">
          <div>联系人</div>
          <Input v-model="customerInfo.data.contact" placeholder="请输入"> </Input>
        </div>
        <div class="cell flex-span1">
          <div>电话</div>
          <Input v-model="customerInfo.data.phone" @on-blur="onBlur" placeholder="请输入"></Input>
        </div>
        <div class="flex-span1">
          <div>邮箱</div>
          <Input v-model="customerInfo.data.email" placeholder="请输入"></Input>
        </div>
      </div>
      <div class="report-box-item-table">
        <div class="flex-span1 cell" style="display: block">
          <Row type="flex" align="middle" style="width: 100%">
            <Col span="6" required>客户描述</Col>
            <Col span="18">
              <Row type="flex" justify="end" align="middle" style="width: 100%">
                <div required>提报时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                <Date-picker
                  style="flex: 1; max-width: 180px"
                  type="date"
                  placeholder="选择日期"
                  v-model="customerInfo.data.requestTime"
                ></Date-picker>
              </Row>
            </Col>
          </Row>
          <Input
            type="textarea"
            placeholder="请输入"
            :autosize="{ minRows: 5, maxRows: 5 }"
            v-model="customerInfo.data.requestContent"
            style="padding: 10px"
          ></Input>
        </div>
        <div class="flex-span1" style="display: block">
          <Row style="width: 100%; line-height: 32px">相关图像</Row>
          <UploadImgMultiple
            @handleSuccess="uploadImgSuccess"
            :defaultList="defaultList"
          ></UploadImgMultiple>
        </div>
      </div>
      <Row class="report-box-item-title">
        <h2>服务信息</h2>
      </Row>
      <div class="report-box-item-table table-no-bottom-border">
        <div class="flex-span1 cell">
          <div required>机组名称</div>
          <div style="display: flex; flex: 1; align-items: center">
            <div>{{ serviceInfo.data.gensetName }}</div>
            <div style="flex: 1; display: flex; justify-content: end">
              <Button
                v-if="pageType === 'add' || pageType === 'edit'"
                @click="onClickSelectGenset"
                type="primary"
                size="small"
                >选择机组</Button
              >
            </div>
          </div>
        </div>
        <div class="flex-span1 cell">
          <div required>机组编号</div>
          <div>{{ serviceInfo.data.gensetNumber }}</div>
        </div>
        <div class="flex-span1">
          <div required>服务人员</div>
          <Input v-model="serviceInfo.data.servicePerson"> </Input>
        </div>
      </div>
      <div class="report-box-item-table table-no-bottom-border">
        <div class="flex-span1 cell">
          <div required style="width: 115px">服务开始时间</div>
          <Date-picker
            class="date-picker"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm"
            v-model="serviceInfo.data.serviceStartTime"
            :options="{ disabledDate: disabledDateHandler }"
          >
          </Date-picker>
          <!-- <div>{{ serviceInfo.data.serviceStartTime }}</div> -->
        </div>
        <div class="flex-span1 cell">
          <div required style="width: 115px">服务完成时间</div>
          <Date-picker
            class="date-picker"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm"
            v-model="serviceInfo.data.serviceEndTime"
            :options="{ disabledDate: disabledDateHandler2 }"
          >
          </Date-picker>
          <!-- <div>{{ serviceInfo.data.serviceEndTime }}</div> -->
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
            <Button type="primary" @click="onClickSelectDialog('2')" size="small"
              >更换诊断事项</Button
            >
            <Button
              type="primary"
              v-show="alertData.faultType == '-'"
              @click="() => showAlertCurveDetail()"
              size="small"
              >查看详细曲线</Button
            >
          </div>
        </Row>

        <div v-if="reportType === 2">
          <AlertEChartVue
            :getChartOption="getChartOption"
            id="report-detail-alert-chart"
          ></AlertEChartVue>
        </div>
        <div v-if="reportType === 2" style="margin-bottom: 10px" class="rich-text-alert-chart">
          <vue-editor
            id="editor1"
            useCustomImageHandler
            @image-added="handleImageAdded"
            v-model="richTextOtherDescribe"
          ></vue-editor>
        </div>

        <Row type="flex" align="middle">
          <h3>远程调参记录</h3>
          &nbsp;&nbsp;&nbsp;
          <Button type="primary" size="small" @click="onClickAdd(1)">添加</Button>
        </Row>
        <div class="record-table-inner">
          <Table
            :border="true"
            :columns="table.debugRecord.columns"
            :data="table.debugRecord.data"
          ></Table>
        </div>
        <Row type="flex" align="middle">
          <h3>远程指导记录</h3>
          &nbsp;&nbsp;&nbsp;
          <Button type="primary" size="small" @click="onClickAdd(2)"> 添加 </Button>
        </Row>
        <div class="record-table-inner">
          <Table
            :border="true"
            :columns="table.helpRecord.columns"
            :data="table.helpRecord.data"
          ></Table>
        </div>
        <Row type="flex" align="middle">
          <h3>其他说明</h3>
          &nbsp;&nbsp;&nbsp;
        </Row>
        <div class="rich-text-box" style="margin: 10px 0">
          <vue-editor
            id="editor2"
            useCustomImageHandler
            @image-added="handleImageAdded"
            v-model="alertData.serviceRemark"
          ></vue-editor>
        </div>
        <Row v-if="reportType === 2" type="flex" align="middle">
          <h3>建议方案</h3>
        </Row>
        <div v-if="reportType === 2" style="margin: 10px 0">
          <Input
            :autosize="{ minRows: 5, maxRows: 5 }"
            placeholder="请输入"
            type="textarea"
            v-model="proposal"
          ></Input>
        </div>
        <Row v-if="reportType === 2" type="flex" align="middle">
          <h3>故障处理结果</h3>
          &nbsp;&nbsp;&nbsp;
          <Radio-group v-model="handleResult">
            <Radio label="正常">
              <span>正常</span>
            </Radio>
            <Radio label="不正常">
              <span>不正常</span>
            </Radio>
            <Radio label="其他">
              <span>其他</span>
            </Radio>
          </Radio-group>
        </Row>
        <div v-if="reportType === 2" style="margin: 10px 0">
          <Input
            :autosize="{ minRows: 5, maxRows: 5 }"
            placeholder="请输入"
            type="textarea"
            v-model="remarks"
          ></Input>
        </div>
      </div>
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
    <!-- 选择机组弹窗 -->
    <select-genset-dialog-vue
      id="report-detail-select-genset-Dialog"
      :visible="visible"
      :IsEditStatus="false"
      :platformId="platformId"
      @on-cancel="visible = false"
      @onConfirm="onConfirmSelectGenset"
    ></select-genset-dialog-vue>
    <!-- 查看曲线详情弹窗 -->
    <alert-eChart-detail-modal
      id="alert-echart-detail-chart"
      :getChartOption="getChartOptionDetails"
      :visible="showAlertCurveDetailVisible"
      @on-cancel="showAlertCurveDetailVisible = false"
    ></alert-eChart-detail-modal>
  </div>
</template>

<style lang="less" scoped>
@font-size: 15px;
#fw-report-detail-page {
  background-color: #fff;
  min-width: 1000px;
  max-width: 1920px;
  font-size: @font-size;
  /deep/ .ivu-table {
    font-size: @font-size;
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
      div[required]::before {
        content: '*';
        color: red;
        font-weight: bold;
      }
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
  }
  .fixed-button {
    position: fixed;
    z-index: 99;
  }
}
</style>
