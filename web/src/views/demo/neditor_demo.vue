<!--
 * @Autor: linxu
 * @Date: 2023-03-03 14:25:27
 * @LastEditors: linxu
 * @LastEditTime: 2023-04-13 17:05:12
 * @Description: 
-->
<template>
  <div id="app">
    <div>
      <vue-editor
        id="editor"
        useCustomImageHandler
        @image-added="handleImageAdded"
        v-model="htmlForEditor"
      >
      </vue-editor>
    </div>
  </div>
</template>

<script>
import util from '@/libs/util.js'
import { VueEditor } from 'vue2-editor'
export default {
  components: {
    VueEditor
  },
  data() {
    return {
      htmlForEditor: '',
      addFormVisible: false
    }
  },
  methods: {
    handleImageAdded: function (file, Editor, cursorLocation) {
      util.imageUpload(this, file, function (datas) {
        let url = UPLOAD_IMG_URL + datas // Get url from response
        Editor.insertEmbed(cursorLocation, 'image', url)
      })
    }
  }
}
</script>
