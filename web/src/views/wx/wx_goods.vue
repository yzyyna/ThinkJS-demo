<style lang="less">
.table-min-width {
  min-width: 120px;
  width: 120px;
}
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-list"></Icon>
            商品列表
          </p>
          <Row>
            商品名称：<Input
              v-model="searchForm.name"
              placeholder="请输入要搜索的商品名称"
              style="width: 200px; margin-right: 20px"
            />
            分类：
            <Select v-model="searchForm.category_id" style="width: 150px; margin-right: 20px">
              <Option value="-1" key="-1">全部</Option>
              <OptionGroup v-for="item in categoryList" :label="item.name" :key="item.id">
                <Option v-for="item2 in item.child" :value="item2.id" :key="item2.id">{{
                  item2.name
                }}</Option>
              </OptionGroup>
            </Select>
            制造商：
            <Select v-model="searchForm.brand_id" style="width: 150px; margin-right: 20px">
              <Option value="-1" key="-1">全部</Option>
              <Option v-for="item in brandList" :value="item.id" :key="item.value">{{
                item.name
              }}</Option>
            </Select>
            <br />
            <br />
            是否在售：
            <Select v-model="searchForm.is_on_sale" style="width: 150px; margin-right: 20px">
              <Option value="-1" key="-1">全部</Option>
              <Option value="1" key="1">在售</Option>
              <Option value="0" key="0">停售</Option>
            </Select>
            是否新品：
            <Select v-model="searchForm.is_new" style="width: 150px; margin-right: 20px">
              <Option value="-1" key="-1">全部</Option>
              <Option value="1" key="1">是</Option>
              <Option value="0" key="0">否</Option>
            </Select>
            是否热销：
            <Select v-model="searchForm.is_hot" style="width: 150px; margin-right: 20px">
              <Option value="-1" key="-1">全部</Option>
              <Option value="1" key="1">是</Option>
              <Option value="0" key="0">否</Option>
            </Select>
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
    <Modal title="编辑" :mask-closable="false" :closable="false" v-model="modalAdd" width="60">
      <Form ref="formRef" :model="formValidate" :rules="ruleValidate" :label-width="80" inline>
        <FormItem label="分类" prop="category_id">
          <Select v-model="formValidate.category_id" style="width: 162px">
            <OptionGroup v-for="item in categoryList" :label="item.name" :key="item.id">
              <Option v-for="item2 in item.child" :value="item2.id" :key="item2.id">{{
                item2.name
              }}</Option>
            </OptionGroup>
          </Select>
        </FormItem>
        <FormItem label="商品名称" prop="name">
          <Input v-model="formValidate.name"></Input>
        </FormItem>
        <FormItem label="制造商" prop="brand_id">
          <Select v-model="formValidate.brand_id" style="width: 162px">
            <Option v-for="item in brandList" :value="item.id" :key="item.value">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <br />
        <FormItem label="商品单位" prop="goods_unit">
          <Input v-model="formValidate.goods_unit"></Input>
        </FormItem>
        <FormItem label="商品简介" prop="goods_brief">
          <Input v-model="formValidate.goods_brief"></Input>
        </FormItem>
        <FormItem label="零售价格" prop="retail_price">
          <Input v-model="formValidate.retail_price" number></Input>
        </FormItem>
        <br />
        <FormItem label="是否新品" prop="is_new">
          <Select v-model="formValidate.is_new" style="width: 162px">
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <FormItem label="是否在售" prop="is_on_sale">
          <Select v-model="formValidate.is_on_sale" style="width: 162px">
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <FormItem label="是否热销" prop="is_hot">
          <Select v-model="formValidate.is_hot" style="width: 162px">
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <br />
        <FormItem label="关键词" prop="keywords">
          <Input v-model="formValidate.keywords"></Input>
        </FormItem>
        <FormItem label="促销标签" prop="promotion_tag">
          <Input v-model="formValidate.promotion_tag"></Input>
        </FormItem>
        <FormItem label="排序" prop="sort_order">
          <InputNumber :min="1" v-model="formValidate.sort_order"></InputNumber>
        </FormItem>
        <br />
        <FormItem label="商品内容" prop="goods_desc">
          <vue-editor
            id="editor"
            useCustomImageHandler
            @image-added="handleImageAdded"
            v-model="formValidate.goods_desc"
          ></vue-editor>
        </FormItem>
        <br />
        <FormItem label="商品主图" prop="list_pic_url">
          <img :src="imgDataUrl" style="width: 100%" />
          <Upload :before-upload="handleUpload" action="" accept="image/*">
            <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Tag type="border">图片大小为：800*800</Tag>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button>
        <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
      </div>
    </Modal>
    <Modal title="详情" v-model="modalDetail" width="60">
      <Form :model="formValidate" :label-width="80" inline>
        <FormItem label="分类">
          <Select v-model="formValidate.category_id" style="width: 162px" disabled>
            <OptionGroup v-for="item in categoryList" :label="item.name" :key="item.id">
              <Option v-for="item2 in item.child" :value="item2.id" :key="item2.id">{{
                item2.name
              }}</Option>
            </OptionGroup>
          </Select>
        </FormItem>
        <FormItem label="商品名称">
          <Input v-model="formValidate.name" readonly></Input>
        </FormItem>
        <FormItem label="制造商">
          <Select v-model="formValidate.brand_id" style="width: 162px" disabled>
            <Option v-for="item in brandList" :value="item.id" :key="item.value">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <br />
        <FormItem label="商品单位">
          <Input v-model="formValidate.goods_unit" readonly></Input>
        </FormItem>
        <FormItem label="商品简介">
          <Input v-model="formValidate.goods_brief" readonly></Input>
        </FormItem>
        <FormItem label="零售价格">
          <Input v-model="formValidate.retail_price" number readonly></Input>
        </FormItem>
        <br />
        <FormItem label="是否新品">
          <Select v-model="formValidate.is_new" style="width: 162px" disabled>
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <FormItem label="是否在售">
          <Select v-model="formValidate.is_on_sale" style="width: 162px" disabled>
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <FormItem label="是否热销">
          <Select v-model="formValidate.is_hot" style="width: 162px" disabled>
            <Option value="0">否</Option>
            <Option value="1">是</Option>
          </Select>
        </FormItem>
        <br />
        <FormItem label="关键词">
          <Input v-model="formValidate.keywords" readonly></Input>
        </FormItem>
        <FormItem label="促销标签">
          <Input v-model="formValidate.promotion_tag" readonly></Input>
        </FormItem>
        <FormItem label="排序">
          <InputNumber :min="1" v-model="formValidate.sort_order" readonly></InputNumber>
        </FormItem>
        <br />
        <FormItem label="商品内容">
          <vue-editor id="editor2" v-model="formValidate.goods_desc" disabled></vue-editor>
        </FormItem>
        <br />
        <FormItem label="商品主图">
          <img :src="imgDataUrl" style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer"></div>
    </Modal>
    <Modal
      title="常见问题列表"
      :mask-closable="false"
      v-model="modalIssue"
      :width="60"
      :transfer="false"
      :styles="styles"
    >
      <WxGoodsIssue ref="modalIssueRef"></WxGoodsIssue>
      <div slot="footer"></div>
    </Modal>
    <Modal
      title="属性列表"
      :mask-closable="false"
      v-model="modalAttr"
      :width="60"
      :transfer="false"
      :styles="styles"
    >
      <WxGoodsAttr ref="modalAttrRef"></WxGoodsAttr>
      <div slot="footer"></div>
    </Modal>
    <Modal
      title="轮播图列表"
      :mask-closable="false"
      v-model="modalGallery"
      :width="60"
      :transfer="false"
      :styles="styles"
    >
      <WxGoodsGallery ref="modalGalleryRef"></WxGoodsGallery>
      <div slot="footer"></div>
    </Modal>
    <Modal
      title="规格列表"
      :mask-closable="false"
      v-model="modalProduct"
      :width="60"
      :transfer="false"
      :styles="styles"
    >
      <WxGoodsGallery ref="modalProductRef"></WxGoodsGallery>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script>
