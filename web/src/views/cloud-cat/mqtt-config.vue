<script>
/**
 * @desc MQTT配置页面
 * @auth demon3443002624@outlook.com
 * @date 2023-03-07 Tues. 09:54:44
 */

import FTable from '@/components/FPSSTable.vue'
import ModalApply from './Modal-apply.vue'

export default {
  name: 'MQTTConfig',
  components: { FTable, ModalApply },
  data() {
    return {
      columns: [
        {
          title: '配置名称',
          key: 'name'
        },
        {
          title: 'Topic',
          key: 'topic'
        },
        {
          title: 'GroupId',
          key: 'groupId'
        },
        {
          title: 'AccessKey',
          key: 'accessKey'
        },
        {
          title: 'SecretKey',
          key: 'secretKey'
        },
        {
          title: 'URL',
          key: 'url'
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
                  class: 'rowId' + params.row.id + 'rowIdEnd',
                  on: {
                    click: () => {
                      this.edit(params)
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
                      this.delete(params)
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
                      },
                      style: {
                        marginRight: '5px'
                      }
                    },
                    '删除'
                  )
                ]
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'info'
                  },
                  on: {
                    click: () => {
                      this.apply(params)
                    }
                  }
                },
                '申请账号'
              )
            ])
          }
        }
      ],
      tableConfig: {
        pageSize: 10,
        currentPage: 1
      },
      keyWord: '',
      total: 0,
      tableData: [],
      loadingTable: false,
      modalShow: false,
      formValidate: {
        name: '',
        topic: '',
        groupId: '',
        accessKey: '',
        secretKey: '',
        url: '',
        entityId: '',
        clientId: '',
        username: '',
        password: '',
        remarks: ''
      },
      ruleValidate: {
        name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
        topic: [{ required: true, message: '请输入Topic', trigger: 'blur' }],
        groupId: [{ required: true, message: '请输入GroupId', trigger: 'blur' }],
        accessKey: [{ required: true, message: '请输入AccessKey', trigger: 'blur' }],
        secretKey: [{ required: true, message: '请输入SecretKey', trigger: 'blur' }],
        url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
        entityId: [{ required: true, message: '请输入实例ID', trigger: 'blur' }],
        clientId: [{ required: false, message: '请输入', trigger: 'blur' }],
        username: [{ required: false, message: '请输入', trigger: 'blur' }],
        password: [{ required: false, message: '请输入', trigger: 'blur' }],
        remarks: [{ required: true, message: '请输入备注信息', trigger: 'blur' }]
      },
      currentEditId: 0,
      properVisible: false,
      modalShowFlag: false,
      configList: [],
      editFlag: false
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
    }
  },
  methods: {
    edit(params) {
      const row = params.row
      const id = row.id

      for (const ky in row) {
        this.$set(this.formValidate, ky, row[ky])
      }

      this.modalShow = true
      this.currentEditId = id
      this.editFlag = true
    },
    delete(params) {
      const row = params.row
      const id = row.id
      this.currentEditId = id
      this.$api.cloudCat.delData({ id: this.currentEditId }).then((value) => {
        this.$Message.success('删除成功!')
        this.search()
      })
    },
    apply() {
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
        keyWord: this.keyWord
      }

      this.loadingTable = true
      this.$api.cloudCat.pageData(params).then((value) => {
        const tableData = new Array()

        if (value.data && value.data.length > 0) {
          value.data.forEach((f) => {
            const obj = {
              id: f.id,
              name: f.configName,
              topic: f.topic,
              groupId: f.groupId,
              accessKey: f.accessKey,
              secretKey: f.secretKey,
              entityId: f.entityId,
              url: f.url,
              remarks: f.remarks
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
      this.modalShow = true
    },
    cancel() {
      this.reset()
      this.modalShow = false
    },
    cancelApply() {
      this.modalShowFlag = false
    },
    submit() {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          const f = this.formValidate
          const p = {
            configName: f.name,
            topic: f.topic,
            groupId: f.groupId,
            accessKey: f.accessKey,
            secretKey: f.secretKey,
            entityId: f.entityId,
            url: f.url,
            remarks: f.remarks
          }
          if (this.editFlag) {
            p.id = this.currentEditId
            this.$api.cloudCat.updateData(p).then((value) => {
              this.$Message.success('提交成功')
              this.cancel()
              this.search()
              this.editFlag = false
            })
          } else {
            this.$api.cloudCat.addData(p).then((value) => {
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
    check() {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          const f = this.formValidate
          const p = {
            configName: f.name,
            topic: f.topic,
            groupId: f.groupId,
            accessKey: f.accessKey,
            secretKey: f.secretKey,
            entityId: f.entityId,
            url: f.url,
            remarks: f.remarks,
            deviceId: 'GEC-test'
          }
          this.$api.cloudCat.checkConfig(p).then((value) => {
            f.clientId = value.ClientID
            f.username = value.UserName
            f.password = value.Password
          })
        } else {
          this.$Message.error('请补充必填信息')
        }
      })
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
  <div id="cloud-cat-mqtt-config">
    <Row type="flex" align="middle" justify="start" :gutter="16">
      <Col span="7">
        <div class="label-container">
          配置名称:<Input v-model="keyWord" placeholder="请输入配置名称..."></Input>
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
    <Modal :transfer="false" v-model="modalShow" title="新增配置" @on-cancel="cancel" :width="700">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="配置名称" prop="name">
              <Input v-model="formValidate.name" placeholder="请输入配置名称"></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="Topic" prop="topic">
              <Input v-model="formValidate.topic" placeholder="请输入Topic"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="GroupId" prop="groupId">
              <Input v-model="formValidate.groupId" placeholder="请输入GroupId"></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="AccessKey" prop="accessKey">
              <Input v-model="formValidate.accessKey" placeholder="请输入AccessKey"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="SecretKey" prop="secretKey">
              <Input
                v-model="formValidate.secretKey"
                placeholder="请输入SecretKey"
              ></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="URL" prop="url">
              <Input v-model="formValidate.url" placeholder="请输入URL"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="实例ID" prop="entityId">
              <Input v-model="formValidate.entityId" placeholder="请输入实例ID"></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="ClientID(GID_{Groupid}@@@GEC-test)" prop="clientId">
              <Input v-model="formValidate.clientId" placeholder="" readonly>
                <div slot="append" @click="check">测试</div>
              </Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="username(用于人工校验)" prop="username">
              <Input v-model="formValidate.username" placeholder="" readonly></Input> </FormItem
          ></Col>
          <Col span="12">
            <FormItem label="password(用于人工校验)" prop="password">
              <Input v-model="formValidate.password" placeholder="" readonly></Input>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="备注" prop="remarks">
          <Input
            v-model="formValidate.remarks"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="备注说明信息"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="warning" @click="reset" style="margin-left: 8px">重置</Button>
        <Button type="primary" @click="submit">提交</Button>
      </div>
    </Modal>
    <modal-apply
      :modalShowFlag="modalShowFlag"
      :configList="configList"
      @search="search"
      @cancel="cancelApply"
    ></modal-apply>
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
/deep/ .ivu-input-group-append {
  background-color: #2e8cf0;
  color: white;
  cursor: pointer;
}
.label-container {
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
