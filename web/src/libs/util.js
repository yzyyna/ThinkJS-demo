import axios from 'axios'
import env from '../../build/env'
import semver from 'semver'
import packJson from '../../package.json'
import Main from '@/views/Main.vue'
import dayjs from 'dayjs'
import { post } from '@/api/axios'
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

let util = {}
util.title = function (title) {
  title = title || '孚创运维工具平台'
  window.document.title = title
}

const ajaxUrl = UPLOAD_IMG_URL

util.ajax = axios.create({
  baseURL: ajaxUrl,
  timeout: 30000
})

util.post = function (vm, url, param, cb) {
  // 统一接口请求
  post(param, url).then((value) => cb(value))
  // let axiosIns = axios.create({
  //   baseURL: ajaxUrl,
  //   timeout: 30000,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'x-token': localStorage.getItem('token')
  //   }
  // })
  // axiosIns
  //   .post(url, param)
  //   .then((res) => {
  //     vm.loading = false
  //     if (res && res.status == 200 && res.data && res.data.errno == 0) {
  //       cb(res.data.data)
  //     } else {
  //       vm.$Message.destroy()
  //       util.changeModalLoading(vm)
  //       if (res.data && res.data.errMsg && res.data.errMsg.length > 0) {
  //         vm.$Message.error(res.data.errMsg)
  //       } else {
  //         vm.$Message.error('请求数据异常，请稍后重试！')
  //       }
  //     }
  //   })
  //   .catch((err) => {
  //     vm.$Message.destroy()
  //     util.changeModalLoading(vm)
  //     vm.$Message.error('请求数据异常，请稍后重试！')
  //   })
}

util.imageUpload = function (vm, file, cb) {
  vm.$Notice.info({ title: '图片上传中，请耐心等待...', duration: 0 })
  var formData = new FormData()
  formData.append('file', file)
  // util.post(vm, 'admin/common/uploadToken', {}, function (datas) {
  //   formData.append('token', datas.token)
  axios({
    url: ajaxUrl + '/admin/upload/saveFile',
    method: 'POST',
    data: formData,
    headers: {
      'x-token': localStorage.getItem('token')
    }
  })
    .then((result) => {
      vm.$Notice.destroy()
      cb(result.data.data.url)
    })
    .catch((err) => {
      vm.$Notice.destroy()
      vm.$Notice.error({ title: '上传图片出错，请重试！', duration: 2 })
    })
  // })
}

util.changeModalLoading = function (vm, flag) {
  if (flag) {
    vm.modalLoading = true
    vm.modalCanBut = false
  } else {
    vm.modalLoading = false
    vm.modalCanBut = true
    vm.loading = false
  }
}

util.copy = function (datas) {
  let obj = {}
  obj = JSON.parse(JSON.stringify(datas))
  return obj
}

util.showDictLabel = function (type, value) {
  let dicts = localStorage.getItem('dicts')
  if (dicts) {
    dicts = JSON.parse(dicts)
    if (dicts && dicts[type] && dicts[type][value]) {
      return dicts[type][value]
    }
  }
  return '-'
}

util.showDictList = function (type) {
  let list = []
  let dicts = localStorage.getItem('dicts')
  if (dicts) {
    dicts = JSON.parse(dicts)
    if (dicts && dicts[type]) {
      let obj = dicts[type]
      for (var key in obj) {
        list.push({ value: key, label: obj[key] })
      }
    }
  }
  return list
}

util.inOf = function (arr, targetArr) {
  let res = true
  arr.forEach((item) => {
    if (targetArr.indexOf(item) < 0) {
      res = false
    }
  })
  return res
}

util.oneOf = function (ele, targetArr) {
  if (targetArr.indexOf(ele) >= 0) {
    return true
  } else {
    return false
  }
}

util.showThisRoute = function (itAccess, currentAccess) {
  if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
    return util.oneOf(currentAccess, itAccess)
  } else {
    return itAccess === currentAccess
  }
}

