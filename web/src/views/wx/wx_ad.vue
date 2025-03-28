<style lang="less">
.table-min-width {
  min-width: 120px;
  width: 120px;
}

.table-min-width2 {
  min-width: 150px;
  width: 150px;
}

.table-min-width3 {
  min-width: 300px;
  width: 300px;
}
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            商城首页轮播图列表
          </p>
          <Row>
            文字说明：<Input
              v-model="searchForm.name"
              placeholder="请输入文字说明"
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
        <FormItem label="文字说明" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="图片" prop="image_url">
          <img :src="imgDataUrl" style="width: 100%" />
          <Upload :before-upload="handleUpload" action="" accept="image/*">
            <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Tag type="border">图片大小为：1440*800</Tag>
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
      modalDetail: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      searchForm: {
        current: 1
      },
      imgDataUrl: null,
      count: 0,
      columns: [
        {
          title: '文字说明',
          key: 'name',
          className: 'table-min-width',
          align: 'center',
          ellipsis: true
        },
        {
          title: '图片',
          key: 'image_url',
          className: 'table-min-width3',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: {
                  src: UPLOAD_IMG_URL + params.row.image_url
                },
                style: {
                  width: '300px'
                }
              })
            ])
          }
        },
        {
          title: '录入时间',
          key: 'create_date',
          className: 'table-min-width2',
          align: 'center',
          ellipsis: true
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
        name: [{ required: true, message: '文字说明为必填项', trigger: 'blur' }],
        image_url: [{ required: true, message: '图片为必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'wx/admin/wx_ad/pageData', this.searchForm, function (datas) {
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
      this.imgDataUrl = ''
      this.modalAdd = true
    },
    show(param) {
      this.formValidate = util.copy(param.row)
      this.modalDetail = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.imgDataUrl = UPLOAD_IMG_URL + this.formValidate.image_url
      this.modalAdd = true
    },
    remove(param) {
      let _self = this
      this.loading = true
      util.post(this, 'wx/admin/wx_ad/delData', { id: param.row.id }, function (datas) {
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
            util.post(this, 'wx/admin/wx_ad/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'wx/admin/wx_ad/addData', _data, function (datas) {
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
    handleUpload(file) {
      let _self = this
      util.imageUpload(this, file, function (datas) {
        _self.imgDataUrl = UPLOAD_IMG_URL + datas // Get url from response
        _self.formValidate.image_url = datas
      })
      return false
    }
  },
  mounted() {
    this.init()
  }
}
</script>