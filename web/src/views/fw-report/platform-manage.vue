<script>
/**
 * @desc 云平台配置页面
 * @auth demon3443002624@outlook.com
 * @date 2023-05-31 Tues. 15:54:44
 */

import dayjs from 'dayjs'
import FTable from '@/components/FPSSTable.vue'

export default {
  name: 'PlatformManage',
  components: { FTable },
  data() {
    return {
      columns: [
        {
          title: '平台名称',
          key: 'platformName'
        },
        {
          title: '平台地址',
          key: 'apiAddress'
        },
        {
          title: '密钥',
          key: 'secretKey'
        },
        {
          title: '备注',
          key: 'remark'
        },
        {
          title: '云平台版本',
          key: 'remoteVersion'
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
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Poptip',
                {
                  props: {
                    confirm: true,
                    title: '是否确定删除?'
                  },
                  on: {
                    'on-ok': () => {
                      this.delete(params.row)
                    },
                    'on-cancel': () => {}
                  }
                },
                [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'error'
                      }
                    },
                    '删除'
                  )
                ]
              )
            ])
          }
        }
      ],
      tableData: [],
      loadingTable: false,
      modalShowFlag: false,
      formValidate: {
        platformName: '',
        apiAddress: '',
        secretKey: '',
        remark: '',
        remoteVersion: ''
      },
      ruleValidate: {
        platformName: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
        apiAddress: [{ required: true, message: '请输入平台地址', trigger: 'blur' }],
        secretKey: [{ required: true, message: '请输入密钥', trigger: 'blur' }],
        remoteVersion: [{ required: true, message: '请通过‘通讯验证’获取版本号', trigger: 'blur' }]
      },
      currentEditId: null
    }
  },
  props: [''],
  computed: {},
  watch: {},
  methods: {
    search() {
      this.loadingTable = true
      this.$api.fwReport.allData().then((data) => {
        this.tableData = Array.isArray(data) && data.length > 0 ? data : []
        this.loadingTable = false
      })
    },
    add() {
      this.formValidate = {
        platformName: '',
        apiAddress: '',
        secretKey: '',
        remark: '',
        remoteVersion: ''
      }
      this.currentEditId = null
      this.modalShowFlag = true
    },
    edit(param) {
      // 编辑信息不保存版本号，提交时必须重新进行通讯验证
      this.formValidate = {
        platformName: param.platformName,
        apiAddress: param.apiAddress,
        secretKey: param.secretKey,
        remark: param.remark,
        remoteVersion: '' // param.remoteVersion
      }

      this.currentEditId = param.id
      this.modalShowFlag = true
    },
    delete(param) {
      this.currentEditId = param.id
      this.$api.fwReport.delData({ id: this.currentEditId }).then((value) => {
        this.$Message.success('删除成功!')
        this.search()
      })
    },
    cancel() {
      this.modalShowFlag = false
    },
    submit() {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          if (!this.formValidate.remoteVersion) {
            this.$Message.error('请通过‘通讯验证’获取版本号')
            return
          }
          const p = this.formValidate

          if (!this.currentEditId) {
            this.$api.fwReport.addData(p).then((value) => {
              this.$Message.success('提交成功')
              this.cancel()
              this.search()
            })
          } else {
            p.id = this.currentEditId
            this.$api.fwReport.updateData(p).then((value) => {
              this.$Message.success('提交成功')
              this.cancel()
              this.search()
            })
          }
        } else {
          this.$Message.error('请补充必填信息')
        }
      })
    },
    reset() {
      this.$refs.formValidate.resetFields()
    },
    checkConfig() {
      if (!this.formValidate.apiAddress) {
        this.$Message.error('请补充平台地址信息')
        return
      }
      if (!this.formValidate.secretKey) {
        this.$Message.error('请补充密钥信息')
        return
      }
      const param = {
        apiAddress: this.formValidate.apiAddress,
        secretKey: this.formValidate.secretKey
      }
      this.$api.fwReport.checkConfig(param).then((data) => {
        if (data && data.Version) {
          this.$set(this.formValidate, 'remoteVersion', data.Version)
          this.$Message.success('通讯验证成功')
          return
        }

        this.$Message.error('通讯验证失败')
      })
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
  <div id="platform-manage">
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="7">
        <Button type="primary" icon="ios-search" @click="search">搜索</Button>
        <Button type="info" icon="ios-plus-empty" @click="add">新增</Button>
      </Col>
    </Row>
    <Row class="table-container">
      <f-table :columns="columns" :tableData="tableData" :loading="loadingTable"></f-table>
    </Row>
    <!-- 可通过1.点击右上角叉叉;2.按 esc 键;3.点击取消键;4.点击遮罩关闭 modal 窗口 -->
    <Modal
      :transfer="false"
      v-model="modalShowFlag"
      title="新增云平台配置"
      @on-cancel="cancel"
      :width="700"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="平台名称" prop="platformName">
              <Input v-model="formValidate.platformName" placeholder="如：江苏熊猫"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="平台地址" prop="apiAddress">
              <Input v-model="formValidate.apiAddress" placeholder="如：http://dd.com:8088"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="密钥" prop="secretKey">
              <Input v-model="formValidate.secretKey" placeholder="请输入密钥"></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="备注" prop="remark">
              <Input v-model="formValidate.remark" placeholder="请输入备注"></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" class="check-btn" @click="checkConfig">通讯验证</Button>

        <Button @click="cancel">取消</Button>
        <Button type="warning" @click="reset" style="margin-left: 8px">重置</Button>
        <Button type="primary" @click="submit">提交</Button>
      </div>
    </Modal>
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

.check-btn {
  float: left;
}
</style>
