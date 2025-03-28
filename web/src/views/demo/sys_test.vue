<style lang="less">
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            测试数据列表
          </p>
          <Row>
            名称：<Input
              v-model="searchForm.name"
              placeholder="请输入名称"
              style="width: 200px; margin-right: 20px"
            />
            <span @click="handleSearch"><Button type="primary" icon="search">搜索</Button></span>
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
    <Modal title="编辑" :mask-closable="false" :closable="false" v-model="modalAdd">
      <Form ref="formRef" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="名称" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="别名" prop="name2">
          <Input v-model="formValidate.name2"></Input>
        </FormItem>
        <FormItem label="大名" prop="name3">
          <Input v-model="formValidate.name3"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button>
        <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
      </div>
    </Modal>
    <Modal title="详情" :mask-closable="false" :closable="false" v-model="modalDetail">
      <Form ref="formRef" :model="formValidate" :label-width="80">
        <FormItem label="名称" prop="name">
          <Input v-model="formValidate.name" readonly></Input>
        </FormItem>
        <FormItem label="别名" prop="name2">
          <Input v-model="formValidate.name2" readonly></Input>
        </FormItem>
        <FormItem label="大名" prop="name3">
          <Input v-model="formValidate.name3" readonly></Input>
        </FormItem>
        <FormItem label="" prop="create_date">
          <Input v-model="formValidate.create_date" readonly></Input>
        </FormItem>
        <FormItem label="" prop="update_date">
          <Input v-model="formValidate.update_date" readonly></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import util from '@/libs/util.js'
export default {
  data() {
    return {
      modalAdd: false,
      modalDetail: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      searchForm: {
        type: '',
        current: 1
      },
      count: 0,
      columns: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '别名',
          key: 'name2'
        },
        {
          title: '大名',
          key: 'name3'
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
                      this.show(params)
                    }
                  }
                },
                '查看'
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
                'Poptip',
                {
                  props: {
                    confirm: true,
                    title: '您确定要删除这条数据吗?',
                    transfer: true
                  },
                  on: {
                    'on-ok': () => {
                      this.remove(params)
                    }
                  }
                },
                [
                  h(
                    'Button',
                    {
                      style: {
                        marginRight: '5px'
                      },
                      props: {
                        type: 'error',
                        placement: 'top',
                        size: 'small'
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
      data: [],
      formValidate: {
        sort: 1
      },
      ruleValidate: {
        name: [{ required: true, message: '名称为必填项', trigger: 'blur' }],
        name2: [{ required: true, message: '别名为必填项', trigger: 'blur' }],
        name3: [{ required: true, message: '大名为必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'sys_test/pageData', this.searchForm, function (datas) {
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
      this.formValidate = {}
      this.modalAdd = true
    },
    show(param) {
      this.formValidate = util.copy(param.row)
      this.modalDetail = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.modalAdd = true
    },
    remove(param) {
      let _self = this
      this.loading = true
      util.post(this, 'sys_test/delData', { id: param.row.id }, function (datas) {
        _self.data.splice(param.index, 1)
        _self.loading = false
        _self.$Message.success('删除成功！')
      })
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          util.changeModalLoading(this, true)
          let _data = util.copy(this.formValidate)
          if (this.formValidate && this.formValidate.id) {
            util.post(this, 'sys_test/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'sys_test/addData', _data, function (datas) {
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
    }
  },
  mounted() {
    this.init()
  }
}
</script>