util.getRouterObjByName = function (routers, name) {
  if (!name || !routers || !routers.length) {
    return null
  }
  // debugger;
  let routerObj = null
  for (let item of routers) {
    if (item.name === name) {
      return item
    }
    routerObj = util.getRouterObjByName(item.children, name)
    if (routerObj) {
      return routerObj
    }
  }
  return null
}

util.handleTitle = function (vm, item) {
  if (typeof item.title === 'object') {
    return vm.$t(item.title.i18n)
  } else {
    return item.title
  }
}

util.setCurrentPath = function (vm, name) {
  let title = ''
  let isOtherRouter = false
  vm.$store.state.app.routers.forEach((item) => {
    if (item.children.length === 1) {
      if (item.children[0].name === name) {
        title = util.handleTitle(vm, item)
        if (item.name === 'otherRouter') {
          isOtherRouter = true
        }
      }
    } else {
      item.children.forEach((child) => {
        if (child.name === name) {
          title = util.handleTitle(vm, child)
          if (item.name === 'otherRouter') {
            isOtherRouter = true
          }
        }
      })
    }
  })
  let currentPathArr = []
  if (name === 'home_index') {
    currentPathArr = [
      {
        title: util.handleTitle(
          vm,
          util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')
        ),
        path: '',
        name: 'home_index'
      }
    ]
  } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
    currentPathArr = [
      {
        title: util.handleTitle(
          vm,
          util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')
        ),
        path: '/home',
        name: 'home_index'
      },
      {
        title: title,
        path: '',
        name: name
      }
    ]
  } else {
    let currentPathObj = vm.$store.state.app.routers.filter((item) => {
      if (item.children.length <= 1) {
        return item.children[0].name === name
      } else {
        let i = 0
        let childArr = item.children
        let len = childArr.length
        while (i < len) {
          if (childArr[i].name === name) {
            return true
          }
          i++
        }
        return false
      }
    })[0]
    if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
      currentPathArr = [
        {
          title: '首页',
          path: '',
          name: 'home_index'
        }
      ]
    } else if (
      currentPathObj.children.length <= 1 &&
      !currentPathObj.children[0].icon &&
      currentPathObj.name !== 'home'
    ) {
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home_index'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: name
        }
      ]
    } else {
      let childObj = currentPathObj.children.filter((child) => {
        return child.name === name
      })[0]
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home_index'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: currentPathObj.name
        },
        {
          title: childObj.title,
          path: currentPathObj.path + '/' + childObj.path,
          name: name
        }
      ]
    }
  }
  vm.$store.commit('setCurrentPath', currentPathArr)

  return currentPathArr
}

util.openNewPage = function (vm, name, argument, query) {
  let pageOpenedList = vm.$store.state.app.pageOpenedList
  let openedPageLen = pageOpenedList.length
  let i = 0
  let tagHasOpened = false
  while (i < openedPageLen) {
    if (name === pageOpenedList[i].name) {
      // 页面已经打开
      vm.$store.commit('pageOpenedList', {
        index: i,
        argument: argument,
        query: query
      })
      tagHasOpened = true
      break
    }
    i++
  }
  if (!tagHasOpened) {
    let tag = vm.$store.state.app.tagsList.filter((item) => {
      if (item.children) {
        return name === item.children[0].name
      } else {
        return name === item.name
      }
    })
    tag = tag[0]
    if (tag) {
      tag = tag.children ? tag.children[0] : tag
      if (argument) {
        tag.argument = argument
      }
      if (query) {
        tag.query = query
      }
      vm.$store.commit('inCreateTag', tag)
    }
  }
  vm.$store.commit('setCurrentPageName', name)
}

util.toDefaultPage = function (routers, name, route, next) {
  let len = routers.length
  let i = 0
  let notHandle = true
  while (i < len) {
    if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
      route.replace({
        name: routers[i].children[0].name
      })
      notHandle = false
      next()
      break
    }
    i++
  }
  if (notHandle) {
    next()
  }
}

