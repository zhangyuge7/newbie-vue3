import axios, { msgType } from '@/utils/axios'

const BASE_URL = '/system/dict/type'

/**
 * 分页获取字典分类
 * @param {*} current 当前页
 * @param {*} size 页大小
 * @param {*} params 筛选条件参数
 * @returns {Promise}
 */
export function getDictTypePagingApi(current, size, params) {
  params = { current, size, ...params }
  return axios.get(`${BASE_URL}/page`, { params })
}

/**
 * 保存字典分类,有id则修改，否则新增
 * @param {*} data 字典分类数据
 * @returns {Promise}
 */
export function saveDictTypeApi(data) {
  if (data.id || data.id === 0)
    return axios.put(`${BASE_URL}/update`, data, { successMsgType: msgType.msg })
  else
    return axios.post(`${BASE_URL}/add`, data, { successMsgType: msgType.msg })
}

/**
 * 删除字典类型
 * @param {*} id 字典分类ID
 * @returns {Promise}
 */
export function deleteDictTypeApi(id) {
  return axios.delete(`${BASE_URL}/delete`, { params: { id }, successMsgType: msgType.msg })
}