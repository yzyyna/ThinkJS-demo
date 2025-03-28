<style lang="less">
.table-min-width {
  min-width: 120px;
  width: 120px;
}

.table-min-width3 {
  min-width: 200px;
  width: 200px;
}
.leaflet-form {
  .ivu-form-item {
    margin-bottom: 16px;
  }
}
#editor {
  max-height: 420px;
  overflow: auto;
}
.leaflet-img {
  width: 200px;
}
.footer {
  text-align: right;
}
</style>
<template>
  <div>
    <Form
      class="leaflet-form"
      ref="formRef"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="80"
    >
      <FormItem label="标题" prop="title">
        <Input v-model="formValidate.title"></Input>
      </FormItem>
      <FormItem label="描述" prop="desc">
        <Input v-model="formValidate.desc"></Input>
      </FormItem>
      <FormItem label="关键字" prop="keyword">
        <Input v-model="formValidate.keyword"></Input>
      </FormItem>
      <FormItem label="内容" prop="content">
        <vue-editor
          id="editor"
          useCustomImageHandler
          @image-added="handleImageAdded"
          v-model="formValidate.content"
        ></vue-editor>
      </FormItem>
      <FormItem label="封面" prop="img">
        <img class="leaflet-img" :src="imgDataUrl" />
        <Upload :before-upload="handleUpload" action="" accept="image/*">
          <Button icon="ios-cloud-upload-outline">上传图片</Button>
        </Upload>
        <Tag type="border">图片大小为：1440*800</Tag>
      </FormItem>
    </Form>
    <div class="footer" slot="footer">
      <!-- <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button> -->
      <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
    </div>
  </div>
</template>
<script>
import { VueEditor } from 'vue2-editor'
export default {
  components: {
    VueEditor
  },
  data() {
    return {
      loading: false,
      modalLoading: false,
      modalCanBut: false,
      imgDataUrl: '',

      data: [],
      formValidate: {
        title: '',
        desc: '',
        keyword: '',
        content: '',
        img: ''
      },
      ruleValidate: {
        title: [{ required: true, message: '标题为必填项', trigger: 'blur' }],
        desc: [{ required: true, message: '描述为必填项', trigger: 'blur' }],
        keyword: [{ required: true, message: '关键字为必填项', trigger: 'blur' }],
        content: [{ required: true, message: '内容为必填项', trigger: 'blur' }],
        img: [{ required: true, message: '图片为必填项', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init() {
      let _self = this
      _self.loading = true
      this.$util.post(this, 'admin/wx_leaflet/allData', {}, function (datas) {
        _self.data = datas

        if (datas && datas[0].id) {
          _self.formValidate = _self.$util.copy(datas[0])
          _self.imgDataUrl = UPLOAD_IMG_URL + _self.formValidate.img
        }
        _self.loading = false
      })
    },
    handleUpload(file) {
      if (!this.$util.checkImgFile(this, file, 10)) {
        return false
      }
      let _self = this
      this.$util.imageUpload(this, file, function (datas) {
        _self.imgDataUrl = UPLOAD_IMG_URL + datas // Get url from response
        _self.formValidate.img = datas
      })
      return false
    },
    handleImageAdded: function (file, Editor, cursorLocation, resetUploader) {
      if (!this.$util.checkImgFile(this, file, 10)) {
        return false
      }
      this.$util.imageUpload(this, file, function (datas) {
        let url = UPLOAD_IMG_URL + datas // Get url from response
        Editor.insertEmbed(cursorLocation, 'image', url)
        resetUploader()
      })
    },
    addOkFun() {
      let _self = this
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          _self.$util.changeModalLoading(this, true)
          let _data = _self.$util.copy(this.formValidate)
          if (this.formValidate && this.formValidate.id) {
            this.$util.post(this, 'admin/wx_leaflet/updateData', _data, function (datas) {
              _self.$Message.success('编辑成功！')
              _self.addCanFun()
              _self.init()
            })
          } else {
            this.$util.post(this, 'admin/wx_leaflet/addData', _data, function (datas) {
              _self.$Message.success('新增成功！')
              _self.addCanFun()
              _self.init()
            })
          }
        } else {
          this.$util.changeModalLoading(this)
        }
      })
    },
    addCanFun() {
      this.$util.changeModalLoading(this)
      this.$refs['formRef'].resetFields()
    }
  },
  mounted() {
    this.init()
  }
}
</script>
