<style lang="less">
@import './login.less';
</style>

<template>
  <div class="login" @keydown.enter="handleSubmit">
    <div class="login-con">
      <Card :bordered="false">
        <p slot="title">
          <Icon type="log-in"></Icon>
          欢迎登录
        </p>
        <div class="form-con">
          <Form ref="loginForm" :model="form" :rules="rules">
            <FormItem prop="userName">
              <Input v-model="form.userName" placeholder="请输入用户名">
                <span slot="prepend">
                  <Icon :size="16" type="person"></Icon>
                </span>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" placeholder="请输入密码">
                <span slot="prepend">
                  <Icon :size="14" type="locked"></Icon>
                </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" :loading="loading" type="primary" long>
                <span v-if="!loading">登录</span>
                <span v-else>登录中...</span>
              </Button>
            </FormItem>
          </Form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import util from '@/libs/util.js'

export default {
  data() {
    return {
      loading: false,
      form: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    localStorage.clear()
  },
  methods: {
    handleSubmit() {
      let _self = this
      // 跳过登录?
      let judgeLogin = false
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          judgeLogin && _self.$router.push({ name: 'tabletable_index' })
          judgeLogin ||
            this.$api.app
              .login({ login_name: this.form.userName, password: this.form.password })
              .then((value) => {
                const datas = value
                if (datas.data && datas.data.errno) {
                  // 登录验证失败
                  _self.$Message.error(datas.data.errmsg)
                  _self.loading = false
                } else {
                  _self.$util.info('login success', datas)
                  _self.loading = true
                  localStorage.setItem('user', datas.login_name)
                  localStorage.setItem('token', datas.token)
                  localStorage.setItem('menuList', JSON.stringify(datas.menu))
                  localStorage.setItem('dicts', JSON.stringify(datas.dicts))
                  localStorage.setItem('username', datas.name)
                  // _self.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                  let menuList = util.reloadMenu(datas.menu)
                  _self.$store.commit('updateMyMenulist', menuList)
                  _self.$store.commit('mountMyMenulist', _self)
                  _self.$router.addRoutes(menuList)
                  _self.$router.push({
                    name: 'home_index'
                  })
                }
              })
              .catch((reason) => {
                _self.$Message.error(reason.errmsg)
                _self.loading = false
              })
          // util.post(
          //   this,
          //   'admin/sys_user/login',
          //   { login_name: this.form.userName, password: this.form.password },
          //   function (datas) {

          //   }
          // )
        }
      })
    }
  }
}
</script>

<style>
</style>
