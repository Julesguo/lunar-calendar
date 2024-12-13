# lunar-calendar

基于 van-picker+calendar 实现的公历和农历日历切换，有 vue 版本和小程序版本，封装成组件直接调用即可

开箱即用，觉得好用记得点星星哦

vue 项目贴图
![公历](https://github.com/Julesguo/lunar-calendar/blob/main/images/%E5%85%AC%E5%8E%86.png)

![农历](https://github.com/Julesguo/lunar-calendar/blob/main/images/%E5%86%9C%E5%8E%86.png)

代码结构：
├─vue 【vue 项目组件文件夹】
| ├─index.vue 【vue 项目使用页面实例代码】
| ├─components
| | ├─lunar-calendar
| | | ├─calendar.ts
| | | ├─lunar-date-picker.vue【阴历农历的组件，选择年月日】
| | | ├─lunar-time-picker.vue【阴历农历的组件，选择年月日时分】
| | | └timeUtils.ts 【一些格式化时间数据的方法】
├─miniprogram 【小程序项目组件文件夹】
| ├─pages 【小程序实例代码】
| | ├─index.js
| | ├─index.json
| | ├─index.scss
| | └index.wxml
| ├─components
| | ├─calendar
| | | ├─calendar.js
| | | ├─timeUtils.js
| | | ├─lunar-time-picker 【阴历农历的组件，选择年月日时分】
| | | | ├─lunar-time-picker.js
| | | | ├─lunar-time-picker.json
| | | | ├─lunar-time-picker.scss
| | | | └lunar-time-picker.wxml
| | | ├─lunar-date-picker 【阴历农历的组件，选择年月日】
| | | | ├─lunar-date-picker.js
| | | | ├─lunar-date-picker.json
| | | | ├─lunar-date-picker.scss
| | | | └lunar-date-picker.wxml
├─images
| ├─ 公历.png
| └ 农历.png
