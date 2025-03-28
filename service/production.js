/*
 * @Autor: linxu
 * @Date: 2023-03-03 14:25:54
 * @LastEditors: linxu
 * @LastEditTime: 2023-04-13 16:34:52
 * @Description:
 */
const Application = require('thinkjs')

const instance = new Application({
  ROOT_PATH: __dirname,
  RESOURCE_PATH: __dirname,
  proxy: true, // use proxy
  env: 'production',
})

instance.run()
