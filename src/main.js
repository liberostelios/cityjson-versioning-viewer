import Vue from 'vue'
import App from './App.vue'
import CityJSONComponents from 'cityjson-vue-components'
import Vue2Filters from 'vue2-filters'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'

import '@fortawesome/fontawesome-free/css/all.css'

Vue.use(CityJSONComponents);
Vue.use(Vue2Filters);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
