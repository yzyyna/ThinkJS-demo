<script>
/**
 * @desc 封装多图片上传组件
 * @auth demon3443002624@outlook.com
 * @date 20230606 周二 15:37:04
 */

const baseUrl = window.UPLOAD_IMG_URL

export default {
  data() {
    return {
      baseUrl,
      maxImageSizeKB: 1024 * 5,
      uploadList: [],
      headers: {
        'x-token': localStorage.getItem('token')
      },
      // preview images dialog options
      imgName: '',
      visible: false,
      imgSrc: '',
      // 图片大小
      size: 100
    }
  },
  props: {
    // show some default images
    defaultList: {
      type: Array
    }
  },
  watch: {
    defaultList(nv) {
      this.$refs.upload.fileList = nv
      this.$set(this, 'uploadList', nv)
    }
  },
  methods: {
    handleView(name, url) {
      this.imgName = name
      this.imgSrc = url
      this.visible = true
    },
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = fileList
      this.$emit(
        'handleSuccess',
        fileList.map((e) => {
          return e.url
        })
      )
    },
    handleSuccess(res, file, fileList) {
      // 因为上传过程为实例，这里模拟添加 url
      file.url = baseUrl + res.data.url
      this.uploadList = fileList
      this.$emit(
        'handleSuccess',
        fileList.map((e) => {
          return e.url
        })
      )
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 ' + this.maxImageSizeKB / 1024 + 'M。'
      })
    },
    handleBeforeUpload() {
      const check = this.uploadList.length < 5
      if (!check) {
        this.$Notice.warning({
          title: '最多只能上传 5 张图片。'
        })
      }
      return check
    }
  },
  mounted() {
    this.uploadList = this.$refs.upload.fileList
  }
}
</script>
<template>
  <div>
    <div
      class="demo-upload-list"
      :style="{
        width: size + 'px',
        height: size + 'px',
        lineHeight: size + 'px'
      }"
      v-for="(item, i) in uploadList"
      :key="item.url + i"
    >
      <template v-if="item.status === 'finished'">
        <img :src="item.url" />
        <div class="demo-upload-list-cover">
          <Icon
            title="预览"
            type="ios-eye-outline"
            @click.native="handleView(item.name, item.url)"
          ></Icon>
          <Icon
            title="删除"
            type="ios-trash-outline"
            style="color: tomato"
            @click.native="handleRemove(item)"
          ></Icon>
        </div>
      </template>
      <template v-else>
        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
      </template>
    </div>
    <Upload
      ref="upload"
      :headers="headers"
      :show-upload-list="false"
      :default-file-list="defaultList"
      :on-success="handleSuccess"
      :format="['jpg', 'jpeg', 'png']"
      :max-size="maxImageSizeKB"
      :on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
      multiple
      type="drag"
      :action="baseUrl + '/admin/upload/saveFile'"
      :style="{ display: 'inline-block', width: size + 'px' }"
    >
      <div
        :style="{
          width: size + 'px',
          height: size + 'px',
          lineHeight: size + 'px'
        }"
      >
        <Icon type="ios-camera" size="30"></Icon>
      </div>
    </Upload>
    <Modal title="查看图片" v-model="visible">
      <img :src="imgSrc" v-if="visible" style="width: 100%" />
    </Modal>
  </div>
</template>

<style lang='less' scoped>
.demo-upload-list {
  display: inline-block;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.demo-upload-list img {
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 25px;
  cursor: pointer;
  margin: 25px 8px;
}
</style>