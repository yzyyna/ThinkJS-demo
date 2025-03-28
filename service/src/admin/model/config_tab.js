/*
 * @Autor: linxu
 * @Date: 2023-03-06 16:55:57
 * @LastEditors: linxu
 * @LastEditTime: 2023-03-07 09:46:52
 * @Description: MQTT配置
 */
'use strict'

module.exports = class extends think.Model {
  async addData(param) {
    param.creatTime = think.datetime()
    // param.id=think.uuid('v1');
    await this.add(param)
  }

  async delData(param) {
    await this.where({ id: param.id }).delete()
  }

  async updateData(param) {
    const id = param.id
    delete param.id
    delete param.creatTime
    await this.where({ id: id }).update(param)
  }

  async pageData(param) {
    let sql = this.page(param.currentPage, param.pageSize).order(
      'creatTime desc'
    )
    if (!think.isEmpty(param.keyWord)) {
      sql = sql.where({ configName: ['like', '%' + param.keyWord + '%'] })
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

  async findByConfigName(config_name) {
    return await this.where({ configName: config_name }).find()
  }
}
