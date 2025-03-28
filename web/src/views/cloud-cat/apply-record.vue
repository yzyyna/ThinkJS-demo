<script>
/**
 * @desc 申请记录页面
 * @auth demon3443002624@outlook.com
 * @date 2023-03-07 Tues. 09:54:44
 */

import dayjs from 'dayjs'

import FTable from '@/components/FPSSTable.vue'
import ModalApply from './Modal-apply.vue'

export default {
  name: 'ApplyRecord',
  components: { FTable, ModalApply },
  data() {
    return {
      columns: [
        {
          title: '申请时间',
          key: 'applyTime'
        },
        {
          title: '申请人',
          key: 'applyUserName'
        },
        {
          title: '申请数量',
          key: 'applyNum'
        },
        {
          title: '操作',
          key: 'action',
          width: 250,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'info'
                  },
                  on: {
                    click: () => {
                      this.download(params)
                    }
                  }
                },
                '下载'
              )
            ])
          }
        }
      ],
      tableConfig: {
        pageSize: 10,
        currentPage: 1
      },
      time: '',
      total: 0,
      tableData: [],
      loadingTable: false,
      modalShowFlag: false,
      formValidate: {
        configId: '',
        clientId: '',
        username: '',
        password: '',
        remarks: ''
      },
      ruleValidate: {
        configId: [{ required: true, message: '请输入配置名称', trigger: 'change' }],
        clientId: [{ required: false, message: '请输入', trigger: 'blur' }],
        username: [{ required: false, message: '请输入', trigger: 'blur' }],
        password: [{ required: false, message: '请输入', trigger: 'blur' }],
        remarks: [{ required: true, message: '请输入备注信息', trigger: 'blur' }]
      },
      currentEditId: 0,
      properVisible: false,
      configList: []
    }
  },
  props: [''],
  // inject: [''],
  // provide() {
  //   return {}
  // },
  computed: {},
  watch: {
    tableConfig: {
      handler: function (nv) {
        this.search()
      },
      deep: true
    },
    'formValidate.configId': function (nv) {}
  },
  methods: {
    download(params) {
      const row = params.row
      this.$Modal.confirm({
        title: '',
        content: '<h3>是否确认下载?</h3>',
        onOk: () => {
          this.$api.cloudCat.exportApply({ id: row.id }).then((value) => {
            this.$Message.success('导出成功!')
            this.$util.download(
              value.data,
              'application/vnd.ms-excel',
              dayjs(row.applyTime).format('YYYYMMDDHHmmss') +
                '-' +
                row.applyUserName +
                '-' +
                row.applyNum +
                '.xlsx'
            )
          })
        },
        onCancel: () => {}
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
        time: this.time && dayjs(this.time).format('YYYY-MM-DD')
      }

      this.loadingTable = true
      this.$api.cloudCat.pageDataApply(params).then((value) => {
        const tableData = new Array()

        if (value.data && value.data.length > 0) {
          value.data.forEach((f) => {
            const obj = {
              ...f
            }
            tableData.push(obj)
          })
        }
        this.tableData = tableData
        this.total = value.count
        this.loadingTable = false
      })
    },
    add() {
      this.modalShowFlag = true
      this.$api.cloudCat.allData().then((value) => {
        const configList = new Array()
        const data = value
        if (data) {
          data.forEach((e) => {
            const obj = {
              value: e.id,
              label: e.configName,
              ...e
            }
            configList.push(obj)
          })
          this.configList = configList
        }
      })
    },
    cancel() {
      this.modalShowFlag = false
    },
    submit() {
      this.$refs.formValidate.validate((valid) => {
        if (valid && (this.formValidate.configId || this.formValidate.configId === 0)) {
          const f = this.formValidate
          const deviceIds = this.formValidate.remarks.replaceAll('\n', ',')
          const p = {
            confId: f.configId,
            deviceIds: deviceIds
          }
          this.$api.cloudCat.addDataApply(p).then((value) => {
            this.$Message.success('提交成功')
            this.cancel()
            this.search()
          })
        } else {
          this.$Message.error('请补充必填信息')
        }
      })
    },
    reset() {
      this.$refs.formValidate.resetFields()
      this.formValidate.configId = ''
    },
    onChange(currentPage) {
      this.tableConfig.currentPage = currentPage
    },
    onPageSizeChange(pageSize) {
      this.tableConfig.pageSize = pageSize
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.search()
  },
  beforeUpdated() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
</script>
<template>
  <div id="cloud-cat-apply-record">
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="7">
        <div class="label-container">
          申请时间
          <DatePicker
            style="width: 100%"
            v-model="time"
            type="date"
            placeholder="请选择申请时间"
          ></DatePicker>
        </div>
      </Col>
      <Col span="7">
        <Button type="primary" icon="ios-search" @click="handleSearch">搜索</Button>
        <Button type="info" icon="ios-plus-empty" @click="add">新增</Button>
      </Col>
    </Row>
    <Row class="table-container">
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
    <!-- 可通过1.点击右上角叉叉;2.按 esc 键;3.点击取消键;4.点击遮罩关闭 modal 窗口 -->
    <modal-apply
      :modalShowFlag="modalShowFlag"
      :configList="configList"
      @search="search"
      @cancel="cancel"
    ></modal-apply>
    <!-- <Modal :transfer="false" v-model="modalShowFlag" title="申请账号" @on-cancel="cancel" :width="700">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="配置名称" prop="">
              <Select v-model="formValidate.configId" filterable>
                <Option v-for="item in configList" :value="item.value" :key="item.value">{{
                  item.label
                }}</Option>
              </Select>
            </FormItem></Col
          >
          <Col span="12">
            <FormItem label="ClientID(GID_{Groupid}@@@GEC-test)" prop="clientId">
              <Input v-model="formValidate.clientId" placeholder="GID_MD_@@@GEC-test"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="username(用于人工校验)" prop="username">
              <Input
                v-model="formValidate.username"
                placeholder="Signature|LTAI6YxwNiSOh71u|post-cn-7pp2"
              ></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="password(用于人工校验)" prop="password">
              <Input
                v-model="formValidate.password"
                placeholder="h/fuXYoDV3g7kSAscQjkmOzqBJI="
              ></Input>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="云猫或终端编号" prop="remarks">
          <Input
            v-model="formValidate.remarks"
            type="textarea"
            :autosize="{ minRows: 15, maxRows: 30 }"
            placeholder="请粘贴云猫或终端编号，每一行为一个，如：
GEC610023020026
GEC610023020027
GEC610023020028
GEC610023020029
GEC610023020030
GEC610023020031
GEC610023020032"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="warning" @click="reset" style="margin-left: 8px">重置</Button>
        <Button type="primary" @click="submit">提交</Button>
      </div>
    </Modal> -->
  </div>
</template>

<style lang="less" scoped>
// 修改 modal 框中的 form 表单样式
/deep/ .ivu-form-item {
  display: flex;
  flex-direction: column;
  .ivu-form-item-label {
    text-align: left;
    margin-left: 16px;
    white-space: nowrap;
  }
  .ivu-form-item-content {
    margin-left: 16px !important;
  }
}
/deep/ .ivu-poptip-popper .ivu-icon-help-circled {
  display: none;
}
/deep/ .ivu-poptip-confirm .ivu-poptip-body {
  color: red;
  padding: 5px;
  font-weight: bold;
}
.label-container {
  width: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
  > div:first-child {
    margin: 0 0 0 5px;
  }
}
.table-container {
  margin: 16px 0 0 0;
}
</style>
