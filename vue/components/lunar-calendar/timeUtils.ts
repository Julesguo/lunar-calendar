/* 时间工具类 */

/*
使用方法：

const TimeUtils = require('../../utils/timeUtils.js')
//时间戳转指定格式时间  1487065320000  1554803832
TimeUtils.LC_timeStampToTime(new Date().getTime(), '{y}年{m}月{d}日 {h}:{i}:{s} 星期{w}')  

TimeUtils.LC_timeStampToTime() // 默认当前时间，格式为：2019/05/20 00:00:00
TimeUtils.LC_timeStampToTime('', '{y}年{m}月{d}日 {h}:{i}:{s} 星期{w}')  
TimeUtils.LC_timeStampToTime('', '{y}/{m}/{d} {h}:{i}:{s}')
TimeUtils.LC_timeStampToTime('', '{y}-{m}-{d} {h}:{i}:{s}')   

*/

export default class TimeUtils {
/** 获取当前毫秒级时间戳（13位） */
static LC_getTimeStamp() {
  // let timestamp = Date.parse(new Date())
  let timestamp = new Date().getTime()
  return timestamp
}

/**
 * 将某个格式时间转化成毫秒级时间戳（13位），支持："-"、"/"、"."、"年月日"
 * @param time 2019(年) | 2019年2月 | 2019年02月02日 | 2019年2月2日 00:00:00 | 2019-2 | 2019-02 | 2019-2-2 | 2019-02-02 | 2019-02-02 00:00:00
 * @return 1556640000000
 */
static LC_convertTimeStamp(time) {
  // 如果time的类型不是string，则直接返回
  if (typeof time !== 'string') {
    return time
  }

  //用正则主要是把“2019-05-20 00:00:00”转换成“2019/05/20 00:00:00”兼容ios
  let newTime = time.replace(/-/g, '/')
  newTime = newTime.replace(/\./g, '/')
  // 如果只包含年月
  if (newTime.includes('年') && newTime.includes('月') && !newTime.includes('日')) {
    newTime += '01日'
  }
  newTime = newTime.replace(/年/g, '/')
  newTime = newTime.replace(/月/g, '/')
  newTime = newTime.replace(/日/g, '')
  if (newTime.length == 5) {
    // 处理2019年
    newTime = newTime.substring(0, 4)
  }
  let timeArr = newTime.split('/')
  // 如果只有一个 /，说明只有年月
  if (timeArr.length == 2) {
    newTime += '/01'
  }
  return Date.parse(newTime)
}

/**
 * 将某个毫秒级时间戳（13位）转化成 指定格式时间
 * @param {date} time 时间
 * @param {string} cFormat {y}-{m}-{d} {h}:{i}:{s} {w}
 */
static timeStampToTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
  } else {
    /**
    确保传入的是毫秒级时间戳，这里不再处理秒级转毫秒级
    因为1970-01-01 08:00:00 到 1970-04-27 01:46:39 之间是 0 - 9999999999，毫秒级时间戳也有10位的
    */
    // if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    w: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|w)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'w') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 将某个毫秒级时间戳（13位）转化成 指定格式时间（不带0）
 * @param time 时间
 * @param cFormat {y}-{m}-{d} {h}:{i}:{s} {w}
 */
static LC_timeStampToNo0Time(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
  } else {
    /**
    确保传入的是毫秒级时间戳，这里不再处理秒级转毫秒级
    因为1970-01-01 08:00:00 到 1970-04-27 01:46:39 之间是 0 - 9999999999，毫秒级时间戳也有10位的
    */
    // if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    w: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|w)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'w') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    // if (result.length > 0 && value < 10) {
    //   value = '0' + value
    // }
    return value || 0
  })
  return time_str
}

/**
 * 毫秒级时间戳（13位）转指定时间格式，不传time默认当前时间戳
 * @param time 毫秒级时间戳（13位），不传time默认当前时间戳
 * @param format 指定format，不传format默认：'{y}/{m}/{d} {h}:{i}:{s}'
 * @return 指定format时间，默认格式：2019/05/20 00:00:00
 */
