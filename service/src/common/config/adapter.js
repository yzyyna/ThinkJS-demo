const fileCache = require('think-cache-file')
const nunjucks = require('think-view-nunjucks')
const fileSession = require('think-session-file')
const mysql = require('think-model-mysql')
const { Console, File, DateFile } = require('think-logger3')
const path = require('path')
const isDev = think.env === 'development'

/**
 * cache adapter config
 * @type {Object}
 */
exports.cache = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000, // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: path.join(think.ROOT_PATH, 'runtime/cache'), // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000, // gc interval
  },
}

/**
 * model adapter config
 * @type {Object}
 */
exports.model = {
  type: 'mysql',
  common: {
    logConnect: false,
    logSql: true,
    logger: (msg) => think.logger.info(msg),
  },
  // 工具数据库连接
  mysql: {
    handle: mysql,
    database: 'tooldb',
    prefix: '',
    encoding: 'utf8',
    host: '192.168.110.54',
    port: '3306',
    user: 'fortrust',
    password: 'pfortrust',
    dateStrings: true,
  },
  // wx数据库
  mysql_wx: {
    handle: mysql,
    database: 'wechatdb',
    prefix: '',
    encoding: 'utf8',
    host: '192.168.110.54',
    port: '3306',
    user: 'ufortrust',
    password: 'pfortrust',
    dateStrings: true,
  },
}

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
  type: 'file',
  common: {
    cookie: {
      name: 'thinkjs',
      // keys: ['werwer', 'werwer'],
      // signed: true
    },
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session'),
  },
}

/**
 * view adapter config
 * @type {Object}
 */
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html',
  },
  nunjucks: {
    handle: nunjucks,
  },
}

/**
 * logger adapter config
 * @type {Object}
 */
exports.logger = {
  type: isDev ? 'console' : 'dateFile',
  console: {
    handle: Console,
  },
  file: {
    handle: File,
    backups: 10, // max chunk number
    absolute: true,
    maxLogSize: 50 * 1024, // 50M
    filename: path.join(think.ROOT_PATH, 'logs/app.log'),
  },
  dateFile: {
    handle: DateFile,
    level: 'ALL',
    absolute: true,
    pattern: '-yyyy-MM-dd',
    alwaysIncludePattern: true,
    filename: path.join(think.ROOT_PATH, 'logs/app.log'),
  },
}
