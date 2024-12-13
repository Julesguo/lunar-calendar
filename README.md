# lunar-calendar
基于van-picker+calendar实现的公历和农历日历切换，有vue版本和小程序版本，封装成组件直接调用即可

开箱即用

vue项目贴图
![公历](C:\Users\Administrator\Desktop\公历.png)

![农历](C:\Users\Administrator\Desktop\农历.png)

代码结构：
├─vue 【vue项目组件文件夹】
|  ├─index.vue    【vue项目使用页面实例代码】
|  ├─components
|  |     ├─lunar-calendar
|  |     |       ├─calendar.ts
|  |     |       ├─lunar-date-picker.vue【阴历农历的组件，选择年月日】
|  |     |       ├─lunar-time-picker.vue【阴历农历的组件，选择年月日时分】
|  |     |       └timeUtils.ts  【一些格式化时间数据的方法】
├─miniprogram  【小程序项目组件文件夹】
|      ├─pages 【小程序实例代码】
|      |   ├─index.js
|      |   ├─index.json
|      |   ├─index.scss
|      |   └index.wxml
|      ├─components
|      |     ├─calendar
|      |     |    ├─calendar.js
|      |     |    ├─timeUtils.js
|      |     |    ├─lunar-time-picker   【阴历农历的组件，选择年月日时分】
|      |     |    |         ├─lunar-time-picker.js
|      |     |    |         ├─lunar-time-picker.json
|      |     |    |         ├─lunar-time-picker.scss
|      |     |    |         └lunar-time-picker.wxml
|      |     |    ├─lunar-date-picker    【阴历农历的组件，选择年月日】
|      |     |    |         ├─lunar-date-picker.js
|      |     |    |         ├─lunar-date-picker.json
|      |     |    |         ├─lunar-date-picker.scss
|      |     |    |         └lunar-date-picker.wxml
├─images
|   ├─公历.png
|   └农历.png