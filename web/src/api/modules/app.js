import { post } from '../axios'

/**
 * 公共接口
 * @author demon3443002624@outlook.com
 * @version 2023-6-1 Thur. 14:17:27
 */
export default {
    // login
    login: p => post(p, 'admin/sys_user/login'),
}
