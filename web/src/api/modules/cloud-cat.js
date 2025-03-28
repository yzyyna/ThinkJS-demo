import { post } from '../axios'

/**
 * 云猫账号申请接口
 * @author demon3443002624@outlook.com
 * @version 2023-03-08 Wed. 11:04:06
 */
export default {
    // mqtt-config
    addData: p => post(p, 'admin/config_tab/addData'),
    delData: p => post(p, 'admin/config_tab/delData'),
    updateData: p => post(p, 'admin/config_tab/updateData'),
    pageData: p => post(p, 'admin/config_tab/pageData'),
    allData: p => post(p, 'admin/config_tab/allData'),
    checkConfig: p => post(p, 'admin/config_tab/checkConfig'),
    // apply-record
    addDataApply: p => post(p, '/admin/apply_history/addData'),
    delDataApply: p => post(p, '/admin/apply_history/delData'),
    pageDataApply: p => post(p, '/admin/apply_history/pageData'),
    exportApply: p => post(p, '/admin/apply_history/downloadFile', {
        responseType: 'blob'
    }),

}