static LC_timeStampToTime(time, format) {
  time = time ? time : this.LC_getTimeStamp()
  if (format) {
    return this.timeStampToTime(time, format)
  }
  return this.timeStampToTime(time, '{y}/{m}/{d} {h}:{i}:{s}')
}

/**
 * 毫秒级时间戳（13位）转年月日，不传time默认当前时间戳
 * @param time 毫秒级时间戳（13位），不传time默认当前时间戳
 * @param format 指定format，不传format默认：'{y}/{m}/{d}'
 * @return 指定format时间，默认格式：2020/02/02
 */
static LC_timeStampToYMD(time, format='{y}/{m}/{d}') {
  time = time ? time : this.LC_getTimeStamp()
  if (format) {
    return this.LC_timeStampToTime(time, format)
  }
  return this.LC_timeStampToTime(time, '{y}/{m}/{d}')
}

/**
 * 毫秒级时间戳（13位）转年月日时分秒，不传time默认当前时间戳
 * @param time 毫秒级时间戳（13位），不传time默认当前时间戳
 * @param format 指定format，不传format默认：'{y}/{m}/{d} {h}:{i}:{s}'
 * @return 指定format时间，默认格式：2019/05/20 00:00:00
 */
static LC_timeStampToYMDHMS(time, format) {
  time = time ? time : this.LC_getTimeStamp()
  if (format) {
    return this.LC_timeStampToTime(time, format)
  }
  return this.LC_timeStampToTime(time, '{y}/{m}/{d} {h}:{i}:{s}')
}

/**
 * 毫秒级时间戳（13位）转年月日时分，不传time默认当前时间戳
 * @param time 毫秒级时间戳（13位），不传time默认当前时间戳
 * @param format 指定format，不传format默认：'{y}/{m}/{d} {h}:{i}'
 * @return 指定format时间，默认格式：2019/05/20 00:00
 */
static LC_timeStampToYMDHM(time, format) {
  time = time ? time : this.LC_getTimeStamp()
  if (format) {
    return this.LC_timeStampToTime(time, format)
  }
  return this.LC_timeStampToTime(time, '{y}/{m}/{d} {h}:{i}')
}

/**
 * 将某个格式时间转化为另一种格式时间
 * @param time 2019(年) | 2019年2月 | 2019年02月02日 | 2019年2月2日 00:00:00 | 2019-2 | 2019-02 | 2019-2-2 | 2019-02-02 | 2019-02-02 00:00:00
 * @param format 指定format，不传format默认：'{y}/{m}/{d} {h}:{i}:{s}'
 * @return 指定format时间，默认格式：2019/02/02 00:00:00
 */
static LC_timeToTime(time, format) {
  let timeStamp = this.LC_convertTimeStamp(time)
  if (format) {
    return this.LC_timeStampToTime(timeStamp, format)
  }
  return this.LC_timeStampToTime(time, '{y}/{m}/{d} {h}:{i}:{s}')
}

/**
 * 将某个格式时间转化为年月日对象，不传time默认当前时间
 * @param time  2019年02月02日 | 2019年2月2日 00:00:00 | 2020/02/02 | 2020-02-02 | 2020/02/02 00:00:00 | 2020-02-02 00:00:00
 * @return {year: "2019", month: "02", day: "02"}
 */
static LC_getYearMonthDayObj(time) {
  let timeStamp = time ? this.LC_convertTimeStamp(time) : this.LC_getTimeStamp()
  let newTime = this.LC_timeStampToYMD(timeStamp)
  let year = newTime.substring(0, 4)
  let month = newTime.substring(5, 7)
  let day = newTime.substring(8, 10)
  return {
    year: year,
    month: month,
    day: day
  }
}

/**
 * 获取年
 * @return 2020
 */
static LC_getYear() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{y}')
}

/**
 * 获取月
 * @return 02
 */
static LC_getMonth() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{m}')
}

