
const TimeUtils = require('@/utils/timeUtils')

Page({
  options: {
  },
  /**
   * 页面的初始数据
   */
  data: {
   

    birthDate: '', // 出生日期
    birthDateValue: '', // 出生日期 前面加公历
    birthDateStamp: new Date().getTime(), // 出生日期的时间戳
    tempSelectDate: '', // 滚动触发选择的日期
    tempSelectTime: '', // 滚动触发选择的时间

    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.initBirthDateTime()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },
  // 初始化生日选择
  initBirthDateTime() {
    // 初始化时间选择
    let birthDate = this.data.birthDate
    if (!birthDate) {
      birthDate = TimeUtils.LC_timeStampToYMDHM('2000-07-01 12:00')
    }
    let [date, time] = birthDate.split(' ')
    if (!time) {
      time = '12:00'
    }
    console.log('分割日期：', date, time)
    this.setData({
      tempSelectDate: date,
      tempSelectTime: time
    })
  },

  // 出生日期
  onshowBirthDatePicker() {
    this.setData({
      isBirthDatePickerVisible: true
    })
  },
  onCloseBirthDatePicker() {
    this.setData({
      isBirthDatePickerVisible: false
    })
  },
  async onConfirmBirthDatePicker() {
    this.setData({
      isBirthDatePickerVisible: false
    })
    // 确认选择的日期
    const tempSelectDate = this.data.tempSelectDate
    let tempSelectTime = this.data.tempSelectTime

    // 将获取到的时候转字符串
    if (!tempSelectTime) {
      tempSelectTime = '00:00'
    }
    const selectDateTime = `${tempSelectDate} ${tempSelectTime}`
    console.log('实际打印的时间：', selectDateTime)

    // 转时间戳
    let selectDateTimeStamp = TimeUtils.LC_convertTimeStamp(selectDateTime)

    this.setData({
      birthDate: selectDateTime,
      birthDateValue: `公历 ${selectDateTime}`,
      birthDateStamp: selectDateTimeStamp
    })
  },
  // 触发了时间选择
  onUpdateLunarTime(event) {
    this.setData({
      tempSelectDate: event.detail.date,
      tempSelectTime: event.detail.time
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

})
