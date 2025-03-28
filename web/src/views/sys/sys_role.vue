<style lang="less">
.fa {
  font-size: larger !important;
}
</style>

<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            角色列表
          </p>
          <Row>
            <Input v-model="searchForm.name" placeholder="请输入角色名称" style="width: 200px" />
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
        <FormItem label="名称" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="权限">
          <vue-tree
            ref="Tree"
            v-model="treeOptions.treeCheckedIds"
            :tree-data="menuList"
            :options="treeOptions"
          ></vue-tree>
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
import VueTree from 'vue-simple-tree/src/components/VueTree.vue'
import util from '@/libs/util.js'
export default {
  components: { VueTree },
  data() {
    return {
      modalAdd: false,
      modalEdit: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      searchForm: {
        type: '',
        current: 1
      },
      menuList: [],
      // 2023-6-28 11:46:04 demon3443002624@outlook.com:
      // https://gitee.com/jingangdaxingxing/thinkjs-iview-admin/issues/ILHTT
      // treeCheckedIds 从data 中移入 treeOptions 。同时 所有对于treeCheckedIds的操作
      // 都修改为 对treeOptions.treeCheckedIds 操作即可。
      treeOptions: {
        label: 'title',
        treeCheckedIds: []
      },
      count: 0,
      columns: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '创建时间',
          key: 'create_date'
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
        name: [{ required: true, message: '必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'admin/sys_role/pageData', this.searchForm, function (datas) {
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
      this.treeOptions.treeCheckedIds = []
      this.modalAdd = true
    },
    edit(param) {
      this.treeOptions.treeCheckedIds = []
      if (param.row.role_menus && param.row.role_menus.length > 0) {
        let ids = param.row.role_menus.split(',')
        for (let i = 0; i < ids.length; i++) {
          this.treeOptions.treeCheckedIds.push(parseInt(ids[i]))
        }
      }
      this.formValidate = util.copy(param.row)
      this.modalAdd = true
    },
    remove(param) {
      this.$Modal.confirm({
        onOk: (_) => {
          let _self = this
          this.loading = true
          util.post(this, 'admin/sys_role/delData', { id: param.row.id }, function (datas) {
            _self.data.splice(param.index, 1)
            _self.loading = false
            _self.$Message.success('删除成功！')
          })
        },
        okText: '确认删除',
        cancelText: '取消',
        title: '是否确认删除?',
        content:
          '<p>删除角色[' +
          param.row.name +
          ']可能导致用户权限出错,<span style="color:red;font-weight:bold">是否继续?</span></p>'
      })
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          util.changeModalLoading(this, true)
          let _data = util.copy(this.formValidate)
          _data.menuids = util.copy(this.treeOptions.treeCheckedIds)
          if (this.formValidate && this.formValidate.id) {
            util.post(this, 'admin/sys_role/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'admin/sys_role/addData', _data, function (datas) {
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
      this.formValidate = {}
    }
  },
  mounted() {
    let _self = this
    util.post(this, 'admin/sys_menu/getMenuTree', {}, function (datas) {
      _self.menuList = datas
    })
    this.init()
  }
}
</script>
