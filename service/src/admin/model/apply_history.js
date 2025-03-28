/*
 * @Autor: linxu
 * @Date: 2023-03-07 10:23:40
 * @LastEditors: linxu
 * @LastEditTime: 2023-03-09 10:23:12
 * @Description:
 */
'use strict'

module.exports = class extends think.Model {
  async addData(param) {
    param.applyTime = think.datetime()
    param.id = think.uuid('v1')
    await this.add(param)
  }

  async delData(param) {
    await this.where({ id: param.id }).delete()
  }

  async pageData(param) {
    let sql = this.page(param.currentPage, param.pageSize).order(
      'applyTime desc'
    )
    if (!think.isEmpty(param.time)) {
      sql = sql.where({ applyTime: ['like', '%' + param.time + '%'] })
    }
    const data = await sql.countSelect()
    return data
  }

  async allData() {
    const data = await this.select()
    return data
  }

  async getData(id) {
    return await this.where({ id: id }).find()
  }
}
