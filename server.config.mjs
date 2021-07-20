// 录制结束后的防抖时间
import { mapValues } from 'lodash-es'

const env = process.env.NODE_ENV

const isProduction = env === 'production'
export function exportWhenProduction(data) {
  return isProduction ? data : ''
}

export const DEBOUNCE_TIME = isProduction ? 1 * 1000 : 1 * 1000

const configsMap = {
  development: {
    getUploaderArgs(fileList) {
      return ['py', ['-3', 'uploader-dev.py', ...fileList]]
    },
    ip: '127.0.0.1'
  },
  production: {
    getUploaderArgs(fileList) {
      return ['python', ['uploader.py', ...fileList]]
    },
    ip: '10.0.4.14'
  },
}

// const configs = mapValues(configMap[env])
export const configs = configsMap[env]
