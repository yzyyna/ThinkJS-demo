import Main from '@/views/Main.vue'
import util from '@/libs/util'

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: '孚创运维工具平台 - 登录'
  },
  component: (resolve) => {
    require(['@/views/login.vue'], resolve)
  }
}

export const page404 = {
  path: '/*',
  name: 'error-404',
  meta: {
    title: '404-页面不存在'
  },
  component: (resolve) => {
    require(['@/views/error-page/404.vue'], resolve)
  }
}

export const page403 = {
  path: '/403',
  meta: {
    title: '403-权限不足'
  },
  name: 'error-403',
  component: (resolve) => {
    require(['@//views/error-page/403.vue'], resolve)
  }
}

export const page500 = {
  path: '/500',
  meta: {
    title: '500-服务端错误'
  },
  name: 'error-500',
  component: (resolve) => {
    require(['@/views/error-page/500.vue'], resolve)
  }
}

export const locking = {
  path: '/locking',
  name: 'locking',
  component: (resolve) => {
    require(['@/views/main-components/lockscreen/components/locking-page.vue'], resolve)
  }
}

export const pageCustomers = [
  {
    path: '/fw-report-detail-customer',
    title: '电子服务报告',
    name: 'FwReportDetailCustomerRoute',
    component: (resolve) => {
      require(['@/views/fw-report/report-detail-export'], resolve)
    }
  }
]

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  children: [
    {
      path: 'home',
      title: {
        i18n: 'home'
      },
      name: 'home_index',
      component: (resolve) => {
        require(['@/views/sys/home.vue'], resolve)
      }
    },
    {
      path: 'ownspace',
      title: '个人中心',
      name: 'ownspace_index',
      component: (resolve) => {
        require(['@/views/sys/own-space.vue'], resolve)
      }
    },
    {
      path: 'message',
      title: '消息中心',
      name: 'message_index',
      component: (resolve) => {
        require(['@/views/demo/message/message.vue'], resolve)
      }
    },
    {
      path: 'fw-report-detail',
      title: '服务报告详情',
      name: 'FwReportDetailRoute',
      component: (resolve) => {
        require(['@/views/fw-report/report-detail'], resolve)
      }
    },
    {
      path: 'fw-report-detail-export',
      title: '预览',
      name: 'FwReportDetailExportRoute',
      component: (resolve) => {
        require(['@/views/fw-report/report-detail-export'], resolve)
      }
    }
  ]
}

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export let appRouter = []

if (localStorage.getItem('user')) {
  if (localStorage.getItem('menuList')) {
    let list = JSON.parse(localStorage.getItem('menuList'))
    appRouter = util.reloadMenu(list)
  }
}

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
  loginRouter,
  otherRouter,
  locking,
  ...appRouter,
  ...pageCustomers,
  page500,
  page403,
  page404
]