/**
 * 获取日
 * @return 02
 */
static LC_getDay() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{d}')
}

/**
 * 获取周
 * @return 日 | 一 | 二 | 三 | 四 | 五 | 六
 */
static LC_getWeek() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{w}')
}

/**
 * 获取年月日周
 * @return 2020年02月02日 星期六
 */
static LC_getYearMonthDayWeek() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{y}年{m}月{d}日 {h}:{i}:{s} 星期{w}')
}

/**
 * 获取指定年的上一年，不传time默认今年
 * @param time 2020年 | 2020
 * @return 2019年 | 2019
 */
static LC_getLastYear(time) {
  time = time ? time : this.LC_getYear()
  let tempYear = time.substring(0, 4)
  tempYear = parseInt(tempYear)
  tempYear = tempYear - 1
  let text = time.substring(4, 5)
  let lastYear = ''
  if (text == '年') {
    lastYear = tempYear + '年'
  } else {
    lastYear = tempYear + text
  }
  return lastYear
}

/**
 * 获取指定年的下一年，不传time默认今年
 * @param time 2020年 | 2020
 * @return 2021年 | 2021
 */
static LC_getNextYear(time) {
  time = time ? time : this.LC_getYear()
  let tempYear = time.substring(0, 4)
  tempYear = parseInt(tempYear)
  tempYear = tempYear + 1
  let text = time.substring(4, 5)
  let nextTime = ''
  if (text == '年') {
    nextTime = tempYear + '年'
  } else {
    nextTime = tempYear + text
  }
  return nextTime
}

/**
 * 获取当前年月
 * @return 2020年2月
 */
static LC_getYearMonth() {
  return this.LC_timeStampToTime(this.LC_getTimeStamp(), '{y}年{m}月')
}

/**
 * 获取指定年月的上一年月，不传time默认当前年月
 * @param time 2020年2月 | 2020年02月 | 2020/02 | 2020-02
 * @return 2020年1月 | 2020/01 | 2020-01
 */
static LC_getLastYearMonth(time) {
  time = time ? time : this.LC_getYearMonth()
  let tempYear = time.substring(0, 4)
  let tempMonth = time.substring(5, 7)
  tempYear = parseInt(tempYear)
  tempMonth = parseInt(tempMonth)
  tempMonth = tempMonth - 1
  if (tempMonth == 0) {
    tempYear = tempYear - 1
    tempMonth = 12
  }
  if (tempMonth < 10) {
    tempMonth = '0' + tempMonth
  }
  let text = time.substring(4, 5)
  let lastTime = ''
  if (text == '年') {
    tempMonth = parseInt(tempMonth)
    lastTime = tempYear + '年' + tempMonth + '月'
  } else {
    lastTime = tempYear + text + tempMonth
  }
  return lastTime
}

/**
 * 获取指定年月的下一年月，不传time默认当前年月
 * @param time 2020年2月 | 2020年02月 | 2020/02 | 2020-02
 * @return 2020年3月 | 2020/03 | 2020-03
 */
static LC_getNextYearMonth(time) {
  time = time ? time : this.LC_getYearMonth()
  let tempYear = time.substring(0, 4)
  let tempMonth = time.substring(5, 7)
  tempYear = parseInt(tempYear)
  tempMonth = parseInt(tempMonth)
  tempMonth = tempMonth + 1
  if (tempMonth == 13) {
    tempYear = tempYear + 1
    tempMonth = 1
  }
  if (tempMonth < 10) {
    tempMonth = '0' + tempMonth
  }
  let text = time.substring(4, 5)
  let nextTime = ''
  if (text == '年') {
    tempMonth = parseInt(tempMonth)
    nextTime = tempYear + '年' + tempMonth + '月'
  } else {
    nextTime = tempYear + text + tempMonth
  }
  return nextTime
}

/**
 * 获取一年后的时间，不传time默认当前时间
 * @param time 2020年2月2日 | 2020/02/02 | 2020-02-02 | 2020/02/02 00:00:00 | 2020-02-02 00:00:00
 * @return 2021年2月2日 | 2021/02/02 | 2021-02-02 | 2021/02/02 00:00:00
 */
