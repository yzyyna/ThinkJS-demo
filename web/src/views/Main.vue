<style lang="less">
@import './main.less';
</style>
<template>
  <div class="main" :class="{ 'main-hide-text': shrink }">
    <div
      class="sidebar-menu-con"
      :style="{
        width: shrink ? '60px' : '200px',
        overflow: shrink ? 'visible' : 'auto'
      }"
    >
      <shrinkable-menu
        :shrink="shrink"
        @on-change="handleSubmenuChange"
        :theme="menuTheme"
        :before-push="beforePush"
        :open-names="openedSubmenuArr"
        :menu-list="menuList"
      >
        <div slot="top" class="logo-con">
          <img v-show="!shrink" src="../images/logo.png" key="max-logo" />
          <img v-show="shrink" src="../images/logo-mini.png" key="min-logo" />
        </div>
      </shrinkable-menu>
    </div>
    <div class="main-header-con" :style="{ paddingLeft: shrink ? '60px' : '200px' }">
      <div class="main-header">
        <div class="navicon-con">
          <Button
            :style="{
              transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'
            }"
            type="text"
            @click="toggleClick"
          >
            <Icon type="md-menu" size="32"></Icon>
          </Button>
        </div>
        <div class="header-middle-con">
          <div class="main-breadcrumb">
            <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
          </div>
        </div>
        <div class="header-avator-con">
          <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
          <lock-screen></lock-screen>
          <!-- 暂未开发消息模块,暂时隐藏(demon3443002624@outlook.com,2023-6-6 17:08:29) -->
          <!-- <message-tip v-model="mesCount"></message-tip> -->
          <!-- 更新 iview 后有 bug ,暂时隐藏(demon3443002624@outlook.com,2023-07-11 11:46:14) -->
          <!-- <theme-switch></theme-switch> -->

          <div class="user-dropdown-menu-con">
            <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
              <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                <a href="javascript:void(0)">
                  <span class="main-user-name">{{ userName }}</span>
                  <Icon type="md-arrow-dropdown"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem name="ownSpace">个人中心</DropdownItem>
                  <DropdownItem name="loginout" divided>退出登录</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Avatar src="" style="background: #619fe7; margin-left: 0px" size="default">
                <Icon type="ios-eye-outline"></Icon>
              </Avatar>
            </Row>
          </div>
        </div>
      </div>
      <div class="tags-con">
        <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
      </div>
    </div>
    <div
      class="single-page-con"
      :style="{
        left: shrink ? '60px' : '200px',
        width: shrink ? 'calc(100% - 60px)' : 'calc(100% - 200px)'
      }"
    >
      <div class="single-page">
        <keep-alive :include="cachePage">
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script>
import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue'
import tagsPageOpened from './main-components/tags-page-opened.vue'
import breadcrumbNav from './main-components/breadcrumb-nav.vue'
import fullScreen from './main-components/fullscreen.vue'
import lockScreen from './main-components/lockscreen/lockscreen.vue'
import messageTip from './main-components/message-tip.vue'
import themeSwitch from './main-components/theme-switch/theme-switch.vue'
import util from '@/libs/util.js'

export default {
  components: {
    shrinkableMenu,
    tagsPageOpened,
    breadcrumbNav,
    fullScreen,
    lockScreen,
    messageTip,
    themeSwitch
  },
  data() {
    return {
      shrink: false,
      userName: '',
      isFullScreen: false,
      openedSubmenuArr: this.$store.state.app.openedSubmenuArr
    }
  },
  computed: {
    menuList() {
      return this.$store.state.app.menuList
    },
    pageTagsList() {
      return this.$store.state.app.pageOpenedList // 打开的页面的页面对象
    },
    currentPath() {
      return this.$store.state.app.currentPath // 当前面包屑数组
    },
    avatorPath() {
      return localStorage.avatorImgPath
    },
    cachePage() {
      return this.$store.state.app.cachePage
    },
    lang() {
      return this.$store.state.app.lang
    },
    menuTheme() {
      return this.$store.state.app.menuTheme
    },
    mesCount() {
      return this.$store.state.app.messageCount
    }
  },
  methods: {
    init() {
      this.$store.commit('mountMyMenulist', this)
      let pathArr = util.setCurrentPath(this, this.$route.name)

      if (pathArr.length >= 2) {
        this.$store.commit('addOpenSubmenu', pathArr[1].name)
      }
      this.userName = localStorage.getItem('user')
      let messageCount = 3
      this.messageCount = messageCount.toString()
      this.checkTag(this.$route.name)
      this.$store.commit('setMessageCount', 3)
    },
    toggleClick() {
      this.shrink = !this.shrink
    },
    handleClickUserDropdown(name) {
      if (name === 'ownSpace') {
        util.openNewPage(this, 'ownspace_index')
        this.$router.push({
          name: 'ownspace_index'
        })
      } else if (name === 'loginout') {
        // 退出登录
        this.$store.commit('logout', this)
        this.$store.commit('clearOpenedSubmenu')
        // this.$router.push({
        //     name: 'login'
        // });
        window.location.href = '/'
      }
    },
    checkTag(name) {
      let openpageHasTag = this.pageTagsList.some((item) => {
        if (item.name === name) {
          return true
        }
      })
      if (!openpageHasTag) {
        //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
        util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {})
      }
    },
    handleSubmenuChange(val) {},
    beforePush(name) {
      // if (name === 'accesstest_index') {
      //     return false;
      // } else {
      //     return true;
      // }
      return true
    },
    fullscreenChange(isFullScreen) {}
  },
  watch: {
    $route(to) {
      this.$store.commit('setCurrentPageName', to.name)
      let pathArr = util.setCurrentPath(this, to.name)
      if (pathArr.length > 2) {
        this.$store.commit('addOpenSubmenu', pathArr[1].name)
      }
      this.checkTag(to.name)
      localStorage.currentPageName = to.name
    },
    lang() {
      util.setCurrentPath(this, this.$route.name) // 在切换语言时用于刷新面包屑
    }
  },
  mounted() {
    this.init()
  },
  created() {
    // 显示打开的页面的列表
    this.$store.commit('setOpenedList')
  }
}
</script>
