import axios, { msgType } from '@/utils/axios'

const BASE_URL = '/system/user'

/**
 * 获取用户分页数据
 * @param {Number} current 当前页
 * @param {Number} size 页大小
 * @param {Object} params 筛选条件参数
 * @returns {Promise}
 */
export function getUserPaging(current, size, params = {}) {
  return axios.get(`${BASE_URL}/paging`, { params: { current, size, ...params } })
}

/**
 * 保存用户信息，有用户id则修改，否则新增
 * @param {Object} data 数据
 * @returns {Promise}
 */
export function saveUserApi(data) {
  if (data.id)
    return axios.post(`${BASE_URL}/update`, data, { successMsgType: msgType.msg })

  else
    return axios.post(`${BASE_URL}/add`, data, { successMsgType: msgType.msg })
}

/**
 * 批量删除用户
 * @param {Array} ids id列表
 * @returns {Promise}
 */
export function deleteBatchApi(ids) {
  return axios.post(`${BASE_URL}/deleteBatch`, ids, { successMsgType: msgType.msg })
}

/**
 * 修改用户密码
 * @returns {Promise}
 */
export function updateUserPassword(data) {
  return axios.post(`${BASE_URL}/updateUserPassword`, data, { successMsgType: msgType.msg })
}

/**
 * 当前用户修改自己的基本用户信息
 * @param {*} data
 * @returns
 */
export function updateByCurrApi(data) {
  return axios.post(`${BASE_URL}/updateByCurr`, data, { successMsgType: msgType.none })
}
