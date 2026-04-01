import baseDayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { timezone as timezoneConstant } from '../constants/timzone'

baseDayjs.extend(timezone)
baseDayjs.extend(utc)
export const dayjs = baseDayjs

export const formatDate = (date: Date | string, format = 'YYYY/MM/DD, hh:mm:ss A'): string => {
  return dayjs(date).tz(timezoneConstant.ASIA_TOKYO).format(format)
}
