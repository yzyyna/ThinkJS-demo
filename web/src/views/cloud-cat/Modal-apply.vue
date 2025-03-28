<script>
import shoppingInfoVue from '../demo/advanced-router/component/shopping-info.vue'
/**
 * @desc 申请账号的弹窗组件
 * @auth demon3443002624@outlook.com
 * @date 2023-03-08 Wed. 16:51:22
 */

export default {
  name: 'ModalApply',
  components: {},
  data() {
    return {
      formValidate: {
        configId: '',
        clientId: '',
        username: '',
        password: '',
        remarks: ''
      },
      ruleValidate: {
        configId: [{ required: true, message: '请输入配置名称', trigger: 'change' }],
        clientId: [{ required: false, message: '请输入', trigger: 'blur' }],
        username: [{ required: false, message: '请输入', trigger: 'blur' }],
        password: [{ required: false, message: '请输入', trigger: 'blur' }],
        remarks: [{ required: true, message: '请输入备注信息', trigger: 'blur' }]
      },
      modalShow: false
    }
  },
  props: ['modalShowFlag', 'configList'],
  // inject:[''],
  // provide () {
  //   return {

  //   };
  // },
  computed: {},
  watch: {
    modalShowFlag(nv) {
      this.modalShow = this.modalShowFlag
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.$emit('cancel')
    },
    submit() {
      this.$refs.formValidate.validate((valid) => {
        if (valid && (this.formValidate.configId || this.formValidate.configId === 0)) {
          const f = this.formValidate
          const deviceIds = this.formValidate.remarks.replaceAll('\n', ',')
          const p = {
            confId: f.configId,
            deviceIds: deviceIds
          }
          this.$api.cloudCat.addDataApply(p).then((value) => {
            this.$Message.success('提交成功')
            this.cancel()
            this.$emit('search')
          })
        } else {
          this.$Message.error('请补充必填信息')
        }
      })
    },
    reset() {
      this.$refs.formValidate.resetFields()
      this.formValidate.configId = ''
    },
    check() {
      this.$refs.formValidate.validate((valid) => {
        if (valid && (this.formValidate.configId || this.formValidate.configId === 0)) {
          const c = this.configList
          const f = this.formValidate
          const id = f.configId
          const current = c.filter((e) => e.id === id)[0]
          const deviceIds = this.formValidate.remarks.replaceAll('\n', ',')
          const p = {
            configName: current.configName,
            topic: current.topic,
            groupId: current.groupId,
            accessKey: current.accessKey,
            secretKey: current.secretKey,
            entityId: current.entityId,
            url: current.url,
            remarks: current.remarks,
            deviceId: deviceIds
          }
          this.$api.cloudCat.checkConfig(p).then((value) => {
            f.clientId = value.ClientID
            f.username = value.UserName
            f.password = value.Password
          })
        } else {
          this.$Message.error('请补充必填信息')
        }
      })
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdated() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
</script>
<template>
  <Modal :transfer="false" v-model="modalShow" title="申请账号" @on-cancel="cancel" :width="700">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
      <Row>
        <Col span="12">
          <FormItem label="配置名称" prop="">
            <Select v-model="formValidate.configId" filterable>
              <Option v-for="item in configList" :value="item.value" :key="item.value">{{
                item.label
              }}</Option>
            </Select>
          </FormItem></Col
        >
        <Col span="12">
          <FormItem label="ClientID(GID_{Groupid}@@@GEC-test)" prop="clientId">
            <Input v-model="formValidate.clientId" placeholder="" readonly>
              <div slot="append" @click="check">测试</div>
            </Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="username(用于人工校验)" prop="username">
            <Input v-model="formValidate.username" placeholder="" readonly></Input> </FormItem
        ></Col>
        <Col span="12">
          <FormItem label="password(用于人工校验)" prop="password">
            <Input v-model="formValidate.password" placeholder="" readonly></Input>
          </FormItem>
        </Col>
      </Row>
      <FormItem label="云猫或终端编号" prop="remarks">
        <Input
          v-model="formValidate.remarks"
          type="textarea"
          :autosize="{ minRows: 15, maxRows: 30 }"
          placeholder="请粘贴云猫或终端编号，每一行为一个，如：
GEC610023020026
GEC610023020027
GEC610023020028
GEC610023020029
GEC610023020030
GEC610023020031
GEC610023020032"
        ></Input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button @click="cancel">取消</Button>
      <Button type="warning" @click="reset" style="margin-left: 8px">重置</Button>
      <Button type="primary" @click="submit">提交</Button>
    </div>
  </Modal>
</template>

<style lang='less' scoped>
/deep/ .ivu-input-group-append {
  background-color: #2e8cf0;
  color: white;
  cursor: pointer;
}
</style>