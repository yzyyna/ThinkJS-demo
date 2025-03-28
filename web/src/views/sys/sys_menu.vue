<style lang="less">
</style>

<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            菜单列表
          </p>
          <Row>
            <Button type="info" @click="addRootMenu">添加一级菜单</Button>
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
          </Row>
        </Card>
      </Col>
    </Row>

    <Modal title="操作框" :mask-closable="false" :closable="false" v-model="modalAdd">
      <Form ref="formRef" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="名称" prop="title">
          <Input v-model="formValidate.title"></Input>
        </FormItem>
        <FormItem label="KEY" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="图标" prop="icon">
          <Input v-model="formValidate.icon"></Input>
        </FormItem>
        <FormItem label="路由" prop="href">
          <Input v-model="formValidate.href"></Input>
        </FormItem>
        <FormItem label="排序" prop="sort">
          <InputNumber :min="1" v-model="formValidate.sort"></InputNumber>
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
import sysMenuChild from './sys_menu_child.vue'
import util from '@/libs/util.js'
export default {
  components: { sysMenuChild },
  data() {
    return {
      modalAdd: false,
      modalEdit: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      currentParam: '',
      columns: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(sysMenuChild, {
              props: {
                row: params.row.children
              },
              on: {
                childEditData: (p) => {
                  this.childEditData(p)
                },
                childRemoveData: () => {
                  this.childRemoveData()
                },
                childRemoveSucData: () => {
                  this.childRemoveSucData()
                }
              }
            })
          }
        },
        {
          title: '名称',
          key: 'title'
        },
        {
          title: 'KEY',
          key: 'name'
        },
        {
          title: '图标',
          key: 'icon'
        },
        {
          title: '路由',
          key: 'href'
        },
        {
          title: '排序',
          key: 'sort'
        },
        {
          title: '操作',
          key: 'action',
          width: 210,
          align: 'center',
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
                      this.add(params)
                    }
                  }
                },
                '添加子菜单'
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
      data: [],
      formValidate: {
        sort: 1
      },
      ruleValidate: {
        name: [{ required: true, message: '必填项', trigger: 'blur' }],
        title: [{ required: true, message: '必填项', trigger: 'blur' }],
        icon: [{ required: true, message: '必填项', trigger: 'blur' }],
        sort: [{ required: true, message: '必填项' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      this.currentParam = ''
      util.post(this, 'admin/sys_menu/allData', {}, function (datas) {
        _self.data = datas
        _self.loading = false
      })
    },
    add(param) {
      this.formValidate = { sort: 1 }
      if (param) {
        this.currentParam = param
      } else {
        this.currentParam = ''
      }
      this.modalAdd = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.modalAdd = true
    },
    remove(param) {
      if (param.row.children && param.row.children.length > 0) {
        this.$Message.error('当前菜单包含有子菜单，不允许删除！')
        return false
      }
      this.$Modal.confirm({
        title: '是否确认删除?',
        content:
          '<p>删除菜单配置[' +
          param.row.title +
          ']可能导致用户无法查看页面,<span style="color:red;font-weight:bold">是否继续?</span></p>',
        onOk: (_) => {
          let _self = this
          this.loading = true
          util.post(this, 'admin/sys_menu/delData', { id: param.row.id }, function (datas) {
            _self.data.splice(param.index, 1)
            _self.loading = false
            _self.$Message.success('删除成功！')
          })
        },
        okText: '确认删除',
        cancelText: '取消'
      })
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          util.changeModalLoading(this, true)
          let _data = util.copy(this.formValidate)
          if (this.currentParam != '') {
            _data.pid = this.currentParam.row.id
          }
          if (this.formValidate && this.formValidate.id) {
            util.post(this, 'admin/sys_menu/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'admin/sys_menu/addData', _data, function (datas) {
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
    },
    addRootMenu() {
      this.add()
    },
    childEditData(param) {
      this.formValidate = util.copy(param.row)
      this.modalAdd = true
    },
    childRemoveData() {
      this.loading = true
    },
    childRemoveSucData() {
      this.loading = false
    }
  },
  mounted() {
    this.init()
  }
}
</script>