util.fullscreenEvent = function (vm) {
  vm.$store.commit('initCachePage')
  // 权限菜单过滤相关
  vm.$store.commit('updateMenulist')
  // 全屏相关
}

util.checkUpdate = function (vm) {
  axios.get('https://api.github.com/repos/iview/iview-admin/releases/latest').then((res) => {
    let version = res.data.tag_name
    vm.$Notice.config({
      duration: 0
    })
    if (semver.lt(packJson.version, version)) {
      vm.$Notice.info({
        title: 'iview-admin更新啦',
        desc:
          '<p>iView-admin更新到了' +
          version +
          '了，去看看有哪些变化吧</p><a style="font-size:13px;" href="https://github.com/iview/iview-admin/releases" target="_blank">前往github查看</a>'
      })
    }
  })
}

util.reloadMenu = function (list) {
  let _menuList = []
  list.forEach((item, index) => {
    if (!item.children || item.children.length == 0) {
      let _item = {}
      _item.path = '/' + item.name
      _item.icon = item.icon
      _item.name = item.name
      _item.title = item.title
      _item.component = Main
      _item.children = [
        {
          path: 'index',
          name: item.name + '_index',
          title: item.title,
          component: (resolve) => {
            require(['@/views/' + item.href + '.vue'], resolve)
          }
        }
      ]
      _menuList.push(_item)
    } else {
      let _item = {}
      _item.path = '/' + item.name
      _item.icon = item.icon
      _item.name = item.name
      _item.title = item.title
      _item.component = Main
      _item.children = []
      item.children.forEach((item2, index) => {
        _item.children.push({
          path: item2.name,
          icon: item2.icon,
          name: item2.name,
          title: item2.title,
          component: (resolve) => {
            require(['@/views/' + item2.href + '.vue'], resolve)
          }
        })
      })
      _menuList.push(_item)
    }
  })
  return _menuList
}

/**
 * 下载文件
 * @author demon3443002624@outlook.com
 */
util.download = (res, type, filename) => {
  // 创建blob对象，解析流数据
  const blob = new Blob([res], {
    // 设置返回的文件类型
    // type: 'application/pdf;charset=UTF-8' 表示下载文档为pdf，如果是word则设置为msword，excel为excel
    type: type
  })
  // 这里就是创建一个a标签，等下用来模拟点击事件
  const a = document.createElement('a')
  // 兼容webkix浏览器，处理webkit浏览器中href自动添加blob前缀，默认在浏览器打开而不是下载
  const URL = window.URL || window.webkitURL
  // 根据解析后的blob对象创建URL 对象
  const herf = URL.createObjectURL(blob)
  // 下载链接
  a.href = herf
  // 下载文件名,如果后端没有返回，可以自己写a.download = '文件.pdf'
  a.download = filename
  document.body.appendChild(a)
  // 点击a标签，进行下载
  a.click()
  // 收尾工作，在内存中移除URL 对象
  document.body.removeChild(a)
  window.URL.revokeObjectURL(herf)
}
util.info = (title, content) => {
  console.info(`%c✅****** ${title} \n`, 'color:#00d26a;font-weight:bold;font-size:.1rem', content)
}
util.error = (title, content) => {
  console.info(`%c❗****** ${title} \n`, 'color:#f5222d;font-weight:bold;font-size:.1rem', content)
}

/**
 * 格式化后端传输时间
 * @author Demon3443002624@qq.com
 * @param {String} '/Date(1637294420000)/'
 * @returns {moment}
 */
util.formatTime = (timeStr) => {
  return dayjs(new Date(Number(timeStr.replace(`/Date(`, '').replace(`)/`, ''))))
}

