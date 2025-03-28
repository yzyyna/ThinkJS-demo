/*
 * @Autor: linxu
 * @Date: 2023-03-06 17:53:47
 * @LastEditors: linxu
 * @LastEditTime: 2023-03-09 17:46:20
 * @Description:
 */
const common = require('../../common/util/common.js')
const Base = require('./base.js')

module.exports = class extends Base {
  async indexAction() {
    return this.display()
  }

  async allDataAction() {
    const data = await this.model('config_tab').allData()
    return this.success(data)
  }

  async pageDataAction() {
    const param = this.post()
    const data = await this.model('config_tab').pageData(param)
    return this.success(data)
  }

  async addDataAction() {
    const param = this.post()
    const data = await this.model('config_tab').findByConfigName(
      param.configName
    )
    if (!think.isEmpty(data)) {
      return this.fail(9992, '配置名称命名重复！')
    }
    await this.model('config_tab').addData(param)
    return this.success()
  }

  async updateDataAction() {
    const param = this.post()
    await this.model('config_tab').updateData(param)
    return this.success()
  }

  async delDataAction() {
    const param = this.post()
    await this.model('config_tab').delData(param)
    return this.success()
  }

  async checkConfigAction() {
    const param = this.post()
    const deviceId = param.deviceId.split(',')[0]
    const data = {}
    data.ClientID = `${param.groupId}@@@${deviceId}`
    data.UserName = `Signature|${param.accessKey}|${param.entityId}`
    data.Password = common.hmacsha1(data.ClientID, param.secretKey)
    return this.success(data)
  }
}
