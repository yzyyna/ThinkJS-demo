<template>
  <div id="app">
      <div>
            <Tag color="green">交易类型，值为1：，中文显示为：{{value1}}</Tag>
            <br><br>
            <Tag color="red">交易类型，值为99(假的)：，中文显示为：{{value2}}</Tag>

            <br><br>
            <br><br>
            支付方式：
             <Select style="width:200px" @on-change='change'>
                <Option v-for="item in orderTypeList" :value="item.value" :key="item.value" >{{ item.label }}</Option>
            </Select>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import util from '@/libs/util.js';
  export default{  
      data(){
        return {
          value1:'1',
          value2:'99',
          orderTypeList:[]
        }
      },
      methods: {
        change(value){
          this.$Message.info({
                content: '当前选择的值为：'+value
            });
        }
      },
      mounted () {
        this.value1=util.showDictLabel('order_type',this.value1);
        this.value2=util.showDictLabel('order_type',this.value2);
        this.orderTypeList=util.showDictList('order_type');
      }
  }

</script>