// 机组状态返回值 对应显示文本和颜色
util.showByCrewStatus = function (i) {
  // 0离线 1停机  2警告 3报警 4运行
  const color = ['#808080', '#fff', '#fff600', '#ff0000', '#5cf548']
  const text = ['离线', '停机', '警告', '故障', '运行']
  return {
    color: color[i],
    text: text[i]
  }
}

/**
 * 判断空对象
 */
util.checkNullObject = function (obj) {
  const result =
    Reflect.ownKeys(obj).length === 0 &&
    Object.keys(obj).length === 0 &&
    '{}' === JSON.stringify(obj)
  return result
}

/**
 * HTML DOM 元素转为 canvas 图像,导出为 PDF
 * @param {Object} props title:文件名,contentId:#id | .class
 * @param {Function} cb 回调方法
 */
util.htmlToPdf = (props, cb) => {
  var title = props.title
  html2Canvas(document.querySelector(props.contentId), {
    // allowTaint: true,
    useCORS: true
  })
    .then(function (canvas) {
      let contentWidth = canvas.width
      let contentHeight = canvas.height
      let pageHeight = (contentWidth / 592.28) * 841.89
      let leftHeight = contentHeight
      let position = 0
      let imgWidth = 595.28
      let imgHeight = (592.28 / contentWidth) * contentHeight
      let pageData = canvas.toDataURL('image/jpeg', 1.0)
      let PDF = new JsPDF('', 'pt', 'a4')
      if (leftHeight < pageHeight) {
        PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
      } else {
        while (leftHeight > 0) {
          PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
          leftHeight -= pageHeight
          position -= 841.89
          if (leftHeight > 0) {
            PDF.addPage()
          }
        }
      }
      PDF.save(title + '.pdf')
    })
    .finally(() => {
      cb()
    })
}

// 报警类型对应参数列表
util.alertTypeMapping = {
  发电电压低: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '发电UBC'],
    description: '发电电压UBC：正常400V，低于350V',
    max: [],
    min: ['发电UBC']
  },
  发电电压高: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '发电UBC'],
    description: '发电电压UBC：正常400V，高于450V',
    max: ['发电UBC'],
    min: []
  },
  冷却水温高: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '水温', '进风阻力', '冷却水状态'],
    description: '水温高于95度标记',
    max: ['水温'],
    min: []
  },
  油压低: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '油压', '油底壳机油液位'],
    description: '油压低0.15mpa',
    max: [],
    min: ['油压']
  },
  转速高: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '发电UBC'],
    description: '正常1500，高于1650标记',
    max: ['转速'],
    min: []
  },
  发电电流高: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '发电UBC'],
    description: '高于额定电流的110%标记（根据控制器的发电参数设置）',
    max: [],
    min: ['电流IA', '电流IB', '电流IC']
  },
  超功率: {
    params: ['转速', '有功功率', '电流IA', '电流IB', '电流IC', '发电UBC'],
    description: '高于额定功率的110%标记（根据控制器的发电参数设置）',
    max: ['有功功率'],
    min: []
  },
  充电电压低: {
    params: ['转速', '电瓶电压', '充发电机电压'],
    description: '以24V为标准，低于18V',
    max: [],
    min: ['充发电机电压']
  },
  充电电压高: {
    params: ['转速', '电瓶电压', '充发电机电压'],
    description: '以24V为标准，高于32V标记',
    max: ['充发电机电压'],
    min: []
  }
}

