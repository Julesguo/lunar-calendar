<template>
  <div class="lunar-date-picker fate-popup">
    <van-picker-group
      :tabs="['公历', '农历']"
      v-model:active-tab="titleActive"
      @confirm="onConfirm"
      @cancel="onCancel"
      :title="title"
    >
      <van-picker
        :columns="pickerColumns"
        @change="onChange"
        v-model="pickerSelectValueArr"
      />
      <van-picker
        :columns="pickerColumns"
        @change="onChange"
        v-model="pickerSelectValueArr"
      />
    </van-picker-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import TimeUtils from './timeUtils';
import calendar from './calendar';
interface PickerColumn {
  text: string;
  value: number;
  isLeapMonth?: boolean;
}
// 定义时分选项的类型
interface PickerTimeOption {
  text: string;
  value: number;
}
interface SelectedData {
  columnIndex: number;
  selectedValues: [number, number, number];
  selectedIndexes: [number, number, number];
}

// 公农历通用时间选择器
// 支持同步切换，设置默认选中时间、设置最大最小时间(公历范围：1901/01/01 ~ 2100/12/31)

// 接收父组件的方法和参数
const props = defineProps({
  // 是否切换到农历选择器，默认展示公历选择器
  isLunar: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '选择时间',
  },
  // 最小时间（公历），支持 1901/01/01 | 1901-01-01 | 1901年01月01日
  minTime: {
    type: String,
    default: '1901/01/01',
  },
  // 最大时间（公历），支持 2100/12/31 | 2100-12-31 | 2100年12月31日
  maxTime: {
    type: String,
    default: '2100/12/31',
  },
  // 默认选择时间，不传默认当天
  selectTime: {
    type: String,
    default: '1997/07/1 12:00',
  },
});
const emit = defineEmits(['updateLunarTime']);

// 初始化数据
const pickerYearArr = ref<Array<PickerColumn>>([]); // 年数组
const pickerMonthArr = ref<Array<PickerColumn>>([]); // 月数组
const pickerDayArr = ref<Array<PickerColumn>>([]); // 天数组
const timeRange = ref<[PickerTimeOption[], PickerTimeOption[]]>([[], []]);
const pickerSelectValueArr = ref<Array<number>>([]); // 选中的数值数组

const pickerSelectDate = ref(''); // 记录选择的时间(公历)，格式：1900/01/01
const pickerSelectTime = ref(''); // 记录选择的时间(公历)，格式：12:00
const pickerIsLunar = ref(props.isLunar); // true为农历，false为公历
const titleActive = ref(0); // 0为阳历  1为阴历
const pickerColumns = ref<Array<Array<PickerColumn>>>([[], [], [], [], []]); // picker组件的columns

onMounted(() => {
  initTimeRange(); // 初始化时分
  initData();
});

// 切换公农历
watch(titleActive, (newTitleActive) => {
  pickerIsLunar.value = newTitleActive === 1;
  initData(true); // 每次切换时重新初始化数据
});

// 初始化和切换公农历更新数据
const initData = (isUpdate = false) => {
  // 先格式化时分秒
  let selectDateTime = props.selectTime;
  if (!selectDateTime) {
    selectDateTime = '2000-07-01 12:00';
  }
  // 分割日期和时间部分
  const [datePart, timePart] = selectDateTime.split(' ');
  // 如果没有提供时间部分，则默认为 '12:00'
  let time = timePart || '12:00';
  // 如果时间部分包含秒，并且是 '12:00:00'，则只保留 '12:00'
  if (time.includes(':') && time.split(':').length === 3) {
    const [hours, minutes, seconds] = time.split(':');
    if (seconds === '00') {
      time = `${hours}:${minutes}`;
    }
  }

  if (!isUpdate) {
    pickerIsLunar.value = props.isLunar;
    pickerSelectDate.value = datePart;
    pickerSelectTime.value = time;
  }
  const dateObj = TimeUtils.LC_getYearMonthDayObj(pickerSelectDate.value);
  const timeObg = LC_parseTimeString(pickerSelectTime.value);
  // 根据选中的公历时间更新公农历
  if (pickerIsLunar.value) {
    // 使用农历工具转换公历日期为农历
    const lunarTimeObj = calendar.solar2lunar(
      dateObj.year,
      dateObj.month,
      dateObj.day,
    );

    const newTimeObj = {
      year: lunarTimeObj.lYear,
      month: lunarTimeObj.lMonth,
      day: lunarTimeObj.lDay,
      hours: timeObg.hours,
      minutes: timeObg.minutes,
      isLeapMonth: lunarTimeObj.IMonthCn.includes('闰'),
    };
    setDateLunarTime(newTimeObj);
  } else {
    const newTimeObj = {
      year: dateObj.year,
      month: dateObj.month,
      day: dateObj.day,
      hours: timeObg.hours,
      minutes: timeObg.minutes,
    };
    setDateTime(newTimeObj);
  }
};
/**
 * 公历时间设置
 * @timeObj 公历时间对象
 */
