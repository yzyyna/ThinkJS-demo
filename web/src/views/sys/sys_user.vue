<style lang="less">
.table-min-width {
  min-width: 120px;
  width: 120px;
}

.table-min-width2 {
  min-width: 150px;
  width: 150px;
}
</style>

<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            用户列表
          </p>
          <Row>
            <Input v-model="searchForm.name" placeholder="请输入姓名" style="width: 200px" />
            <span @click="handleSearch" style="margin: 0 10px"
              ><Button type="primary" icon="search">搜索</Button></span
            >
          </Row>
          <Row style="margin-top: 10px">
            <Button type="info" @click="add">添加</Button>
          </Row>
          <Row type="flex" justify="center" align="middle" class="advanced-router">
            <Table
              border
              stripe
              :columns="columns"
              :data="data"
              :loading="loading"
              style="width: 100%; margin-top: 10px"
            ></Table>
            <Page
              :total="count"
              :current="searchForm.current"
              show-total
              style="margin-top: 10px"
              @on-change="pageChange"
            ></Page>
          </Row>
        </Card>
      </Col>
    </Row>

    <Modal title="操作框" :mask-closable="false" :closable="false" v-model="modalAdd">
      <Form ref="formRef" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="用户名" prop="login_name">
          <Input v-model="formValidate.login_name" :disabled="loginNameDisabled"></Input>
        </FormItem>
        <FormItem label="姓名" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="角色" prop="role_id">
          <Select v-model="formValidate.role_id" placeholder="请选择角色">
            <Option v-for="item in roleList" :value="item.id" :key="item.id">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="formValidate.email"></Input>
        </FormItem>
        <FormItem label="手机号" prop="phone">
          <Input v-model="formValidate.phone"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button>
        <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import util from '@/libs/util.js'
export default {
  data() {
    return {
      modalAdd: false,
      modalEdit: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      data: [],
      roleList: [],
      formValidate: {},
      searchForm: {
        type: '',
        current: 1
      },
      count: 0,
      loginNameDisabled: false,
      columns: [
        {
          title: '用户名',
          key: 'login_name',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '角色',
          key: 'rolename',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '姓名',
          key: 'name',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '邮箱',
          key: 'email',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '手机号',
          key: 'phone',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '登陆IP',
          key: 'login_ip',
          className: 'table-min-width',
          ellipsis: true
        },
        {
          title: '登陆时间',
          className: 'table-min-width2',
          key: 'login_date',
          ellipsis: true
        },
        {
          title: '状态',
          key: 'create_date1',
          align: 'center',
          className: 'table-min-width',
          ellipsis: true,
          render: (h, params) => {
            return h('div', [
              h(
                'i-switch',
                {
                  props: {
                    value: params.row.status == 1,
                    size: 'large'
                  },
                  on: {
                    'on-change': (value) => {
                      this.changeStatus(value, params)
                    }
                  }
                },
                [
                  h(
                    'span',
                    {
                      slot: 'open'
                    },
                    '正常'
                  ),
                  h(
                    'span',
                    {
                      slot: 'close'
                    },
                    '冻结'
                  )
                ]
              )
            ])
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 200,
          align: 'center',
          ellipsis: true,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.resetPwd(params)
                    }
                  }
                },
                '重置密码'
              ),
              h(
                'Button',
                {
                  props: {
                    size: 'small',
                    disabled: localStorage.getItem('user') === 'liupeng' ? false : true
                  },
                  on: {
                    click: () => {
                      this.remove(params)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      ruleValidate: {
        login_name: [{ required: true, message: '必填项', trigger: 'blur' }],
        name: [{ required: true, message: '必填项', trigger: 'blur' }],
        role_id: [{ required: true, message: '必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'admin/sys_user/pageData', this.searchForm, function (datas) {
        _self.data = datas.data
        _self.count = datas.count
        _self.loading = false
      })
    },
    handleSearch() {
      this.searchForm.current = 1
      this.init()
    },
    pageChange(current) {
      this.searchForm.current = current
      this.init()
    },
    add() {
      this.loginNameDisabled = false
      this.formValidate = {}
      this.modalAdd = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.loginNameDisabled = true
      this.modalAdd = true
    },
    remove(param) {
      this.$Modal.confirm({
        onOk: (_) => {
          this.loading = true
          let _self = this
          util.post(this, 'admin/sys_user/delData', { id: param.row.id }, function (datas) {
            _self.data.splice(param.index, 1)
            _self.loading = false
            _self.$Message.success('删除成功！')
          })
        },
        okText: '确认删除',
        cancelText: '取消',
        title: '是否确认删除?',
        content:
          '<p>删除用户[' +
          param.row.name +
          ']可能导致用户无法正常登录,<span style="color:red;font-weight:bold">是否继续?</span></p>'
      })
    },
    resetPwd(param) {
      let _self = this
      this.$Modal.confirm({
        title: '重置密码',
        content: '重置后的密码为：111111，是否继续操作？',
        onOk: () => {
          this.loading = true
          util.post(this, 'admin/sys_user/resetPwd', { id: param.row.id }, function (datas) {
            _self.loading = false
            _self.$Message.success('重置密码成功！')
          })
        }
      })
    },
    changeStatus(value, param) {
      let _self = this
      this.loading = true
      let status = 0
      if (value) {
        status = 1
      }
      util.post(
        this,
        'admin/sys_user/changeStatus',
        { id: param.row.id, status: status },
        function (datas) {
          _self.data[param.index].status = value
          _self.loading = false
          _self.$Message.success('修改成功！')
        }
      )
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          util.changeModalLoading(this, true)
          let _data = util.copy(this.formValidate)
          if (this.formValidate && this.formValidate.id) {
            util.post(this, 'admin/sys_user/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'admin/sys_user/addData', _data, function (datas) {
              _self.$Message.success('新增成功！')
              _self.addCanFun()
              _self.init()
            })
          }
        } else {
          util.changeModalLoading(this)
        }
      })
    },
    addCanFun() {
      this.modalAdd = false
      util.changeModalLoading(this)
      this.$refs['formRef'].resetFields()
      //this.formValidate=initform;
    }
  },
  mounted() {
    let _self = this
    util.post(this, 'admin/sys_role/allData', {}, function (datas) {
      _self.roleList = datas
    })
    this.init()
  }
}
</script>