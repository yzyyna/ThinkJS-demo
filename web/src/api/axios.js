/*
 * @Autor: linxu
 * @Date: 2023-03-10 09:17:03
 * @LastEditors: linxu
 * @LastEditTime: 2023-06-08 16:16:00
 * @Description:
 */
import Axios from 'axios'
import { Message } from 'iview'
import config from '../../build/config'
// import util from '@/libs/util'

const base_url ='http://tool.fortrust.cn/api'
  // config.env.indexOf('dev') > -1 ? 'http://192.168.110.133:8360' : 'http://tool.fortrust.cn/api'
window.UPLOAD_IMG_URL = base_url
const timeout = 30000
const axios = Axios.create({
  baseURL: base_url,
  timeout: timeout
})

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // util.info(`${config.url} <--- request`, config)
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // util.info(`${response.config.url} response --->`, response)
    if (response && response.status == 200 && response.data && response.data.errno == 0) {
      return response.data.data
    }
    // file type
    else if (response.config.responseType === 'blob') {
      return response
    }
    // something error(back-end error)
    else {
      // Message.error('Request failed,please check the network...')
      return Promise.reject(response.data)
    }
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    Message.error('Request failed,please check the network...')
    return Promise.reject(error)
  }
)

const post = (params, url, otherConfig = {}) =>
  axios({
    method: 'post',
    data: params,
    url: url,
    headers: {
      'Content-Type': otherConfig.contentType || 'application/json;charset=UTF-8',
      'x-token': localStorage.getItem('token')
    },
    responseType: otherConfig.responseType || 'json'
  })

export { post }
