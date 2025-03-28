/*
 * @Autor: linxu
 * @Date: 2023-03-07 10:23:40
 * @LastEditors: linxu
 * @LastEditTime: 2023-04-14 10:52:04
 * @Description:
 */

const Base = require('./base.js')
module.exports = class extends Base {
  async indexAction() {
    return this.display()
  }

  /***
   * 查询所有宣传页数据
   */
  async allDataAction() {
    const data = await this.model('wx_leaflet', 'mysql_wx').allData()
    // const res = this.ctx.res
    // res.setHeader('Content-Type', 'application/json')
    return this.success(data)
  }

  /***
   * 新增宣传页数据信息
   */
  async addDataAction() {
    /**
     *
     * this.post():
     * -title: 名称
     * -desc: 描述
     * -keyword: 关键词
     * -img: 封面图片url
     * -content: 内容 富文本html
     */
    const param = this.post()
    await this.model('wx_leaflet', 'mysql_wx').addData(param)
    return this.success()
  }

  /***
   * 编辑宣传页数据信息
   */
  async updateDataAction() {
    /**
     *
     * this.post():
     * -id: 宣传数据id (必填)
     * -title: 名称
     * -desc: 描述
     * -keyword: 关键词
     * -img: 封面图片url
     * -content: 内容 富文本html
     */
    const param = this.post()
    if (think.isEmpty(param.id)) {
      return this.fail(9991, '参数错误')
    }
    await this.model('wx_leaflet', 'mysql_wx').updateData(param)
    return this.success()
  }

  /***
   * 通过id删除宣传页数据
   */
  async delDataAction() {
    const param = this.post()
    if (think.isEmpty(param.id)) {
      return this.fail(9991, '参数错误')
    }
    await this.model('wx_leaflet', 'mysql_wx').delData(param.id)
    return this.success()
  }

  /***
   * 通过id查询单条宣传页数据
   */
  async getDataAction() {
    const param = this.post()
    if (think.isEmpty(param.id)) {
      return this.fail(9991, '参数错误')
    }
    const data = await this.model('wx_leaflet', 'mysql_wx').getData(param.id)
    return this.success(data)
  }
}
