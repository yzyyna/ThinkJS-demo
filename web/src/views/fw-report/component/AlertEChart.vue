<script>
/**
 * @desc 报警曲线组件
 * @auth demon3443002624@outlook.com
 * @date 2023-6-7 Wed. 14:49:02
 */

import * as echarts from 'echarts'

export default {
  name: 'AlertEChart',
  components: {},
  data() {
    return {
      chartEntity: null,
      showFlag: true,
      showLabel: ['进风阻力', '冷却水状态', '油底壳机油液位']
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    getChartOption: {
      type: Object,
      required: true
    },
    showTooltipFlag: {
      type: Boolean,
      default: false
    }
  },
  //   inject: [''],
  //   provide() {
  //     return {}
  //   },
  computed: {},
  watch: {
    getChartOption() {
      this.renderChart()
    }
  },
  methods: {
    async renderChart() {
      const alertType = this.getChartOption.Describe && this.getChartOption.Describe.split('-')[1]
      const hasAlertCurve = this.$util.alertTypeMapping[alertType]
      if (hasAlertCurve && Object.keys(this.getChartOption).length > 0) {
        this.showFlag = true
        this.$nextTick(async function () {
          this.chartEntity || (this.chartEntity = echarts.init(document.getElementById(this.id)))
          const data = await this.getChartData()
          const reference = hasAlertCurve
          const { Data, Precisions } = data
          const series = []
          const showTooltipFlag =
            reference.max.concat(reference.min).length === 1 && this.showTooltipFlag
          const xAxisData = (() => {
            const arr = []
            for (let i = 0; i < 10; i += 0.1) {
              arr.push(Number(i.toFixed(1)))
            }
            return arr
          })()
          let maxDataIndex = null
          let minDataIndex = null
          let showTipDataIndex = null
          let showTipSeriesIndex = null

          for (const key in Data) {
            if (reference.params.includes(key)) {
              const arr = Data[key] ? Data[key].split(',') : []
              let max = arr.length > 0 ? Number(arr[0]) * Number(Precisions[key]) : '-'
              let min = max
              let type = reference.max.includes(key)
                ? 'max'
                : reference.min.includes(key)
                ? 'min'
                : null
              const arr2 = arr.map((e, i) => {
                const currentNumber = Number(e) * Number(Precisions[key])
                if (type !== null) {
                  if (currentNumber > max) {
                    max = currentNumber
                    maxDataIndex = i
                  }
                  if (currentNumber < min) {
                    min = currentNumber
                    minDataIndex = i
                  }
                }
                // return currentNumber - Number((Math.random() * (1000 - 500) + 500).toFixed(0))
                return Number.isInteger(currentNumber)
                  ? currentNumber
                  : Number(currentNumber.toFixed(2))
              })
              const markPoint = type
                ? {
                    data: [
                      {
                        symbol: 'circle',
                        symbolSize: 12,
                        itemStyle: {
                          color: '#a80000'
                        },
                        type,
                        label: {
                          show: true,
                          color: '#a80000',
                          fontSize: 16,
                          position: type === 'max' ? 'top' : 'bottom',
                          formatter: (params) => {
                            return key + ':' + params.value
                          }
                        }
                      }
                    ]
                  }
                : {}
              showTipDataIndex =
                type === 'max' ? maxDataIndex : type === 'min' ? minDataIndex : null
              series.push({
                name: key,
                type: 'line',
                data: arr2,
                markPoint
              })
              showTipSeriesIndex = type === null ? null : series.length - 1
            }
          }

          const labelDatas = []
          this.showLabel.forEach((e) => {
            if (reference.params.includes(e)) {
              labelDatas.push({
                label: e,
                value: Data[e] ? Data[e] : '-'
              })
            }
          })

          const option = {
            tooltip: {
              trigger: 'axis',
              alwaysShowContent: this.showTooltipFlag,
              triggerOn: this.showTooltipFlag ? 'none' : 'mousemove|click'
            },
            grid: {
              left: '5%',
              right: '5%'
            },
            legend: {},
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xAxisData
            },
            yAxis: {
              type: 'value'
            },
            series: series
          }
          this.chartEntity.setOption(option)
          showTooltipFlag &&
            this.chartEntity.dispatchAction({
              type: 'showTip',
              // name 无法匹配!!!
              // name: showTipDataIndex,
              dataIndex: showTipDataIndex,
              seriesIndex: showTipSeriesIndex
            })
        })
      } else {
        this.showFlag = false
      }
    },
    _resize() {
      this.chartEntity && this.chartEntity.resize()
    },
    getChartData() {
      return this.$api.fwReport.findGensetRecordReportCurve(this.getChartOption).then((value) => {
        return value
      })
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.renderChart()
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
  <div
    :id="id"
    :style="{
      height: '400px',
      display: showFlag ? '' : 'none'
    }"
    class="alert-e-chart"
  ></div>
</template>

<style lang='less' scoped>
</style>