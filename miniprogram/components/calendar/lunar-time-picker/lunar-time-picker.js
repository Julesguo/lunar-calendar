// 公农历通用时间选择器
// 支持同步切换，设置默认选中时间、设置最大最小时间(公历范围：1901/01/01 ~ 2100/12/31)
const TimeUtils = require('../timeUtils')
const lunarCalendar = require('../calendar')

Component({
  options: {
    styleIsolation: 'shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否切换到农历选择器，默认展示公历选择器
    isLunar: {
      type: Boolean,
      value: false
    },
    extClass: {
      type: String,
      default: '',
    },
    // 最小时间（公历），支持 1901/01/01 | 1901-01-01 | 1901年01月01日
    minTime: {
      type: String,
      value: '1901/01/01'
    },
    // 最大时间（公历），支持 2100/12/31 | 2100-12-31 | 2100年12月31日
    maxTime: {
      type: String,
      value: '2100/12/31'
    },
    // 默认选择日期，不传默认当天
    selectDate: {
      type: String,
      value: '2000-07-01'
    },
    // 默认选择时间，不传默认00：00
    selectTime: {
      type: String,
      value: '00:00'
    },
    // 默认选择的日期和时间 不传默认是当天的 现在
    selectDateTime: {
      type: String,
      value: '2000-07-01 12:00'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pickerYearArr: [], // 年数组
    pickerMonthArr: [], // 月数组
    pickerDayArr: [], // 天数组
    timeRange: [], // 时分数组
    pickerSelectIndexArr: [], // 选中的index数组
    pickerSelectDate: '', // 记录选择的日期(公历)，格式：1900/01/01
    pickerSelectTime: '', // 记录选择的时间，格式：00:00
    pickerIsLunar: false,
    titleActive: this.properties.isLunar ? 1 : 0, // 0为阳历  1为阴历
    isUpdateIndex: false,
    isAutoUpdateIndex: false
  },

  lifetimes: {
    ready: function () {
      this._initTimeRange() // 更新时间选择
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化和切换公农历更新数据
    initData(isUpdate) {
      let selectDateTime = this.properties.selectDateTime
      if (!selectDateTime) {
        selectDateTime = '2000-07-01 12:00'
      }
      let [date, time] = selectDateTime.split(' ')
      if (!time) {
        time = '12:00'
      }
      if (!isUpdate) {
        this.setData({
          pickerIsLunar: this.properties.isLunar,
          titleActive: this.properties.isLunar ? 1 : 0,
          pickerSelectDate: date,
          pickerSelectTime: time
        })
      }
      // 根据选中的公历时间更新公农历
      let dateObj = TimeUtils.LC_getYearMonthDayObj(this.data.pickerSelectDate)
      const timeObg = this.parseTimeString(this.data.pickerSelectTime)
      if (this.data.pickerIsLunar) {
        // 选择的时间转成农历
        let lunarDateObj = lunarCalendar.solar2lunar(
          dateObj.year,
          dateObj.month,
          dateObj.day
        )

        let newDateObj = {}
        // 农历年月日赋值
        newDateObj.year = lunarDateObj.lYear
        newDateObj.month = lunarDateObj.lMonth
        newDateObj.day = lunarDateObj.lDay
        newDateObj.hours = timeObg.hours
        newDateObj.minutes = timeObg.minutes

        // 判断是否是闰月
        newDateObj.isLeapMonth = lunarDateObj.IMonthCn.includes('闰')
        this.setDateLunarTime(newDateObj)
      } else {
        let newDateObj = {}
        newDateObj.year = dateObj.year
        newDateObj.month = dateObj.month
        newDateObj.day = dateObj.day
        newDateObj.hours = timeObg.hours
        newDateObj.minutes = timeObg.minutes
        this.setDateTime(newDateObj)
      }
    },
    // 初始化时分秒数据
    _initTimeRange: function () {
      const hours = []
      const minutes = []

      // Generate hours array
      for (let hour = 0; hour < 24; hour++) {
        hours.push({ label: `${hour < 10 ? '0' + hour : hour}`, value: hour })
      }

      // Generate minutes array
      for (let minute = 0; minute < 60; minute++) {
        minutes.push({ label: `${minute < 10 ? '0' + minute : minute}`, value: minute })
      }

      this.setData({
        timeRange: [hours, minutes]
      })
      this.initData()
    },
    /**
     * 公历时间设置
     * @dateObj 公历时间对象
     */
    setDateTime(dateObj) {
      let yearArr = this.getYears()
      let monthArr = this.getMonths(dateObj.year)
      let dayArr = this.getDays(dateObj.year, dateObj.month)
      let timeRange = this.data.timeRange

      this.setData({
        pickerYearArr: yearArr,
        pickerMonthArr: monthArr,
        pickerDayArr: dayArr
      })
      // 获取年月日index
      let yearIndex = yearArr.findIndex((item) => item.value == dateObj.year)
      let monthIndex = monthArr.findIndex((item) => item.value == dateObj.month)
      let dayIndex = dayArr.findIndex((item) => item.value == dateObj.day)
      // 获取时分秒的index
      let hoursIndex = timeRange[0].findIndex((item) => item.value == dateObj.hours)
      let minutesIndex = timeRange[1].findIndex((item) => item.value == dateObj.minutes)
      // 最小年月日处理
      let minTime = this.properties.minTime
      if (dateObj.year <= this.LC_getYear(minTime)) {
        yearIndex = yearArr.findIndex((item) => item.value == this.LC_getYear(minTime))
      }
      if (
        dateObj.year <= this.LC_getYear(minTime) &&
        dateObj.month <= this.LC_getMonth(minTime)
      ) {
        monthIndex = monthArr.findIndex((item) => item.value == this.LC_getMonth(minTime))
      }
      if (
        dateObj.year <= this.LC_getYear(minTime) &&
        dateObj.month <= this.LC_getMonth(minTime) &&
        dateObj.day <= this.LC_getDay(minTime)
      ) {
        dayIndex = dayArr.findIndex((item) => item.value == this.LC_getDay(minTime))
      }
      // 最大年月日处理
      let maxTime = this.properties.maxTime
      if (dateObj.year >= this.LC_getYear(maxTime)) {
        yearIndex = yearArr.findIndex((item) => item.value == this.LC_getYear(maxTime))
      }
      if (
        dateObj.year >= this.LC_getYear(maxTime) &&
        dateObj.month >= this.LC_getMonth(maxTime)
      ) {
        monthIndex = monthArr.findIndex(
          (item) => item.value == this.LC_getMonth(this.properties.maxTime)
        )
      }
      if (
        dateObj.year >= this.LC_getYear(maxTime) &&
        dateObj.month >= this.LC_getMonth(maxTime) &&
        dateObj.day >= this.LC_getDay(maxTime)
      ) {
        dayIndex = dayArr.findIndex((item) => item.value == this.LC_getDay(maxTime))
      }
      // 更新记录的选中日期
      let selectDate = TimeUtils.LC_timeToTime(
        yearArr[yearIndex].value +
          '/' +
          monthArr[monthIndex].value +
          '/' +
          dayArr[dayIndex].value,
        '{y}/{m}/{d}'
      )
      // 构建时间字符串
      let selectTime = `${timeRange[0][hoursIndex].label}:${timeRange[1][minutesIndex].label}`
      // 更新数据
      this.setData({
        pickerSelectDate: selectDate,
        pickerSelectTime: selectTime,
        isAutoUpdateIndex: true,
        isUpdateIndex: false,
        pickerSelectIndexArr: [yearIndex, monthIndex, dayIndex, hoursIndex, minutesIndex]
      })
      let that = this
      setTimeout(() => {
        that.setData({
          isAutoUpdateIndex: false
        })
      }, 100)
    },
    getYears() {
      let minYear = this.LC_getYear(this.properties.minTime)
      let maxYear = this.LC_getYear(this.properties.maxTime)
      let tempArr = []
      for (let i = minYear; i <= maxYear; i++) {
        tempArr.push({
          label: i + '年',
          value: i
        })
      }
      return tempArr
    },
    getMonths(year) {
      let minMonth = 1
      let maxMonth = 12
      if (year <= this.LC_getYear(this.properties.minTime)) {
        minMonth = this.LC_getMonth(this.properties.minTime)
      }
      if (year >= this.LC_getYear(this.properties.maxTime)) {
        maxMonth = this.LC_getMonth(this.properties.maxTime)
      }
      let tempArr = []
      for (let i = minMonth; i <= maxMonth; i++) {
        tempArr.push({
          label: i < 10 ? '0' + i + '月' : i + '月',
          value: i
        })
      }
      return tempArr
    },
    getDays(year, month) {
      let dayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        dayInMonth[1] = 29
      }
      let minDay = 1
      let maxDay = dayInMonth[month - 1]
      if (
        year <= this.LC_getYear(this.properties.minTime) &&
        month <= this.LC_getMonth(this.properties.minTime)
      ) {
        minDay = this.LC_getDay(this.properties.minTime)
      }
      if (
        year >= this.LC_getYear(this.properties.maxTime) &&
        month >= this.LC_getMonth(this.properties.maxTime)
      ) {
        maxDay = this.LC_getDay(this.properties.maxTime)
      }
      let tempArr = []
      for (let i = minDay; i <= maxDay; i++) {
        tempArr.push({
          label: i < 10 ? '0' + i + '日' : i + '日',
          value: i
        })
      }
      return tempArr
    },
    /**
     * 农历时间设置
     * @dateObj 农历时间对象
     */
    setDateLunarTime(dateObj) {
      // 判断是否是闰月
      let isLeapMonth =
        dateObj.isLeapMonth && lunarCalendar.leapMonth(dateObj.year) == dateObj.month
      // 农历时间转农历对象
      let lunarDateObj = lunarCalendar.lunar2solar(
        dateObj.year,
        dateObj.month,
        dateObj.day,
        isLeapMonth
      )
      let yearArr = this.getLunarYears()
      let monthArr = this.getLunarMonths(lunarDateObj.lYear)
      let dayArr = this.getLunarDays(lunarDateObj.lYear, lunarDateObj.lMonth, isLeapMonth)
      let timeRange = this.data.timeRange

      this.setData({
        pickerYearArr: yearArr,
        pickerMonthArr: monthArr,
        pickerDayArr: dayArr
      })
      // 获取年月日index
      let yearIndex = yearArr.findIndex((item) => item.value == dateObj.year)
      let monthIndex = monthArr.findIndex((item) => item.label == lunarDateObj.IMonthCn)
      let dayIndex = dayArr.findIndex((item) => item.label == lunarDateObj.IDayCn)

      // 获取时分秒的index
      let hoursIndex = timeRange[0].findIndex((item) => item.value == dateObj.hours)
      let minutesIndex = timeRange[1].findIndex((item) => item.value == dateObj.minutes)

      // 最小年月日处理
      let minLunarTimeObj = this.LC_convertLunarTime(this.properties.minTime)
      let minYear = minLunarTimeObj.lYear
      let minMonth = minLunarTimeObj.lMonth
      let minDay = minLunarTimeObj.lDay
      if (dateObj.year <= minYear) {
        yearIndex = yearArr.findIndex((item) => item.value == minYear)
      }
      if (dateObj.year <= minYear && dateObj.month <= minMonth) {
        monthIndex = monthArr.findIndex((item) => item.value == minMonth)
      }
      if (dateObj.year <= minYear && dateObj.month <= minMonth && dateObj.day <= minDay) {
        dayIndex = dayArr.findIndex((item) => item.value == minDay)
      }
      // 最大年月日处理
      let maxLunarTimeObj = this.LC_convertLunarTime(this.properties.maxTime)
      let maxYear = maxLunarTimeObj.lYear
      let maxMonth = maxLunarTimeObj.lMonth
      let maxDay = maxLunarTimeObj.lDay
      if (dateObj.year >= maxYear) {
        yearIndex = yearArr.findIndex((item) => item.value == maxYear)
      }
      if (dateObj.year >= maxYear && dateObj.month >= maxMonth) {
        monthIndex = monthArr.findIndex((item) => item.value == maxMonth)
      }
      if (dateObj.year >= maxYear && dateObj.month >= maxMonth && dateObj.day >= maxDay) {
        dayIndex = dayArr.findIndex((item) => item.value == maxDay)
      }

      // 更新记录的选中时间
      let selectLunarTimeObj = lunarCalendar.lunar2solar(
        yearArr[yearIndex].value,
        monthArr[monthIndex].value,
        dayArr[dayIndex].value,
        isLeapMonth
      )
      let selectDate = TimeUtils.LC_timeToTime(selectLunarTimeObj.date, '{y}/{m}/{d}')
      // 构建时间字符串
      let selectTime = `${timeRange[0][hoursIndex].label}:${timeRange[1][minutesIndex].label}`
      // 更新数据
      this.setData({
        pickerSelectDate: selectDate,
        pickerSelectTime: selectTime,
        isAutoUpdateIndex: true,
        isUpdateIndex: false,
        pickerSelectIndexArr: [yearIndex, monthIndex, dayIndex, hoursIndex, minutesIndex]
      })
      let that = this
      setTimeout(() => {
        that.setData({
          isAutoUpdateIndex: false
        })
      }, 100)
    },
    getLunarYears() {
      let minLunarTimeObj = this.LC_convertLunarTime(this.properties.minTime)
      let maxLunarTimeObj = this.LC_convertLunarTime(this.properties.maxTime)
      let minYear = minLunarTimeObj.lYear
      let maxYear = maxLunarTimeObj.lYear
      let tempArr = []
      for (let i = minYear; i <= maxYear; i++) {
        tempArr.push({
          label: i + '(' + lunarCalendar.toGanZhiYear(i) + '年)',
          value: i
        })
      }
      return tempArr
    },
    getLunarMonths(year) {
      let minMonth = 1
      let maxMonth = 12
      let minLunarTimeObj = this.LC_convertLunarTime(this.properties.minTime)
      let maxLunarTimeObj = this.LC_convertLunarTime(this.properties.maxTime)
      if (year <= minLunarTimeObj.lYear) {
        minMonth = minLunarTimeObj.lMonth
      }
      if (year >= maxLunarTimeObj.lYear) {
        maxMonth = maxLunarTimeObj.lMonth
      }
      // 是否有闰月
      let leapMonth = lunarCalendar.leapMonth(year)
      let tempArr = []
      for (let i = minMonth; i <= maxMonth; i++) {
        tempArr.push({
          label: lunarCalendar.toChinaMonth(i),
          value: i,
          isLeapMonth: false
        })
      }
      if (leapMonth > 0 && leapMonth >= minMonth && leapMonth <= maxMonth) {
        tempArr.splice(leapMonth, 0, {
          label: '闰' + lunarCalendar.toChinaMonth(leapMonth),
          value: leapMonth,
          isLeapMonth: true
        })
      }
      return tempArr
    },
    getLunarDays(year, month, isLeapMonth = false) {
      let days = isLeapMonth
        ? lunarCalendar.leapDays(year)
        : lunarCalendar.monthDays(year, month)
      let minDay = 1
      let maxDay = days
      let minLunarTimeObj = this.LC_convertLunarTime(this.properties.minTime)
      let maxLunarTimeObj = this.LC_convertLunarTime(this.properties.maxTime)
      if (year <= minLunarTimeObj.lYear && month <= minLunarTimeObj.lMonth) {
        minDay = minLunarTimeObj.lDay
      }
      if (year >= maxLunarTimeObj.lYear && month >= maxLunarTimeObj.lMonth) {
        maxDay = maxLunarTimeObj.lDay
      }
      let tempArr = []
      for (let i = minDay; i <= maxDay; i++) {
        tempArr.push({
          label: lunarCalendar.toChinaDay(i),
          value: i
        })
      }
      return tempArr
    },
    onChangeStart() {
      // this.LC_log('开始滚动 -- onChangeStart')
      this.setData({
        isUpdateIndex: true
      })
    },
    onChangeEnd() {
      // this.LC_log('结束滚动 -- onChangeEnd')
      if (this.data.isAutoUpdateIndex) {
        this.setData({
          isAutoUpdateIndex: false
        })
      } else {
        let that = this
        setTimeout(() => {
          that.setData({
            isUpdateIndex: false
          })
          that.LC_log('拖动结束滚动 -- onChangeEnd')
        }, 100)
      }
      this.onConfirm()
    },
    // picker滚动事件
    onChange: function (event) {
      let value = event.detail.value
      // 年月日索引处理
      let yearIndex = value[0] >= 0 ? value[0] : 0
      let monthIndex = value[1] >= 0 ? value[1] : 0
      let dayIndex = value[2] >= 0 ? value[2] : 0
      // 时分的索引处理
      let hoursIndex = value[3] >= 0 ? value[3] : 0
      let minutesIndex = value[4] >= 0 ? value[4] : 0

      // 选择的年月日对象
      let yearObj = this.data.pickerYearArr[yearIndex]
      let monthObj = this.data.pickerMonthArr[monthIndex]
      let dayObj = this.data.pickerDayArr[dayIndex]
      // 选择的时分的对象
      let hoursObj = this.data.timeRange[0][hoursIndex]
      let minutesObj = this.data.timeRange[1][minutesIndex]

      // 滚动后更新数据
      if (this.data.isUpdateIndex) {
        if (this.data.pickerIsLunar) {
          this.setDateLunarTime({
            year: yearObj.value,
            month: monthObj.value,
            day: dayObj.value,
            isLeapMonth: monthObj.isLeapMonth,
            hours: hoursObj.value,
            minutes: minutesObj.value
          })
        } else {
          this.setDateTime({
            year: yearObj.value,
            month: monthObj.value,
            day: dayObj.value,
            hours: hoursObj.value,
            minutes: minutesObj.value
          })
        }
      }
      // 更新数据抛出
      this.onConfirm()
    },
    // 点击确定按钮 或者抛出去的方法
    onConfirm: function () {
      let selectDate = this.data.pickerSelectDate
      let selectTime = this.data.pickerSelectTime
      let dateStamp = TimeUtils.LC_convertTimeStamp(selectDate)
      let date = TimeUtils.LC_timeStampToYMD(dateStamp, '{y}-{m}-{d}')
      let lunarDateObj = this.LC_convertLunarTime(selectDate)
      let returnObj = {
        date: date, // 公历时间，格式：2020-02-02
        time: selectTime, // 选择的时间 格式 00：00
        timeObject: lunarDateObj // 公农历对象信息
      }
      this.setData({
        isShow: false
      })
      console.log('抛出的选择时间：', returnObj)
      log.info('抛出的选择时间：', returnObj)
      this.triggerEvent('updateLunarTime', returnObj)
    },
    // 公历农历切换
    onChangeTab(event) {
      const type = event.currentTarget.dataset.type
      if (type == 'solar') {
        // 阳历
        this.setData({
          titleActive: 0,
          pickerIsLunar: false
        })
      } else {
        this.setData({
          titleActive: 1,
          pickerIsLunar: true
        })
      }
      this.initData(true)
    },
    LC_getYear(time) {
      let dateObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(dateObj.year)
    },
    LC_getMonth(time) {
      let dateObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(dateObj.month)
    },
    LC_getDay(time) {
      let dateObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(dateObj.day)
    },
    /**
     * 将某个格式时间转化成农历
     * return JSON
     */
    LC_convertLunarTime(time) {
      const { year, month, day } = TimeUtils.LC_getYearMonthDayObj(time)
      let lunarCalendarTime = lunarCalendar.solar2lunar(year, month, day)
      return lunarCalendarTime
    },
    /**
     * 将某个字符串事件改为数组输出
     * return JSON
     */
    parseTimeString(timeString) {
      let [hours, minutes] = timeString.split(':').map(Number)
      return { hours, minutes }
    },
    LC_log(value) {
      console.log(value)
    }
  }
})
