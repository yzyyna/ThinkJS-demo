/*
 * @Autor: linxu
 * @Date: 2023-03-07 10:23:40
 * @LastEditors: linxu
 * @LastEditTime: 2023-04-14 10:50:54
 * @Description:
 */
'use strict'

module.exports = class extends think.Model {
  /***
   * 查询所有数据
   */
  async allData() {
    const data = await this.select()
    return data
  }

  /***
   * 新增宣传页数据
   */
  async addData(param) {
    const modelData = {}
    modelData.id = think.uuid('v1')
    if (param.title) {
      modelData.title = param.title
    }
    if (param.desc) {
      modelData.desc = param.desc
    }
    if (param.keyword) {
      modelData.keyword = param.keyword
    }
    if (param.img) {
      modelData.img = param.img
    }
    if (param.content) {
      modelData.content = param.content
    }
    return await this.add(modelData)
  }

  /***
   * 编辑宣传页数据
   */
  async updateData(param) {
    const id = param.id
    const modelData = {}
    if (param.title) {
      modelData.title = param.title
    }
    if (param.desc) {
      modelData.desc = param.desc
    }
    if (param.keyword) {
      modelData.keyword = param.keyword
    }
    if (param.img) {
      modelData.img = param.img
    }
    if (param.content) {
      modelData.content = param.content
    }
    return await this.where({ id: id }).update(modelData)
  }

  /***
   * 通过id删除数据
   */
  async delData(id) {
    return await this.where({ id: id }).delete()
  }

  /***
   * 通过id查询单条数据
   */
  async getData(id) {
    const data = await this.where({ id: id }).find()
    return data
  }
}