static LC_getNextYearMonthDay(time) {
  if (time) {
    let nextYear = parseInt(time.substring(0, 4)) + 1
    let nextTime = nextYear + time.substring(4, time.length)
    return nextTime
  } else {
    let nextTime = new Date(this.LC_getTimeStamp())
    nextTime.setFullYear(nextTime.getFullYear() + 1)
    nextTime.setDate(nextTime.getDate())
    nextTime = this.LC_timeStampToTime(nextTime.getTime(), '{y}/{m}/{d} {h}:{i}:{s}')
    return nextTime
  }
}

/**
 * 某个时间是否是今天
 * @param time 2020-07-19 | 2020/07/19 | 2020-07-19 20:33:00 | 2020/07/19 20:33:00
 * @return true | false
 */
static LC_isToday(time) {
  // time = time.replace(/-/g, '/')
  // return (new Date(time).toDateString() == new Date().toDateString())
  return this.LC_timeToTime(time, '{y}/{m}/{d}') == this.LC_timeStampToYMD(new Date())
}

/**
 * 判断某个时间是否在开始时间和结束时间范围内
 * @param time 2019(年) | 2019年2月 | 2019年02月02日 | 2019年2月2日 00:00:00 | 2019-2 | 2019-02 | 2019-2-2 | 2019-02-02 | 2019-02-02 00:00:00
 * @return true | false
 */
static LC_isBetweenTimes(time, startTime, endTime) {
  time = this.LC_convertTimeStamp(time)
  startTime = this.LC_convertTimeStamp(startTime)
  endTime = this.LC_convertTimeStamp(endTime)
  if (startTime <= time && time <= endTime) {
    return true
  }
  return false
}

/**
 * 判断当前时间是否在某个时间段内
 * @param time 2019(年) | 2019年2月 | 2019年02月02日 | 2019年2月2日 00:00:00 | 2019-2 | 2019-02 | 2019-2-2 | 2019-02-02 | 2019-02-02 00:00:00
 * @return true | false
 */
static LC_isBetweenTimesByCurrent(startTime, endTime) {
  startTime = this.LC_convertTimeStamp(startTime)
  endTime = this.LC_convertTimeStamp(endTime)
  let currentTime = this.LC_getTimeStamp()
  if (startTime <= currentTime && currentTime <= endTime) {
    return true
  }
  return false
}

/**
 * 判断某个时间是否在当前时间和结束时间范围内
 * @param time 2019(年) | 2019年2月 | 2019年02月02日 | 2019年2月2日 00:00:00 | 2019-2 | 2019-02 | 2019-2-2 | 2019-02-02 | 2019-02-02 00:00:00
 * @return true | false
 */
static LC_isBetweenTimesByCurrentAndEndTime(time, endTime) {
  let currentTime = this.LC_getTimeStamp()
  time = this.LC_convertTimeStamp(time)
  endTime = this.LC_convertTimeStamp(endTime)
  if (currentTime <= time && time <= endTime) {
    return true
  }
  return false
}

/**
 * 比较两个时间大小
 * @param time1 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @param time2 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @return time1>time2 为true
 */
static LC_compareTimes(time1, time2) {
  let newTime1 = this.LC_convertTimeStamp(time1)
  let newTime2 = this.LC_convertTimeStamp(time2)
  if (newTime1 > newTime2) {
    return true // 第一个大
  } else {
    return false // 第二个大
  }
}

/**
 * 当前时间距离某个时间还有xxx天x小时xx分xx秒，返回：118天0小时30分12秒
 * @param time 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @return 118天0小时30分12秒
 */
