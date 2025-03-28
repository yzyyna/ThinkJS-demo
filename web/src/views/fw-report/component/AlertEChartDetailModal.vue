<script>
/**
 * @desc 报警详细曲线组件
 * @auth demon3443002624@outlook.com
 * @date 2023-6-7 Wed. 14:49:02
 */

import * as echarts from 'echarts'

export default {
  name: 'AlertEChartDetail',
  components: {},
  data() {
    return {
      visibleState: false,
      chartEntity: null,
      showFlag: true,
      showLabel: ['进风阻力', '冷却水状态', '油底壳机油液位'],
      paramsNameList: this.$util.alertParamsSetting.paramsList.map((item) => item.label),
      selectParams: this.$util.alertParamsSetting.paramsSelect,

      color: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc',
        '#bcd53d',
        '#483e51'
      ]
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    visible: {
      required: true,
      type: Boolean
    },
    getChartOption: {
      type: Object,
      required: true
    }
  },
  //   inject: [''],
  //   provide() {
  //     return {}
  //   },
  computed: {},
  watch: {
    visible: {
      handler: function (nv) {
        // console.log('visible', nv)
        this.selectParams = this.$util.alertParamsSetting.paramsSelect
        this.visibleState = nv
      },
      immediate: true
    },
    getChartOption() {
      this.renderChart()
    }
  },
  methods: {
    async renderChart() {
      this.$nextTick(async function () {
        this.chartEntity || (this.chartEntity = echarts.init(document.getElementById(this.id)))
        const data = await this.getChartData()
        const { Data, Precisions } = data

        const xAxisData = (() => {
          const arr = []
          for (let i = 0; i < 10; i += 0.1) {
            arr.push(Number(i.toFixed(1)))
          }
          return arr
        })()
        let legendData = [],
          yAxisData = [],
          seriesData = []

        // 设置发动机 Y轴轴线数据
        const yAxisShowItems = this.$util.alertParamsSetting.chartYAxisItems
        yAxisShowItems.forEach((item, index) => {
          // 设置yAxisData
          const yAxisDataItem = {
            type: 'value',
            name: item.label,
            // min: 0,
            // max: 250,
            position: index <= 5 ? 'left' : 'right',
            offset: index >= 1 && index <= 5 ? index * 35 : index >= 7 ? (index - 6) * 45 : 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: this.color[index]
              }
            },
            splitLine: {
              // show: index === 0 ? true : false,
              lineStyle: {
                color: '#6E7079',
                opacity: 0.4
              }
            },
            axisLabel: {
              formatter: `{value} ${item.unit || ''}`,
              fontSize: 10,
              margin: 4
            }
          }
          yAxisData.push(yAxisDataItem)
        })

        const paramsList = this.$util.alertParamsSetting.paramsList
        paramsList.forEach((item, index) => {
          if (this.selectParams.includes(item.label)) {
            let key = item.label
            // 数据精度处理
            const arr = Data[key] ? Data[key].split(',') : []
            const arr2 = arr.map((e, i) => {
              const currentNumber = Number(e) * Number(Precisions[key])
              return Number.isInteger(currentNumber)
                ? currentNumber
                : Number(currentNumber.toFixed(2))
            })

            if (item.children && item.children.length > 0) {
              legendData.push(...item.children)
              item.children.forEach((cItem, cIndex) => {
                const cData = arr2.map((dItem) => {
                  const dData = dItem.toString(2).split('').reverse().join('').charAt(cIndex)
                  return dData ? dData * 1 : 0
                })
                const seriesDataItem = {
                  name: cItem,
                  type: item.type,
                  yAxisIndex: item.yIndex,
                  data: cData,
                  showAllSymbol: false
                }
                seriesData.push(seriesDataItem)
              })
              // console.log(legendData, seriesData)
            } else {
              legendData.push(key)
              // 设置seriesData
              const seriesDataItem = {
                name: key,
                type: item.type,
                yAxisIndex: item.yIndex,
                data: arr2,
                showAllSymbol: false
              }
              seriesData.push(seriesDataItem)
            }
          }
        })

        // this.legendData = legendData
        // this.yAxisData = yAxisData
        // this.seriesData = seriesData
        // console.log(legendData, xAxisData, yAxisData, seriesData)
        const option = {
          tooltip: {
            trigger: 'axis',
            alwaysShowContent: false,
            triggerOn: false ? 'none' : 'mousemove|click'
          },
          grid: {
            x: 200,
            y: 24,
            x2: 210,
            y2: 24,
            top: '20%'
            // left: '5%',
            // right: '5%'
          },
          legend: {
            type: 'scroll',
            width: '70%',
            textStyle: {
              color: 'rgba(110, 112, 121, 1)'
            },
            pageIconColor: 'rgba(110, 112, 121, 1)',
            pageTextStyle: {
              color: 'rgba(110, 112, 121, 1)'
            },
            data: legendData
          },
          xAxis: [
            {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              axisLabel: {
                interval: 4
              },
              boundaryGap: false,
              data: xAxisData
            }
          ],
          yAxis: yAxisData,
          series: seriesData
        }
        this.chartEntity.clear()
        this.chartEntity.setOption(option)
      })
    },
    _resize() {
      this.chartEntity && this.chartEntity.resize()
    },
    getChartData() {
      return this.$api.fwReport.findGensetRecordReportCurve(this.getChartOption).then((value) => {
        return value
      })
    },
    selectParamsChange() {
      this.renderChart()
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // this.renderChart()
    window.addEventListener('resize', this._resize)
  },
  beforeUpdated() {},
  updated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this._resize)
  },
  destroyed() {}
}
</script>
<template>
  <Modal
    :title="getChartOption.title || '曲线详情'"
    :mask-closable="false"
    class="alert-echart-detail-dialog"
    v-model="visibleState"
    width="1200"
    @on-cancel="() => $emit('on-cancel')"
  >
    <div class="alert-echart-detail-content">
      <div class="params-select-box">
        <Checkbox-group
          class="params-checkbox-group"
          v-model="selectParams"
          @on-change="selectParamsChange()"
        >
          <Checkbox
            class="params-checkbox-item"
            v-for="(item, index) in paramsNameList"
            :key="index"
            :label="item"
          ></Checkbox>
        </Checkbox-group>
      </div>
      <div
        :id="id"
        :style="{
          height: '400px',
          display: showFlag ? '' : 'none'
        }"
        class="alert-e-chart"
      ></div>
    </div>
    <Row slot="footer">
      <!-- <Button @click="onCancel">取消</Button>
      <Button @click="onConfirm" type="primary">确定选择</Button> -->
    </Row>
  </Modal>
</template>

<style lang="less" scoped>
.alert-echart-detail-dialog {
  .params-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    .params-checkbox-item {
      width: calc(100% / 6);
      margin: 0 0 4px 0;
    }
  }
}
</style>
