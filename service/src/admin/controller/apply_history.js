const common = require('../../common/util/common.js')
const Base = require('./base.js')

module.exports = class extends Base {
  async indexAction() {
    return this.display()
  }

  async allDataAction() {
    const data = await this.model('apply_history').allData()
    return this.success(data)
  }

  async pageDataAction() {
    const param = this.post()
    const data = await this.model('apply_history').pageData(param)
    return this.success(data)
  }

  async addDataAction() {
    const param = this.post()

    param.applyUserId = this.userInfo().id
    param.applyUserName = this.userInfo().login_name

    const list = param.deviceIds.split(',')
    param.applyNum = list.length

    if (think.isEmpty(list)) {
      return this.fail(9991, '申请账号不能为空！')
    }
    await this.model('apply_history').addData(param)
    return this.success()
  }

  async delDataAction() {
    const param = this.post()
    const data = await this.model('apply_history').getData(param.id)
    if (think.isEmpty(data)) {
      return this.fail(9990, '没有查询到该记录！')
    }
    await this.model('apply_history').delData(param)
    return this.success()
  }

  async downloadFileAction() {
    const param = this.post()
    const data = await this.model('apply_history').getData(param.id)
    if (think.isEmpty(data)) {
      return this.fail(9990, '没有查询到该记录！')
    }
    const configData = await this.model('config_tab').getData(data.confId)

    const deviceIdArr = data.deviceIds.split(',')
    const list = []
    for (let i = 0; i < deviceIdArr.length; i++) {
      const rowObj = {
        index: i + 1,
        deviceId: deviceIdArr[i],
        Topic: configData.topic,
        AccessKey: configData.accessKey,
        SecretKey: configData.secretKey,
        GroupId: configData.groupId,
        EntityId: configData.entityId,
        URL: configData.url,
      }
      rowObj.ClientID = `${rowObj.GroupId}@@@${rowObj.deviceId}`
      rowObj.UserName = `Signature|${rowObj.AccessKey}|${rowObj.EntityId}`
      rowObj.Password = common.hmacsha1(rowObj.ClientID, rowObj.SecretKey)
      list.push(rowObj)
    }

    const fields = [
      'index',
      'deviceId',
      'Topic',
      'AccessKey',
      'SecretKey',
      'GroupId',
      'UserName',
      'Password',
      'URL',
    ]
    const titles = {
      index: '序号',
      deviceId: '云猫标识号',
      Topic: 'Topic',
      AccessKey: 'AccessKey',
      SecretKey: 'SecretKey',
      GroupId: 'GroupId',
      UserName: 'UserName',
      Password: 'Password',
      URL: 'URL',
    }
    // 文件名
    const time = data.applyTime
      .replace(/-/g, '')
      .replace(' ', '')
      .replace(/:/g, '')
    const filename = `${time}_${data.applyNum}`
    // 表数据
    const content = []
    const title = fields.map((item) => {
      return titles[item]
    })
    // 添加表头
    content.push(title)
    // 再把每一行数据加进去
    for (let f = 0; f < list.length; f++) {
      const text = list[f]
      const arr = []
      for (let i = 0; i < fields.length; i++) {
        arr.push(text[fields[i]])
      }
      content.push(arr)
    }

    const options = {
      filename: filename || '导出',
      data: content,
      options: {
        '!cols': [
          { wch: 20 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
          { wch: 50 },
        ],
      },
    }
    common.creatExcel(this.ctx, options)
  }
}