static LC_getEndTime(time) {
  time = time.replace(/-/g, '/')
  let year = new Date(time).getFullYear()
  let month = new Date(time).getMonth() + 1
  let date = new Date(time).getDate()
  let now = new Date()
  let endDate = new Date(new Date(time).toLocaleDateString())
  let leftTime = endDate.getTime() - now.getTime()
  let leftsecond = parseInt(leftTime / 1000)
  let day = Math.floor(leftsecond / (60 * 60 * 24))
  let hour = Math.floor((leftsecond - day * 24 * 60 * 60) / 3600)
  let minute = Math.floor((leftsecond - day * 24 * 60 * 60 - hour * 3600) / 60)
  let second = Math.floor(leftsecond - day * 60 * 60 * 24 - hour * 60 * 60 - minute * 60)
  return `${day}天${hour}小时${minute}分${second}秒`
}

/**
 * 获取两个时间相差天数
 * @param time1 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @param time2 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @return 天数
 */
static LC_getDifferenceDays(time1, time2) {
  let newTime1 = this.LC_convertTimeStamp(time1)
  let newTime2 = this.LC_convertTimeStamp(time2)
  let newTime = Math.abs(newTime1 - newTime2)
  let days = Math.floor(newTime / (24 * 3600 * 1000))
  return days
}

/**
 * 某年是否闰年，不传time默认当前年
 * @param time 2019
 * @return true|false
 */
static LC_isLeapYear(time) {
  let year = time || new Date().getFullYear()
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

/**
 * 获取某月一共多少天，不传time默认本月
 * @param time 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @return 天数
 */
static LC_getDaysWithMonth(time) {
  let date = new Date()
  if (time) {
    date = time.replace(/-/g, '/')
    date = new Date(date)
  }
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let days = new Date(year, month, 0)
  return days.getDate()
}

/**
 * 获取某年一共多少天，不传time默认今年
 * @param time 2019
 * @return 天数
 */
static LC_getDaysWithYear(time) {
  return this.LC_isLeapYear(time) ? 366 : 365
}

/**
 * 获取今年已过天数（今年的第几天）
 * @return 天数
 */
static LC_getPassDaysWithYear() {
  // let currentYear = new Date().getFullYear().toString()
  // // 今天减今年的第一天（xxxx年01月01日）
  // let hasTimestamp = new Date() - new Date(currentYear)
  // // 86400000 = 24 * 60 * 60 * 1000
  // let days = Math.ceil(hasTimestamp / 86400000)

  let days = Math.ceil(
    (new Date() - new Date(new Date().getFullYear().toString())) / (24 * 60 * 60 * 1000)
  )
  return days
}

/**
 * 获取本月剩余天数
 * @return 天数
 */
static LC_getSurplusDaysWithMonth() {
  return this.LC_getDaysWithMonth() - this.LC_timeStampToTime('', '{d}')
}

/**
 * 获取今年剩余天数
 * @return 天数
 */
static LC_getSurplusDaysWithYear() {
  return this.LC_getDaysWithYear() - this.LC_getPassDaysWithYear()
}

static filterDateNum(date) {
  if (!date) return {}
  const cnDay = ['日', '一', '二', '三', '四', '五', '六']
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekDay: cnDay[date.getDay()]
  }
}

/**
 * 周岁算法：每过一个生日就长一岁。
 * @param birthday 2019-02-02 || 2019/02/02 || 2019-02-02 00:00:00 || 2019/02/02 00:00:00
 * @return 返回年龄 //（返回负数，表示birthday晚于今天）
 */
static LC_getAge(birthday) {
  let fullAge = 0
  if (!birthday) return ''
  if (typeof birthday === 'string') {
    birthday = birthday.replace(/-/g, '/')
    birthday = new Date(birthday)
  }
  const now = new Date()
  const birthdayObj = this.filterDateNum(birthday)
  const nowObj = this.filterDateNum(now)
  const baseAge = nowObj.year - birthdayObj.year
  fullAge = baseAge
  // 本年没过生日
  if (
    birthdayObj.month > nowObj.month ||
    (birthdayObj.month === nowObj.month && birthdayObj.day > nowObj.day)
  ) {
    fullAge = baseAge - 1
  }
  return fullAge
}}
