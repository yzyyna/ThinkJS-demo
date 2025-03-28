/*
 * @Autor: linxu
 * @Date: 2023-05-31 16:13:58
 * @LastEditors: linxu
 * @LastEditTime: 2023-06-09 12:00:05
 * @Description:
 */
import { post } from '../axios'

/**
 * 服务报告接口
 * @author demon3443002624@outlook.com
 * @version 2023-05-31 Wed. 16:17:06
 */
export default {
  // platform-manage
  addData: (p) => post(p, 'admin/fw_platform/add'),
  delData: (p) => post(p, 'admin/fw_platform/del'),
  updateData: (p) => post(p, 'admin/fw_platform/update'),
  allData: (p) => post(p, 'admin/fw_platform/all'),
  checkConfig: (p) => post(p, 'admin/fw_platform/checkConfig'),
  // report-list
  getReportPageData: (p) => post(p, 'admin/fw_report/pageData'),
  getGensetInfo: (p) => post(p, 'admin/fw_repeat/getGensetInfo'),
  getServiceSheet: (p) => post(p, 'admin/fw_repeat/getServiceSheet'),
  getProtocolParmas: (p) => post(p, 'admin/fw_repeat/getProtocolParmas'),
  findGensetRecordListByPage: (p) => post(p, 'admin/fw_repeat/findGensetRecordListByPage'),
  findGensetNowAlarmByPage: (p) => post(p, 'admin/fw_repeat/findGensetNowAlarmByPage'),
  findGensetHistoryAlarmByPage: (p) => post(p, 'admin/fw_repeat/findGensetHistoryAlarmByPage'),

  // report-detail
  updateReport: (p) => post(p, '/admin/fw_report/update'),
  findGensetRecordReportCurve: (p) => post(p, '/admin/fw_repeat/findGensetRecordReportCurve'),
  getReportDetails: (p) => post(p, '/admin/fw_report/getReportDetails'),
  saveAdd: (p) => post(p, '/admin/fw_report/add'),
  saveEdit: (p) => post(p, '/admin/fw_report/update'),
  // 获取所有服务类型
  getServiceList: (p) => post(p, 'admin/fw_conmon/getServiceList'),
  // 获取所有平台客户
  getPlatformCustomerList: (p) => post(p, 'admin/fw_conmon/getPlatformCustomerList')
}