const setDateTime = (timeObj: {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}) => {
  let yearArr = getYears();
  let monthArr = getMonths(timeObj.year);
  let dayArr = getDays(timeObj.year, timeObj.month);
  let hoursArr = timeRange.value[0];
  let minutesArr = timeRange.value[1];

  pickerYearArr.value = yearArr;
  pickerMonthArr.value = monthArr;
  pickerDayArr.value = dayArr;
  pickerColumns.value = [yearArr, monthArr, dayArr, hoursArr, minutesArr];

  // 获取年月日index
  let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year);
  let monthIndex = monthArr.findIndex((item) => item.value == timeObj.month);
  let dayIndex = dayArr.findIndex((item) => item.value == timeObj.day);

  // 获取年月日的值
  let yearValue = yearArr[yearIndex].value;
  let monthValue = monthArr[monthIndex].value;
  let dayValue = dayArr[monthIndex].value;
  let hourValue = timeObj.hours;
  let minuteValue = timeObj.minutes;

  console.log('timeObj-pickerSelectValueArr', timeObj);

  console.log(
    '初始化的值-pickerSelectValueArr',
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  );

  // 最小年月日处理
  let minTime = props.minTime;
  if (timeObj.year <= LC_getYear(minTime)) {
    yearIndex = yearArr.findIndex((item) => item.value == LC_getYear(minTime));
  }
  if (
    timeObj.year <= LC_getYear(minTime) &&
    timeObj.month <= LC_getMonth(minTime)
  ) {
    monthIndex = monthArr.findIndex(
      (item) => item.value == LC_getMonth(minTime),
    );
  }
  if (
    timeObj.year <= LC_getYear(minTime) &&
    timeObj.month <= LC_getMonth(minTime) &&
    timeObj.day <= LC_getDay(minTime)
  ) {
    dayIndex = dayArr.findIndex((item) => item.value == LC_getDay(minTime));
  }
  // 最大年月日处理
  let maxTime = props.maxTime;
  if (timeObj.year >= LC_getYear(maxTime)) {
    yearIndex = yearArr.findIndex((item) => item.value == LC_getYear(maxTime));
  }
  if (
    timeObj.year >= LC_getYear(maxTime) &&
    timeObj.month >= LC_getMonth(maxTime)
  ) {
    monthIndex = monthArr.findIndex(
      (item) => item.value == LC_getMonth(props.maxTime),
    );
  }
  if (
    timeObj.year >= LC_getYear(maxTime) &&
    timeObj.month >= LC_getMonth(maxTime) &&
    timeObj.day >= LC_getDay(maxTime)
  ) {
    dayIndex = dayArr.findIndex((item) => item.value == LC_getDay(maxTime));
  }
  // 更新记录的选中时间
  let selectDate = TimeUtils.LC_timeToTime(
    yearArr[yearIndex].value +
      '/' +
      monthArr[monthIndex].value +
      '/' +
      dayArr[dayIndex].value,
    '{y}/{m}/{d}',
  );
  let selectTime = `${hourValue}:${minuteValue}`;

  // 更新数据
  pickerSelectDate.value = selectDate;
  pickerSelectTime.value = selectTime;
  // 需要将值填充进去而不是index
  pickerSelectValueArr.value = [
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  ];
  console.log('pickerSelectValueArr', pickerSelectValueArr.value);
};

// 获取公历年份
const getYears = (): PickerColumn[] => {
  const minYear = LC_getYear(props.minTime);
  const maxYear = LC_getYear(props.maxTime);
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    text: `${minYear + i}年`,
    value: minYear + i,
  }));
};

