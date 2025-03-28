/*
 * @Autor: linxu
 * @Date: 2023-04-13 16:19:17
 * @LastEditors: linxu
 * @LastEditTime: 2023-04-13 16:59:00
 * @Description:
 */
const Base = require('./base.js')
const fs = require('fs')
const path = require('path')
module.exports = class extends Base {
  async indexAction() {
    return this.success()
  }

  /**
   * 保存文件
   * @returns {Promise.<void>}
   */
  async saveFileAction() {
    const file = this.ctx.file('file') // 获取file信息
    const reader = fs.createReadStream(file.path) // 要被拷贝的源文件
    const stream = fs.createWriteStream(
      path.join(think.ROOT_PATH, 'www/static/upload', file.name)
    ) // 写入数据位置，名字
    reader.pipe(stream) // 文件被添加到 uploadImg文件夹
    file.path = think.ROOT_PATH + '../../www/static/upload' + file.name
    const data = {}
    data.url = '/static/upload/' + file.name
    this.body = {
      code: 0,
      data: data,
      msg: '上传图片成功',
    }
  }
}
