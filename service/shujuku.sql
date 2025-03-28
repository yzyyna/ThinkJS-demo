/*
Navicat MySQL Data Transfer

Source Server         : 115.29.204.244
Source Server Version : 50173
Source Host           : 115.29.204.244:3306
Source Database       : thinkjs-iview-admin

Target Server Type    : MYSQL
Target Server Version : 50173
File Encoding         : 65001

Date: 2018-01-16 16:52:56
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_dict
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict`;
CREATE TABLE `sys_dict` (
  `id` varchar(64) NOT NULL COMMENT '编号',
  `value` varchar(100) NOT NULL COMMENT '数据值',
  `label` varchar(100) NOT NULL COMMENT '标签名',
  `type` varchar(100) NOT NULL COMMENT '类型',
  `description` varchar(100) NOT NULL COMMENT '描述',
  `sort` decimal(10,0) DEFAULT NULL COMMENT '排序（升序）',
  `create_date` datetime NOT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`),
  KEY `sys_dict_value` (`value`),
  KEY `sys_dict_label` (`label`),
  KEY `sys_dict_del_flag` (`del_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='字典表';

-- ----------------------------
-- Records of sys_dict
-- ----------------------------
INSERT INTO `sys_dict` VALUES ('0a22f3278a624882a822e0820f27efcb', '1', '主表', 'table_type', '表类型', '20', '2016-01-05 21:47:14', '2016-01-05 21:53:34', '', '0');
INSERT INTO `sys_dict` VALUES ('1c0ac576c33d41fcb4c16602bf4fad5d', 'post', 'post', 'interface_type', '接口类型', '20', '2015-11-30 15:52:25', '2015-11-30 15:52:39', '', '0');
INSERT INTO `sys_dict` VALUES ('221a918bd1e149239a17ab0fdeaf5ecd', 'get', 'get', 'interface_type', '接口类型', '10', '2015-11-30 15:51:56', '2015-11-30 15:51:56', '', '0');
INSERT INTO `sys_dict` VALUES ('43c9472f411c4d3eafb3bf5319ffe499', '2', '异常报告', 'report_type', '异常的报告', '20', '2015-12-08 17:49:57', '2015-12-08 17:49:57', '', '0');
INSERT INTO `sys_dict` VALUES ('5b899603552c48519e7ba8eb9da0b41f', '0', '单表', 'table_type', '表类型', '10', '2016-01-05 21:46:39', '2016-01-05 21:53:50', '', '0');
INSERT INTO `sys_dict` VALUES ('680ddd8c91fe43588a7bb7aafe816633', '1', '正常报告', 'report_type', '正常的报告', '10', '2015-12-08 17:49:28', '2015-12-08 17:49:28', '正常的报告', '0');
INSERT INTO `sys_dict` VALUES ('71804c6b820048b09c9f6f2c11121113', 'ace', 'ACE风格', 'theme', '主题方案', '15', '2016-04-20 21:57:21', '2016-04-20 21:57:21', '', '0');
INSERT INTO `sys_dict` VALUES ('86bfebb0-f1ec-11e7-b55b-a7aaa2233168', '1', '支付宝', 'order_type', '交易类型', '1', '2018-01-05 15:46:23', '2016-04-20 21:57:21', null, '0');
INSERT INTO `sys_dict` VALUES ('97538ae0-f1ec-11e7-b55b-a7aaa2233168', '2', '微信', 'order_type', '交易类型', '2', '2018-01-05 15:46:51', '2016-04-20 21:57:21', null, '0');
INSERT INTO `sys_dict` VALUES ('bde6043665ef4571b85d0edab667cd15', '3', '树结构表', 'table_type', '表类型', '40', '2016-01-06 19:48:50', '2016-01-06 19:48:50', '', '0');
INSERT INTO `sys_dict` VALUES ('cc94b0c5df554a46894991210a5fc486', '2', '附表', 'table_type', '表类型', '30', '2016-01-05 21:47:38', '2016-01-05 21:53:44', '', '0');

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `id` int(64) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `pid` varchar(64) NOT NULL COMMENT '父级编号',
  `name` varchar(100) NOT NULL COMMENT '名称',
  `sort` decimal(10,0) DEFAULT NULL COMMENT '排序',
  `href` varchar(2000) DEFAULT NULL COMMENT '链接',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `is_show` char(1) NOT NULL COMMENT '是否在菜单中显示',
  `create_date` datetime NOT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  `title` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sys_menu_parent_id` (`pid`),
  KEY `sys_menu_del_flag` (`del_flag`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8 COMMENT='菜单表';

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES ('1', '0', 'sys_admin', '1', null, 'android-settings', '1', '2017-12-15 15:48:13', '2016-04-20 21:57:21', null, '0', '系统设置');
INSERT INTO `sys_menu` VALUES ('2', '1', 'sys_menu', '1', 'sys/sys_menu', 'android-menu', '1', '2017-12-15 15:50:39', '2016-04-20 21:57:21', null, '0', '菜单管理');
INSERT INTO `sys_menu` VALUES ('41', '1', 'sys_dict', '2', 'sys/sys_dict', 'cube', '1', '2017-12-25 23:19:01', '2017-12-25 23:19:45', null, '0', '字典管理');
INSERT INTO `sys_menu` VALUES ('49', '1', 'sys_user', '3', 'sys/sys_user', 'person', '1', '2018-01-08 16:16:56', '2016-04-20 21:57:21', null, '0', '用户管理');
INSERT INTO `sys_menu` VALUES ('51', '1', 'sys_role', '4', 'sys/sys_role', 'ios-cog-outline', '1', '2018-01-10 14:46:28', '2016-04-20 21:57:21', null, '0', '角色管理');
INSERT INTO `sys_menu` VALUES ('55', '0', 'demo', '1', null, null, '1', '2018-01-16 16:22:52', '2016-04-20 21:57:21', null, '0', '演示页面');
INSERT INTO `sys_menu` VALUES ('56', '55', 'text-editor', '1', 'demo/neditor_demo', 'compose', '1', '2018-01-16 16:23:37', '2018-01-16 16:23:47', null, '0', '富文本编辑器');
INSERT INTO `sys_menu` VALUES ('57', '55', 'dict_demo', '2', 'demo/dict_demo', 'pound', '1', '2018-01-16 16:28:23', '2016-04-20 21:57:21', null, '0', '数据字典演示');
INSERT INTO `sys_menu` VALUES ('58', '55', 'file-upload', '7', 'demo/my-components/file-upload/file-upload', 'android-upload', '1', '2018-01-16 16:28:55', '2018-01-16 16:36:22', null, '0', '文件上传');
INSERT INTO `sys_menu` VALUES ('59', '55', 'md-editor', '3', 'demo/my-components/markdown-editor/markdown-editor', 'pound', '1', '2018-01-16 16:34:17', '2016-04-20 21:57:21', null, '0', 'Markdown编辑器');
INSERT INTO `sys_menu` VALUES ('60', '55', 'image-editor', '4', 'demo/my-components/image-editor/image-editor', 'crop', '1', '2018-01-16 16:34:50', '2018-01-16 16:34:56', null, '0', '图片预览编辑');
INSERT INTO `sys_menu` VALUES ('61', '55', 'draggable-list', '5', 'demo/my-components/draggable-list/draggable-list', 'arrow-move', '1', '2018-01-16 16:35:24', '2016-04-20 21:57:21', null, '0', '可拖拽列表');
INSERT INTO `sys_menu` VALUES ('62', '55', 'area-linkage', '6', 'demo/my-components/area-linkage/area-linkage', 'ios-more', '1', '2018-01-16 16:36:16', '2016-04-20 21:57:21', null, '0', '城市级联');
INSERT INTO `sys_menu` VALUES ('63', '55', 'count-to', '8', 'demo/my-components/count-to/count-to', 'arrow-graph-up-right', '1', '2018-01-16 16:36:46', '2016-04-20 21:57:21', null, '0', '数字渐变');
INSERT INTO `sys_menu` VALUES ('64', '55', 'shopping', '9', 'demo/advanced-router/component/shopping-info', 'ios-cart', '1', '2018-01-16 16:38:14', '2016-04-20 21:57:21', null, '0', '购物详情');
INSERT INTO `sys_menu` VALUES ('65', '0', 'international', '3', 'demo/international/international', 'earth', '1', '2018-01-16 16:38:59', '2016-04-20 21:57:21', null, '0', '国际化');
INSERT INTO `sys_menu` VALUES ('66', '0', 'error-page', '4', 'error-page/error-page', 'android-sad', '1', '2018-01-16 16:39:29', '2016-04-20 21:57:21', null, '0', '错误页面');
INSERT INTO `sys_menu` VALUES ('67', '0', 'form', '5', null, 'android-checkbox', '1', '2018-01-16 16:40:19', '2016-04-20 21:57:21', null, '0', '表单编辑');
INSERT INTO `sys_menu` VALUES ('68', '67', 'artical-publish', '1', 'demo/form/article-publish/article-publish', 'compose', '1', '2018-01-16 16:40:45', '2016-04-20 21:57:21', null, '0', '文章发布');
INSERT INTO `sys_menu` VALUES ('69', '67', 'workflow', '2', 'demo/form/work-flow/work-flow', 'arrow-swap', '1', '2018-01-16 16:41:07', '2016-04-20 21:57:21', null, '0', '工作流');
INSERT INTO `sys_menu` VALUES ('70', '67', 'preview', '3', 'demo/form/article-publish/preview', 'arrow-swap', '1', '2018-01-16 16:41:32', '2016-04-20 21:57:21', null, '0', '文章');
INSERT INTO `sys_menu` VALUES ('71', '0', 'tables', '6', null, 'ios-grid-view', '1', '2018-01-16 16:43:53', '2016-04-20 21:57:21', null, '0', '表格');
INSERT INTO `sys_menu` VALUES ('72', '71', 'dragable-table', '1', 'demo/tables/dragable-table', 'arrow-move', '1', '2018-01-16 16:44:21', '2016-04-20 21:57:21', null, '0', '可拖拽排序');
INSERT INTO `sys_menu` VALUES ('73', '71', 'editable-table', '2', 'demo/tables/editable-table', 'edit', '1', '2018-01-16 16:44:49', '2016-04-20 21:57:21', null, '0', '可编辑表格');
INSERT INTO `sys_menu` VALUES ('74', '71', 'searchable-table', '3', 'demo/tables/searchable-table', 'search', '1', '2018-01-16 16:45:42', '2016-04-20 21:57:21', null, '0', '可搜索表格');
INSERT INTO `sys_menu` VALUES ('75', '71', 'exportable-table', '4', 'demo/tables/exportable-table', 'code-download', '1', '2018-01-16 16:46:54', '2016-04-20 21:57:21', null, '0', '表格导出数据');
INSERT INTO `sys_menu` VALUES ('76', '71', 'table-to-image', '5', 'demo/tables/table-to-image', 'images', '1', '2018-01-16 16:47:23', '2016-04-20 21:57:21', null, '0', '表格转图片');
INSERT INTO `sys_menu` VALUES ('77', '0', 'advanced-router', '7', null, 'ios-infinite', '1', '2018-01-16 16:48:10', '2016-04-20 21:57:21', null, '0', '高级路由');
INSERT INTO `sys_menu` VALUES ('78', '77', 'mutative-router', '1', 'demo/advanced-router/mutative-router', 'link', '1', '2018-01-16 16:48:32', '2016-04-20 21:57:21', null, '0', '动态路由');
INSERT INTO `sys_menu` VALUES ('79', '77', 'argument-page', '2', 'demo/advanced-router/argument-page', 'android-send', '1', '2018-01-16 16:48:53', '2016-04-20 21:57:21', null, '0', '带参页面');

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` varchar(64) NOT NULL COMMENT '编号',
  `name` varchar(100) NOT NULL COMMENT '角色名称',
  `create_date` datetime NOT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息',
  `sort` decimal(10,0) DEFAULT NULL COMMENT '排序',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`),
  KEY `sys_role_del_flag` (`del_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='角色表';


-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` varchar(64) NOT NULL COMMENT '角色编号',
  `menu_id` varchar(64) NOT NULL COMMENT '菜单编号',
  PRIMARY KEY (`role_id`,`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='角色-菜单';

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` varchar(64) NOT NULL COMMENT '编号',
  `login_name` varchar(100) NOT NULL COMMENT '登录名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `email` varchar(200) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(200) NOT NULL COMMENT '电话',
  `login_ip` varchar(100) DEFAULT NULL COMMENT '最后登陆IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登陆时间',
  `create_date` datetime NOT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标记',
  `role_id` varchar(64) DEFAULT NULL COMMENT '角色ID',
  `status` char(1) DEFAULT NULL COMMENT '状态 1 正常  0 冻结',
  PRIMARY KEY (`id`),
  KEY `sys_user_login_name` (`login_name`),
  KEY `sys_user_update_date` (`update_date`),
  KEY `sys_user_del_flag` (`del_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES ('1', 'admin', '96e79218965eb72c92a549dd5a330112', '超级管理员', '15439509@qq.com', '13693718888', '::1', '2018-01-08 16:22:51', '2017-12-14 11:52:46', '2018-01-12 13:43:44', null, '0', null, '1');