// 获取公历月份
const getMonths = (year: number): PickerColumn[] => {
  let minMonth = 1;
  let maxMonth = 12;
  if (year <= LC_getYear(props.minTime)) {
    minMonth = LC_getMonth(props.minTime);
  }
  if (year >= LC_getYear(props.maxTime)) {
    maxMonth = LC_getMonth(props.maxTime);
  }
  let tempArr = [];
  for (let i = minMonth; i <= maxMonth; i++) {
    tempArr.push({
      text: i < 10 ? '0' + i + '月' : i + '月',
      value: i,
    });
  }
  return tempArr;
};

// 获取公历日期
const getDays = (year: number, month: number): PickerColumn[] => {
  let dayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
    dayInMonth[1] = 29;
  }
  let minDay = 1;
  let maxDay = dayInMonth[month - 1];
  if (
    year <= LC_getYear(props.minTime) &&
    month <= LC_getMonth(props.minTime)
  ) {
    minDay = LC_getDay(props.minTime);
  }
  if (
    year >= LC_getYear(props.maxTime) &&
    month >= LC_getMonth(props.maxTime)
  ) {
    maxDay = LC_getDay(props.maxTime);
  }
  let tempArr = [];
  for (let i = minDay; i <= maxDay; i++) {
    tempArr.push({
      text: i < 10 ? '0' + i + '日' : i + '日',
      value: i,
    });
  }
  return tempArr;
};
/**
 * 农历时间设置
 * @timeObj 农历时间对象
 */
const setDateLunarTime = (timeObj: {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  isLeapMonth: boolean;
}) => {
  // 判断是否是闰月
  let isLeapMonth =
    timeObj.isLeapMonth && calendar.leapMonth(timeObj.year) == timeObj.month;
  // 农历时间转农历对象
  let lunarTimeObj = calendar.lunar2solar(
    timeObj.year,
    timeObj.month,
    timeObj.day,
    isLeapMonth,
  );
  let yearArr = getLunarYears();
  let monthArr = getLunarMonths(lunarTimeObj.lYear);
  let dayArr = getLunarDays(
    lunarTimeObj.lYear,
    lunarTimeObj.lMonth,
    isLeapMonth,
  );
  let hoursArr = timeRange.value[0];
  let minutesArr = timeRange.value[1];
  pickerYearArr.value = yearArr;
  pickerMonthArr.value = monthArr;
  pickerDayArr.value = dayArr;
  pickerColumns.value = [yearArr, monthArr, dayArr, hoursArr, minutesArr];

  // 获取年月日index
  let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year);
  let monthIndex = monthArr.findIndex(
    (item) => item.text == lunarTimeObj.IMonthCn,
  );
  let dayIndex = dayArr.findIndex((item) => item.text == lunarTimeObj.IDayCn);
  // 获取年月日的值
  let yearValue = yearArr[yearIndex].value;
  let monthValue = monthArr[monthIndex].value;
  let dayValue = dayArr[dayIndex].value;
  let hourValue = timeObj.hours;
  let minuteValue = timeObj.minutes;
  // 最小年月日处理
  let minLunarTimeObj = LC_convertLunarTime(props.minTime);
  let minYear = minLunarTimeObj.lYear;
  let minMonth = minLunarTimeObj.lMonth;
  let minDay = minLunarTimeObj.lDay;
  if (timeObj.year <= minYear) {
    yearIndex = yearArr.findIndex((item) => item.value == minYear);
  }
  if (timeObj.year <= minYear && timeObj.month <= minMonth) {
    monthIndex = monthArr.findIndex((item) => item.value == minMonth);
  }
  if (
    timeObj.year <= minYear &&
    timeObj.month <= minMonth &&
    timeObj.day <= minDay
  ) {
    dayIndex = dayArr.findIndex((item) => item.value == minDay);
  }
  // 最大年月日处理
  let maxLunarTimeObj = LC_convertLunarTime(props.maxTime);
  let maxYear = maxLunarTimeObj.lYear;
  let maxMonth = maxLunarTimeObj.lMonth;
  let maxDay = maxLunarTimeObj.lDay;
  if (timeObj.year >= maxYear) {
    yearIndex = yearArr.findIndex((item) => item.value == maxYear);
  }
  if (timeObj.year >= maxYear && timeObj.month >= maxMonth) {
    monthIndex = monthArr.findIndex((item) => item.value == maxMonth);
  }
  if (
    timeObj.year >= maxYear &&
    timeObj.month >= maxMonth &&
    timeObj.day >= maxDay
  ) {
    dayIndex = dayArr.findIndex((item) => item.value == maxDay);
  }
  // 更新记录的选中时间
  let selectLunarTimeObj = calendar.lunar2solar(
    yearArr[yearIndex].value,
    monthArr[monthIndex].value,
    dayArr[dayIndex].value,
    isLeapMonth,
  );
  let selectDate = TimeUtils.LC_timeToTime(
    selectLunarTimeObj.date,
    '{y}/{m}/{d}',
  );
  let selectTime = `${hourValue}:${minuteValue}`;

  // 更新数据
  pickerSelectDate.value = selectDate;
  pickerSelectTime.value = selectTime;
  // 需要将值填充进去而不是index
  pickerSelectValueArr.value = [
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  ];
};