util.alertParamsSetting = {
  paramsList: [
    {
      label: '转速',
      type: 'line',
      yIndex: 0,
      data: []
    },
    {
      label: '油压',
      type: 'line',
      yIndex: 7,
      data: []
    },
    {
      label: '水温',
      type: 'line',
      yIndex: 10,
      data: []
      // limit: ['1', '3']
    },
    {
      label: '油温',
      type: 'line',
      yIndex: 0,
      data: []
      // limit: ['1', '3']
    },
    {
      label: '电瓶电压1',
      type: 'line',
      yIndex: 6,
      data: []
    },
    {
      label: '燃油位',
      type: 'line',
      yIndex: 10,
      data: []
      // limit: ['1', '3']
    },
    {
      label: '充发电机电压',
      type: 'line',
      yIndex: 6,
      data: []
      // limit: ['1', '3']
    },
    {
      label: '电瓶启动电流',
      type: 'line',
      yIndex: 8,
      data: []
    },
    {
      label: '执行器电流',
      type: 'line',
      yIndex: 8,
      data: []
      // limit: ['2']
    },
    {
      label: '电瓶电压2',
      type: 'line',
      yIndex: 6,
      data: []
    },
    {
      label: '充电器电流',
      type: 'line',
      yIndex: 8,
      data: []
      // limit: ['2', '3']
    },
    {
      label: 'GOV输出百分比',
      type: 'line',
      yIndex: 10,
      data: []
    },
    {
      label: '发电UA',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '发电UB',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '发电UC',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '发电UAB',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '发电UBC',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '发电UCA',
      type: 'line',
      yIndex: 1,
      data: []
    },
    {
      label: '电流IA',
      type: 'line',
      yIndex: 2,
      data: []
    },
    {
      label: '电流IB',
      type: 'line',
      yIndex: 2,
      data: []
    },
    {
      label: '电流IC',
      type: 'line',
      yIndex: 2,
      data: []
    },
    {
      label: '有功功率',
      type: 'line',
      yIndex: 3,
      data: []
    },
    {
      label: '无功功率',
      type: 'line',
      yIndex: 4,
      data: []
    },
    {
      label: '发电频率',
      type: 'line',
      yIndex: 0,
      data: []
    },
    {
      label: '开关量输入',
      type: 'line',
      yIndex: 9,
      data: [],
      children: [
        '开关量输入1',
        '开关量输入2',
        '开关量输入3',
        '开关量输入4',
        '开关量输入5',
        '开关量输入6',
        '开关量输入7'
      ]
    },
    {
      label: '开关量输出',
      type: 'line',
      yIndex: 9,
      data: [],
      children: [
        '开关量输出1',
        '开关量输出2',
        '开关量输出3',
        '开关量输出4',
        '开关量输出5',
        '开关量输出6',
        '开关量输出7',
        '开关量输出8',
        '开关量输出9'
      ]
    },
    {
      label: '视在功率',
      type: 'line',
      yIndex: 5,
      data: []
    },
    {
      label: 'AVR输出百分比',
      type: 'line',
      yIndex: 10,
      data: []
    }
  ],
  chartYAxisItems: [
    {
      label: '转速',
      unit: ''
    },
    {
      label: '电压',
      unit: ''
    },
    {
      label: '电流',
      unit: ''
    },
    {
      label: '有功',
      unit: ''
    },
    {
      label: '无功',
      unit: ''
    },
    {
      label: '视在',
      unit: ''
    },
    {
      label: '电瓶电压',
      unit: ''
    },
    {
      label: '油压',
      unit: ''
    },
    {
      label: '启动电流',
      unit: ''
    },
    {
      label: '齿条位置',
      unit: ''
    },
    {
      label: '百分比',
      unit: ''
    }
  ],
  paramsSelect: ['转速', '油压', '油温', '电瓶电压1', '执行器电流']
}

// 校验图片上传文件 类型和大小
util.checkImgFile = (vm, file, size = 30) => {
  const isImg =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/jpeg' ||
    file.type === 'image/bmp' ||
    file.type === 'image/gif' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/pdf' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    file.type === 'application/vnd.ms-powerpoint'
  const isLt30M = file.size / 1024 <= size * 1024
  if (!isImg) {
    vm.$Message.error('上传文件格式有误!')
  }
  if (!isLt30M) {
    vm.$Message.error('上传文件大小不能超过 30MB!')
  }
  return isImg && isLt30M
}
export default util