import util from '@/libs/util.js'
import { VueEditor } from 'vue2-editor'
import WxGoodsIssue from './goods/wx_goods_issue.vue'
import WxGoodsAttr from './goods/wx_goods_attribute.vue'
import WxGoodsGallery from './goods/wx_goods_gallery.vue'
export default {
  components: {
    VueEditor,
    WxGoodsIssue,
    WxGoodsAttr,
    WxGoodsGallery
  },
  data() {
    return {
      modalAdd: false,
      modalDetail: false,
      loading: false,
      modalLoading: false,
      modalCanBut: true,
      modalIssue: false,
      modalAttr: false,
      modalGallery: false,
      modalProduct: false,
      searchForm: {
        current: 1,
        category_id: '-1',
        brand_id: '-1',
        is_on_sale: '-1',
        is_new: '-1',
        is_hot: '-1'
      },
      currentgoodis: '',
      styles: { top: '20%' },
      imgDataUrl: '',
      categoryList: [],
      brandList: [],
      count: 0,
      columns: [
        {
          title: '商品名称',
          key: 'name',
          className: 'table-min-width',
          align: 'center'
        },
        {
          title: '分类',
          key: 'categoryname',
          className: 'table-min-width',
          align: 'center'
        },
        {
          title: '制造商',
          key: 'brandname',
          className: 'table-min-width',
          align: 'center'
        },
        {
          title: '零售价格',
          key: 'retail_price',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '销售量',
          key: 'sell_volume',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '排序',
          key: 'sort_order',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '是否在售',
          key: 'is_on_sale',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'i-switch',
                {
                  props: {
                    value: params.row.is_on_sale == 1,
                    size: 'large'
                  },
                  on: {
                    'on-change': (value) => {
                      this.changeStatus(value, params, 1)
                    }
                  }
                },
                [
                  h(
                    'span',
                    {
                      slot: 'open'
                    },
                    '是'
                  ),
                  h(
                    'span',
                    {
                      slot: 'close'
                    },
                    '否'
                  )
                ]
              )
            ])
          }
        },
        {
          title: '是否新品',
          key: 'is_new',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'i-switch',
                {
                  props: {
                    value: params.row.is_new == 1,
                    size: 'large'
                  },
                  on: {
                    'on-change': (value) => {
                      this.changeStatus(value, params, 2)
                    }
                  }
                },
                [
                  h(
                    'span',
                    {
                      slot: 'open'
                    },
                    '是'
                  ),
                  h(
                    'span',
                    {
                      slot: 'close'
                    },
                    '否'
                  )
                ]
              )
            ])
          }
        },
        {
          title: '是否热销',
          key: 'is_hot',
          className: 'table-min-width',
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'i-switch',
                {
                  props: {
                    value: params.row.is_hot == 1,
                    size: 'large'
                  },
                  on: {
                    'on-change': (value) => {
                      this.changeStatus(value, params, 3)
                    }
                  }
                },
                [
                  h(
                    'span',
                    {
                      slot: 'open'
                    },
                    '是'
                  ),
                  h(
                    'span',
                    {
                      slot: 'close'
                    },
                    '否'
                  )
                ]
              )
            ])
          }
        },
        {
          title: '规格',
          key: 'product',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'ghost',
                  shape: 'circle',
                  icon: 'ios-search'
                },
                on: {
                  click: () => {
                    this.productShow(params)
                  }
                }
              })
            ])
          }
        },
        {
          title: '属性',
          key: 'attr',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'ghost',
                  shape: 'circle',
                  icon: 'ios-search'
                },
                on: {
                  click: () => {
                    this.attrShow(params)
                  }
                }
              })
            ])
          }
        },
        {
          title: '轮播图',
          key: 'attr',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'ghost',
                  shape: 'circle',
                  icon: 'ios-search'
                },
                on: {
                  click: () => {
                    this.galleryShow(params)
                  }
                }
              })
            ])
          }
        },
        {
          title: '常见问题',
          key: 'issue',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'ghost',
                  shape: 'circle',
                  icon: 'ios-search'
                },
                on: {
                  click: () => {
                    this.issueShow(params)
                  }
                }
              })
            ])
          }
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
      formValidate: {},
      ruleValidate: {
        category_id: [{ required: true, message: '分类为必填项' }],
        name: [{ required: true, message: '商品名称为必填项' }],
        brand_id: [{ required: true, message: '制造商为必填项' }],

        goods_brief: [{ required: true, message: '商品简介为必填项' }],
        goods_desc: [{ required: true, message: '商品内容为必填项' }],
        goods_unit: [{ required: true, message: '商品单位为必填项' }],
        list_pic_url: [{ required: true, message: '商品主图为必填项' }],
        retail_price: [{ required: true, type: 'number', message: '零售价格为数字类型的必填项' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      util.post(this, 'wx/admin/wx_goods/pageData', this.searchForm, function (datas) {
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
      this.formValidate = { sort_order: 1, is_on_sale: '0', is_new: '0', is_hot: '0' }
      this.formValidate.goods_desc = ''
      this.imgDataUrl = ''
      this.modalAdd = true
    },
    show(param) {
      this.formValidate = util.copy(param.row)
      this.imgDataUrl = UPLOAD_IMG_URL + this.formValidate.list_pic_url
      this.modalDetail = true
    },
    edit(param) {
      this.formValidate = util.copy(param.row)
      this.imgDataUrl = UPLOAD_IMG_URL + this.formValidate.list_pic_url
      this.modalAdd = true
    },
    remove(param) {
      let _self = this
      this.loading = true
      util.post(this, 'wx/admin/wx_goods/delFlagData', { id: param.row.id }, function (datas) {
        _self.data.splice(param.index, 1)
        _self.loading = false
        _self.$Message.success('删除成功！')
      })
    },
    handleUpload(file) {
      let _self = this
      util.imageUpload(this, file, function (datas) {
        _self.imgDataUrl = UPLOAD_IMG_URL + datas // Get url from response
        _self.formValidate.list_pic_url = datas
      })
      return false
    },
    handleImageAdded: function (file, Editor, cursorLocation) {
      util.imageUpload(this, file, function (datas) {
        let url = UPLOAD_IMG_URL + datas // Get url from response
        Editor.insertEmbed(cursorLocation, 'image', url)
      })
    },
    changeStatus(value, param, type) {
      let _self = this
      this.loading = true
      let data = '0'
      if (value) {
        data = '1'
      }
      util.post(
        this,
        'wx/admin/wx_goods/changeStatus',
        { id: param.row.id, data: data, type: type },
        function (datas) {
          if (type == 1) {
            _self.data[param.index].is_on_sale = data
          } else if (type == 2) {
            _self.data[param.index].is_new = data
          } else if (type == 3) {
            _self.data[param.index].is_hot = data
          }

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
            util.post(this, 'wx/admin/wx_goods/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            util.post(this, 'wx/admin/wx_goods/addData', _data, function (datas) {
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
    getBeforeData() {
      let _self = this
      util.post(this, 'wx/admin/wx_brand/allData', {}, function (datas) {
        _self.brandList = datas
      })
      util.post(this, 'wx/admin/wx_category/categoryList', {}, function (datas) {
        _self.categoryList = datas
      })
    },
    issueShow(param) {
      this.modalIssue = true
      this.$refs.modalIssueRef.search(param.row.id)
    },
    attrShow(param) {
      this.modalAttr = true
      this.$refs.modalAttrRef.search(param.row.id, param.row.category_id)
    },
    galleryShow(param) {
      this.modalGallery = true
      this.$refs.modalGalleryRef.search(param.row.id)
    },
    productShow(param) {
      this.modalProduct = true
      this.$refs.modalProductRef.search(param.row.id)
    }
  },
  mounted() {
    this.getBeforeData()
    this.init()
  }
}
</script>