// 获取农历年份
const getLunarYears = (): PickerColumn[] => {
  // const minLunarTimeObj = LC_convertLunarTime(props.minTime);
  // const maxLunarTimeObj = LC_convertLunarTime(props.maxTime);
  // const minYear = minLunarTimeObj.lYear;
  // const maxYear = maxLunarTimeObj.lYear;
  const minYear = LC_getYear(props.minTime);
  const maxYear = LC_getYear(props.maxTime);
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    text: `${minYear + i}年`,
    value: minYear + i,
  }));
};

// 获取农历月份
const getLunarMonths = (year: number): PickerColumn[] => {
  let minMonth = 1;
  let maxMonth = 12;
  let minLunarTimeObj = LC_convertLunarTime(props.minTime);
  let maxLunarTimeObj = LC_convertLunarTime(props.maxTime);
  if (year <= minLunarTimeObj.lYear) {
    minMonth = minLunarTimeObj.lMonth;
  }
  if (year >= maxLunarTimeObj.lYear) {
    maxMonth = maxLunarTimeObj.lMonth;
  }
  // 是否有闰月
  let leapMonth = calendar.leapMonth(year);
  let tempArr = [];
  for (let i = minMonth; i <= maxMonth; i++) {
    tempArr.push({
      text: calendar.toChinaMonth(i),
      value: i,
      isLeapMonth: false,
    });
  }
  if (leapMonth > 0 && leapMonth >= minMonth && leapMonth <= maxMonth) {
    tempArr.splice(leapMonth, 0, {
      text: '闰' + calendar.toChinaMonth(leapMonth),
      value: leapMonth,
      isLeapMonth: true,
    });
  }
  return tempArr;
};
// 获取农历天数
const getLunarDays = (
  year: number,
  month: number,
  isLeapMonth: boolean,
): PickerColumn[] => {
  const days = isLeapMonth
    ? calendar.leapDays(year)
    : calendar.monthDays(year, month);
  const minLunarTimeObj = LC_convertLunarTime(props.minTime);
  const maxLunarTimeObj = LC_convertLunarTime(props.maxTime);
  const minDay =
    year === minLunarTimeObj.lYear && month === minLunarTimeObj.lMonth
      ? minLunarTimeObj.lDay
      : 1;
  const maxDay =
    year === maxLunarTimeObj.lYear && month === maxLunarTimeObj.lMonth
      ? maxLunarTimeObj.lDay
      : days;
  return Array.from({ length: maxDay - minDay + 1 }, (_, i) => ({
    text: calendar.toChinaDay(i + 1),
    value: i + 1,
  }));
};

/***
 * 时间组件
 */
const initTimeRange = () => {
  // 使用辅助函数生成小时和分钟选项
  const generateTimeOptions = (
    limit: number,
    unit: string,
  ): PickerTimeOption[] =>
    Array.from({ length: limit }, (_, index) => ({
      text: `${index < 10 ? '0' : ''}${index}${unit}`, // 添加单位
      value: index,
    }));

  // 分别生成小时和分钟的选项列表
  const hours = generateTimeOptions(24, '时');
  const minutes = generateTimeOptions(60, '分');

  // 更新timeRange的值
  timeRange.value = [hours, minutes];
};

