<template>
  <div class="container">
    <van-cell
      :class="{ 'born-time-disabled': !formData.bornTime }"
      title="出生时间"
      :value="formData.bornTime || ''"
      is-link
      @click="showTimePop = true"
    />
    <van-popup
      v-model:show="showTimePop"
      destroy-on-close
      position="bottom"
      round
      title="选择出生时间"
      :style="{ height: '364px' }"
    >
      <Lunartimepicker
        @updateLunarTime="updateLunarTime"
        :selectTime="selectTime"
        :isLunar="isLunar"
        :title="'出生时间'"
        :style="{ height: '264px' }"
      ></Lunartimepicker>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Lunartimepicker from "./components/lunar-calendar/lunar-time-picker.vue";

const showTimePop = ref(false);
const isBirthPlace = ref(true); // 是否是出生地点
const selectTime = ref("1997/07/1 12:00"); //formatToDateTime(new Date())
const isLunar = ref(false);
const updateLunarTime = (selectedDateObj: any) => {
  showTimePop.value = false;
  isLunar.value = selectedDateObj.pickerIsLunar;
  console.log("选中的时间", selectedDateObj);
};
</script>

<style lang="less" scoped>
.container-submit {
  padding-left: 32px;
  padding-right: 32px;
  font-size: 28px;
  line-height: 42px;
  .submit-btn {
    margin-top: 49px;
    margin-left: -32px;
    margin-right: -32px;
    img {
      // height: 149px;
      width: 100%;
    }
  }
}
.file-bg {
  width: 100%;
  height: 1105px;
  background-image: url("@/assets/images/fateYear/file-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding-left: 32px;
  padding-right: 32px;
  box-sizing: border-box;
  text-align: center;
  .cell-group {
    border-radius: 24px;
    overflow: hidden;
    text-align: left;
    margin-top: 48px;
    .van-cell {
      height: 124px;
      font-size: 30px;
      align-items: center;
      :deep(.van-cell__title) {
        margin-right: var(--van-field-label-margin-right);
        flex: none;
        width: 130px;
        color: #606875;
      }
      :deep(.van-cell__value) {
        color: #0a1220;
      }
    }
    .born-time-disabled {
      :deep(.van-cell__value) {
        color: var(--van-text-color-3);
      }
    }
    .icon-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 132px;
      height: 60px;
      border-radius: 30px;
      background-color: #f3f4f7;
      color: #606875;
      border: 1px solid transparent;
      img {
        width: 24px;
        height: 24px;
        margin-right: 4px;
      }
    }
    .female-btn {
      margin-right: 32px;
    }
    .female-btn.active {
      background-color: #fff2f1;
      border: 1px solid #fb5951;
    }
    .male-btn.active {
      background-color: #edf5ff;
      border: 1px solid #59a5fa;
    }
  }
  .file-confirm-text {
    width: 192px;
    height: 60px;
    margin-top: 257px;
  }
  .tip-gray {
    color: #606875;
  }
}
</style>
