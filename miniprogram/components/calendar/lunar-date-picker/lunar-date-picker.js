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
    // 默认选择时间，不传默认当天
    selectTime: {
      type: String,
      value: TimeUtils.LC_timeStampToYMD()
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pickerYearArr: [], // 年数组
    pickerMonthArr: [], // 月数组
    pickerDayArr: [], // 天数组
    pickerSelectIndexArr: [], // 选中的index数组
    pickerSelectTime: '', // 记录选择的时间(公历)，格式：1900/01/01
    pickerIsLunar: false,
    titleActive: 0, // 0为阳历  1为阴历
    isUpdateIndex: false,
    isAutoUpdateIndex: false
  },

  lifetimes: {
    detached: function () {
      // 页面销毁时执行
      // console.info('---JhLunarPicker unloaded!---')
    },
    attached: function () {
      // 页面创建时执行
      // console.info('---JhLunarPicker loaded!---')
    },
    ready: function () {
      this.initData()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化和切换公农历更新数据
    initData(isUpdate) {
      this.LC_log('初始化和切换公农历更新数据')
      if (!isUpdate) {
        this.setData({
          pickerIsLunar: this.properties.isLunar,
          titleActive: this.properties.isLunar ? 1 : 0,
          pickerSelectTime: this.properties.selectTime
        })
      }
      // 根据选中的公历时间更新公农历
      let timeObj = TimeUtils.LC_getYearMonthDayObj(this.data.pickerSelectTime)
      if (this.data.pickerIsLunar) {
        // 选择的时间转成农历
        let lunarTimeObj = lunarCalendar.solar2lunar(
          timeObj.year,
          timeObj.month,
          timeObj.day
        )
        let newTimeObj = {}
        // 农历年月日赋值
        newTimeObj.year = lunarTimeObj.lYear
        newTimeObj.month = lunarTimeObj.lMonth
        newTimeObj.day = lunarTimeObj.lDay
        // 判断是否是闰月
        newTimeObj.isLeapMonth = lunarTimeObj.IMonthCn.includes('闰')
        this.setDateLunarTime(newTimeObj)
      } else {
        this.setDateTime(timeObj)
      }
    },
    /**
     * 公历时间设置
     * @timeObj 公历时间对象
     */
    setDateTime(timeObj) {
      let yearArr = this.getYears()
      let monthArr = this.getMonths(timeObj.year)
      let dayArr = this.getDays(timeObj.year, timeObj.month)
      this.setData({
        pickerYearArr: yearArr,
        pickerMonthArr: monthArr,
        pickerDayArr: dayArr
      })
      // 获取年月日index
      let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year)
      let monthIndex = monthArr.findIndex((item) => item.value == timeObj.month)
      let dayIndex = dayArr.findIndex((item) => item.value == timeObj.day)
      // 最小年月日处理
      let minTime = this.properties.minTime
      if (timeObj.year <= this.LC_getYear(minTime)) {
        yearIndex = yearArr.findIndex((item) => item.value == this.LC_getYear(minTime))
      }
      if (
        timeObj.year <= this.LC_getYear(minTime) &&
        timeObj.month <= this.LC_getMonth(minTime)
      ) {
        monthIndex = monthArr.findIndex((item) => item.value == this.LC_getMonth(minTime))
      }
      if (
        timeObj.year <= this.LC_getYear(minTime) &&
        timeObj.month <= this.LC_getMonth(minTime) &&
        timeObj.day <= this.LC_getDay(minTime)
      ) {
        dayIndex = dayArr.findIndex((item) => item.value == this.LC_getDay(minTime))
      }
      // 最大年月日处理
      let maxTime = this.properties.maxTime
      if (timeObj.year >= this.LC_getYear(maxTime)) {
        yearIndex = yearArr.findIndex((item) => item.value == this.LC_getYear(maxTime))
      }
      if (
        timeObj.year >= this.LC_getYear(maxTime) &&
        timeObj.month >= this.LC_getMonth(maxTime)
      ) {
        monthIndex = monthArr.findIndex(
          (item) => item.value == this.LC_getMonth(this.properties.maxTime)
        )
      }
      if (
        timeObj.year >= this.LC_getYear(maxTime) &&
        timeObj.month >= this.LC_getMonth(maxTime) &&
        timeObj.day >= this.LC_getDay(maxTime)
      ) {
        dayIndex = dayArr.findIndex((item) => item.value == this.LC_getDay(maxTime))
      }
      // 更新记录的选中时间
      let selectTime = TimeUtils.LC_timeToTime(
        yearArr[yearIndex].value +
          '/' +
          monthArr[monthIndex].value +
          '/' +
          dayArr[dayIndex].value,
        '{y}/{m}/{d}'
      )
      // 更新数据
      this.setData({
        pickerSelectTime: selectTime,
        isAutoUpdateIndex: true,
        isUpdateIndex: false,
        pickerSelectIndexArr: [yearIndex, monthIndex, dayIndex]
      })
      let that = this
      setTimeout(() => {
        that.setData({
          isAutoUpdateIndex: false
        })
      }, 300)
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
     * @timeObj 农历时间对象
     */
    setDateLunarTime(timeObj) {
      // 判断是否是闰月
      let isLeapMonth =
        timeObj.isLeapMonth && lunarCalendar.leapMonth(timeObj.year) == timeObj.month
      // 农历时间转农历对象
      let lunarTimeObj = lunarCalendar.lunar2solar(
        timeObj.year,
        timeObj.month,
        timeObj.day,
        isLeapMonth
      )
      let yearArr = this.getLunarYears()
      let monthArr = this.getLunarMonths(lunarTimeObj.lYear)
      let dayArr = this.getLunarDays(lunarTimeObj.lYear, lunarTimeObj.lMonth, isLeapMonth)
      this.setData({
        pickerYearArr: yearArr,
        pickerMonthArr: monthArr,
        pickerDayArr: dayArr
      })
      // 获取年月日index
      let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year)
      let monthIndex = monthArr.findIndex((item) => item.label == lunarTimeObj.IMonthCn)
      let dayIndex = dayArr.findIndex((item) => item.label == lunarTimeObj.IDayCn)
      // 最小年月日处理
      let minLunarTimeObj = this.LC_convertLunarTime(this.properties.minTime)
      let minYear = minLunarTimeObj.lYear
      let minMonth = minLunarTimeObj.lMonth
      let minDay = minLunarTimeObj.lDay
      if (timeObj.year <= minYear) {
        yearIndex = yearArr.findIndex((item) => item.value == minYear)
      }
      if (timeObj.year <= minYear && timeObj.month <= minMonth) {
        monthIndex = monthArr.findIndex((item) => item.value == minMonth)
      }
      if (timeObj.year <= minYear && timeObj.month <= minMonth && timeObj.day <= minDay) {
        dayIndex = dayArr.findIndex((item) => item.value == minDay)
      }
      // 最大年月日处理
      let maxLunarTimeObj = this.LC_convertLunarTime(this.properties.maxTime)
      let maxYear = maxLunarTimeObj.lYear
      let maxMonth = maxLunarTimeObj.lMonth
      let maxDay = maxLunarTimeObj.lDay
      if (timeObj.year >= maxYear) {
        yearIndex = yearArr.findIndex((item) => item.value == maxYear)
      }
      if (timeObj.year >= maxYear && timeObj.month >= maxMonth) {
        monthIndex = monthArr.findIndex((item) => item.value == maxMonth)
      }
      if (timeObj.year >= maxYear && timeObj.month >= maxMonth && timeObj.day >= maxDay) {
        dayIndex = dayArr.findIndex((item) => item.value == maxDay)
      }
      // 更新记录的选中时间
      let selectLunarTimeObj = lunarCalendar.lunar2solar(
        yearArr[yearIndex].value,
        monthArr[monthIndex].value,
        dayArr[dayIndex].value,
        isLeapMonth
      )
      let selectTime = TimeUtils.LC_timeToTime(selectLunarTimeObj.date, '{y}/{m}/{d}')
      this.setData({
        pickerSelectTime: selectTime,
        isAutoUpdateIndex: true,
        isUpdateIndex: false,
        pickerSelectIndexArr: [yearIndex, monthIndex, dayIndex]
      })
      let that = this
      setTimeout(() => {
        that.setData({
          isAutoUpdateIndex: false
        })
      }, 300)
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
        }, 300)
      }
      this.onConfirm()
    },
    // picker滚动事件
    onChange: function (event) {
      let value = event.detail.value
      this.LC_log('==========滚动index==========')
      this.LC_log(value)

      // 年月日索引处理
      let yearIndex = value[0] >= 0 ? value[0] : 0
      let monthIndex = value[1] >= 0 ? value[1] : 0
      let dayIndex = value[2] >= 0 ? value[2] : 0
      // 选择的年月日对象
      let yearObj = this.data.pickerYearArr[yearIndex]
      let monthObj = this.data.pickerMonthArr[monthIndex]
      let dayObj = this.data.pickerDayArr[dayIndex]
      // 滚动后更新数据
      if (this.data.isUpdateIndex) {
        if (this.data.pickerIsLunar) {
          this.setDateLunarTime({
            year: yearObj.value,
            month: monthObj.value,
            day: dayObj.value,
            isLeapMonth: monthObj.isLeapMonth
          })
        } else {
          this.setDateTime({
            year: yearObj.value,
            month: monthObj.value,
            day: dayObj.value
          })
        }
      }
    },
    // 点击确定按钮 或者抛出去的方法
    onConfirm: function () {
      let selectTime = this.data.pickerSelectTime
      let timeStamp = TimeUtils.LC_convertTimeStamp(selectTime)
      let time = TimeUtils.LC_timeStampToYMD(timeStamp, '{y}-{m}-{d}')
      let lunarTimeObj = this.LC_convertLunarTime(selectTime)
      let returnObj = {
        time: time, // 公历时间，格式：2020/02/02
        timeObject: lunarTimeObj // 公农历对象信息
      }
      this.setData({
        isShow: false
      })
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
      let timeObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(timeObj.year)
    },
    LC_getMonth(time) {
      let timeObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(timeObj.month)
    },
    LC_getDay(time) {
      let timeObj = TimeUtils.LC_getYearMonthDayObj(time)
      return Number(timeObj.day)
    },
    /**
     * 将某个格式时间转化成农历
     * 传入公历年月日获得详细的公历、农历object信息 <=>JSON
     * !important! 公历参数区间1900.1.31~2100.12.31
     * @param time 2019年02月02日 | 2020/02/02 | 2020-02-02 | 2020/02/02 00:00:00 | 2020-02-02 00:00:00
     * return JSON
     */
    LC_convertLunarTime(time) {
      const { year, month, day } = TimeUtils.LC_getYearMonthDayObj(time)
      let lunarCalendarTime = lunarCalendar.solar2lunar(year, month, day)
      return lunarCalendarTime
    },
    parseTimeString(timeString) {
      let [hours, minutes] = timeString.split(':').map(Number)
      return { hours, minutes }
    },
    LC_log(value) {
      console.log(value)
    }
  }
})