// 点击滑动
const onChange = ({
  columnIndex,
  selectedValues,
  selectedIndexes,
}: SelectedData) => {
  console.log('columnIndex', selectedValues);
  // selectedValues: [year, month, day, hours, minute],

  /*
   * 回来的数据
   * {
      "columnIndex": 1,
      "selectedValues": [1901,2,1],
      "selectedOptions": [
          {"text": "1901年","value": 1901},
          {"text": "02月","value": 2},
          {"text": "01日","value": 1}
      ],
      "selectedIndexes": [ 0,1, 0]
  }
   */
  // return;
  // 设置选中的年份、月份、日期
  pickerSelectValueArr.value = selectedValues;

  // 年月日索引处理
  let yearIndex = selectedIndexes[0] >= 0 ? selectedIndexes[0] : 0;
  let monthIndex = selectedIndexes[1] >= 0 ? selectedIndexes[1] : 0;
  let dayIndex = selectedIndexes[2] >= 0 ? selectedIndexes[2] : 0;
  // 获取选择的年、月、日对应的对象
  const selectedYear = pickerYearArr.value[yearIndex];
  const selectedMonth = pickerMonthArr.value[monthIndex];
  const selectedDay = pickerDayArr.value[dayIndex];
  const selectHour = selectedValues[3];
  const selectMinutes = selectedValues[4];
  console.log('selectHour', selectHour);
  console.log('selectMinutes', selectMinutes);

  if (pickerIsLunar.value) {
    setDateLunarTime({
      year: selectedYear.value,
      month: selectedMonth.value,
      day: selectedDay.value,
      hours: selectHour,
      minutes: selectMinutes,
      isLeapMonth: selectedMonth.isLeapMonth
        ? selectedMonth.isLeapMonth
        : false,
    });
  } else {
    setDateTime({
      year: selectedYear.value,
      month: selectedMonth.value,
      day: selectedDay.value,
      hours: selectHour,
      minutes: selectMinutes,
    });
  }
};

// 点击确定按钮 或者抛出去的方法
const onConfirm = () => {
  // 获取选中的时间
  console.log('pickerSelectValueArr', pickerSelectValueArr.value);
  console.log('pickerSelectDate', pickerSelectDate.value);
  console.log('pickerSelectTime', pickerSelectTime.value);

  // 将选中的时间转换成农历时间
  let dateStamp = TimeUtils.LC_convertTimeStamp(pickerSelectDate.value);
  let date = TimeUtils.LC_timeStampToYMD(dateStamp, '{y}/{m}/{d}');
  let lunarTimeObj = LC_convertLunarTime(pickerSelectDate.value);
  let selectedDateObj = {
    time: pickerSelectTime.value,
    date, // 公历时间，格式：2020/02/02
    timeObject: lunarTimeObj, // 公农历对象信息
    pickerIsLunar: pickerIsLunar.value,
  };
  emit('updateLunarTime', selectedDateObj);
};

// 点击取消
const onCancel = () => {};

/**
 * 将某个格式时间转化成农历
 * 传入公历年月日获得详细的公历、农历object信息 <=>JSON
 * !important! 公历参数区间1900.1.31~2100.12.31
 * @param time 2019年02月02日 | 2020/02/02 | 2020-02-02 | 2020/02/02 00:00:00 | 2020-02-02 00:00:00
 * return JSON
 */
const LC_convertLunarTime = (time: string) => {
  const { year, month, day } = TimeUtils.LC_getYearMonthDayObj(time);
  return calendar.solar2lunar(year, month, day);
};
const LC_getYear = (time: string) => {
  let timeObj = TimeUtils.LC_getYearMonthDayObj(time);
  return Number(timeObj.year);
};
const LC_getMonth = (time: string) => {
  let timeObj = TimeUtils.LC_getYearMonthDayObj(time);
  return Number(timeObj.month);
};
const LC_getDay = (time: string) => {
  let timeObj = TimeUtils.LC_getYearMonthDayObj(time);
  return Number(timeObj.day);
};
/**
 * 将某个字符串事件改为数组输出
 * return JSON
 */
const LC_parseTimeString = (timeString: String) => {
  let [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

const LC_log = (value: string) => {
  console.log(value);
};
</script>

<style lang="less" scoped>
.lunar-date-picker {
  width: 100%;
  height: 444px;
}
</style>
