import Vue from 'vue';
import iView from 'iview';
import { router } from './router/index';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import 'font-awesome/css/font-awesome.min.css';
import util from './libs/util';
import api from './api/index'

Vue.use(VueI18n);
Vue.use(iView);
Vue.prototype.$util = util
Vue.prototype.$api = api

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted() {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        if (localStorage.getItem('user')) {
            this.$store.commit('updateMyMenulist');
            this.$store.commit('mountMyMenulist', this);
        }
        // iview-admin检查更新
        // util.checkUpdate(this);
    },
    created() {
    }
});
