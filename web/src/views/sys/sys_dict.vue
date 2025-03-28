<style lang="less">
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            字典列表
          </p>
          <Row>
            <Input v-model="searchForm.type" placeholder="请输入类型" style="width: 200px" />
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
        <FormItem label="描述" prop="description">
          <Input v-model="formValidate.description"></Input>
        </FormItem>
        <FormItem label="类别" prop="type">
          <Input v-model="formValidate.type"></Input>
        </FormItem>
        <FormItem label="标签" prop="label">
          <Input v-model="formValidate.label"></Input>
        </FormItem>
        <FormItem label="键值" prop="value">
          <Input v-model="formValidate.value"></Input>
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
import util from '@/libs/util.js'
export default {
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
      count: 0,
      columns: [
        {
          title: '描述',
          key: 'description'
        },
        {
          title: '类别',
          key: 'type'
        },
        {
          title: '标签',
          key: 'label'
        },
        {
          title: '键值',
          key: 'value'
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
        description: [{ required: true, message: '必填项', trigger: 'blur' }],
        type: [{ required: true, message: '必填项', trigger: 'blur' }],
        label: [{ required: true, message: '必填项', trigger: 'blur' }],
        value: [{ required: true, message: '必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'admin/sys_dict/pageData', this.searchForm, function (datas) {
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
      this.formValidate = { sort: 1 }
      this.modalAdd = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.modalAdd = true
    },
    remove(param) {
      this.$Modal.confirm({
        title: '是否确认删除?',
        content: `<p>删除字典项[${param.row.description}]可能导致功能异常,<span style="color:red;font-weight:bold">是否继续?</span></p>`,
        onOk: (_) => {
          let _self = this
          this.loading = true
          util.post(this, 'admin/sys_dict/delData', { id: param.row.id }, function (datas) {
            _self.data.splice(param.index, 1)
            _self.loading = false
            _self.$Message.success('删除成功！')
          })
        },
        okText: '确认删除'
      })
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          util.changeModalLoading(this, true)
          let _data = util.copy(this.formValidate)
          if (this.formValidate && this.formValidate.id) {
            util.post(this, 'admin/sys_dict/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'admin/sys_dict/addData', _data, function (datas) {
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