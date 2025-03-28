/**
 *常用工具类
 */
const fs = require('fs')
const path = require('path')
const Crypto = require('crypto')
const xlsx = require('node-xlsx')

module.exports = {
  mkdirs(dirname) {
    return mkdirsSync(dirname)
  },
  hmacsha1(str, key) {
    return HmacSHA1Fun(str, key)
  },
  creatExcel(ctx, param) {
    return creatExcelFun(ctx, param)
  },
}

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

function HmacSHA1Fun(str, key) {
  const hash = Crypto.createHmac('sha1', key)
    .update(str)
    .digest()
    .toString('base64')
  return hash
}

function creatExcelFun(ctx, param) {
  // 构造一个 Excel 文件对象
  const excelFile = [{ name: param.filename, data: param.data }]

  // 生成 Excel 文件的二进制流数据
  const buffer = xlsx.build(excelFile)

  // 设置响应头
  ctx.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  ctx.res.setHeader(
    'Content-Disposition',
    `attachment; filename=${param.filename}.xlsx`
  )

  // 将 Excel 文件的二进制流数据返回给客户端
  ctx.res.end(buffer, 'binary')
}
