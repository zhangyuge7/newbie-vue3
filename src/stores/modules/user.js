import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

import { ElNotification } from 'element-plus'
import { useRouteStore } from './route'
import router from '@/router'
import { loginApi, logoutApi } from '@/api/security'
import { t } from '@/i18n'

const PREFIX = import.meta.env.VITE_APP_STORAGE_PREFIX

export const useUserStore = defineStore('user', () => {
  const tokenInfo = ref()
  const userInfo = shallowRef()

  // 登录
  async function login(form, replacePath = '/') {
    const { data, ok } = await loginApi(form)
    if (!ok)
      return
    tokenInfo.value = data
    await router.replace(replacePath)
    ElNotification({
      title: t('app.loginSuccess'),
      message: `${t('app.welcome')} ${data?.nickName || ''}`,
      type: 'success',
    })
  }
  // 登出
  async function logout() {
    try {
      await logoutApi()
    }
    finally {
      const routeStore = useRouteStore()
      tokenInfo.value = null
      userInfo.value = null
      await router.replace(`/login?replace=${router.currentRoute.value.fullPath}`)
      routeStore.$reset()
    }
  }

  return { tokenInfo, userInfo, login, logout }
}, {
  persist: {
    key: `${PREFIX}USER`,
    paths: ['tokenInfo'],
    storage: localStorage,
  },
})