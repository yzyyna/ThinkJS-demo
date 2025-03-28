<style lang="less">
</style>

<template>
     <div>    
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="ios-list"></Icon>
                        代码生成器
                    </p>
                    <Row>
                        <Select v-model="tablename" placeholder="请选择要生成代码的表名" style="width: 200px">
                            <Option v-for="item in tableList" :value="item.name+'|'+item.comment" :key="item.name">{{ item.name }}</Option>
                        </Select>
                        <span @click="handleSearch" style="margin: 0 10px;"><Button type="primary">开始配置</Button></span>
                    </Row>
                    <Card style="margin-top:10px;">
                        <Row>
                            功能名称：<Input v-model="gongnengname" placeholder="请输入功能名称" style="width: 200px;margin-right: 20px;" />
                            模块名称：<Input v-model="mokuainame" placeholder="请输入模块名称" style="width: 200px;margin-right: 20px;" />
                            <br/><br/>
                            <Button type="info" @click="add" :disabled="doshow">生成代码</Button>
                        </Row>
                    </Card>
                   
                    <Row type="flex" justify="center" align="middle" class="advanced-router">
                        <Table border :columns="columns" :data="data" :loading="loading"style="width: 100%;margin-top:10px"></Table>
                    </Row>
                </Card>
            </Col>
        </Row> 
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    export default {
        data () {
            return {
                loading:false,
                doshow:true,
                gongnengname:'',
                mokuainame:'',
                tablename:'',
                tableList:[],
                columns: [                  
                    {
                        title: '字段名',
                        key: 'name'
                    },
                    {
                        title: '字段注释',
                        key: 'comment',
                        render: (h, params) => {
                            let _self=this;
                            return h('Input', {
                                props: {
                                    type: 'text',
                                    value: params.row.comment
                                },
                                on: {
                                    'on-blur' (event) {
                                        _self.formData[params.index].comment=event.target.value;
                                    }
                                }
                            });
                        }
                    },
                    {
                        title: '是否在列表中显示',
                        key: 'is_show',
                        render: (h, params) => {
                            let _self=this;
                            return h('Checkbox', {
                                props: {
                                    size: 'large',
                                    value: params.row.is_show,
                                    'true-value':1,
                                    'false-value':0
                                },
                                on: {
                                    'on-change' (value) {
                                        _self.formData[params.index].is_show=value;
                                    }
                                }
                            });
                        }
                    },
                    {
                        title: '是否是搜索项',
                        key: 'is_search',
                        render: (h, params) => {
                            let _self=this;
                            return h('Checkbox', {
                                props: {
                                    size: 'large',
                                    value: params.row.is_search,
                                    'true-value':1,
                                    'false-value':0
                                },
                                on: {
                                    'on-change' (value) {
                                        _self.formData[params.index].is_search=value;
                                    }
                                }
                            });
                        }
                    },                  
                ],
                data: [],  
                formData:[] 
            }
        },
        methods: {
            init () {
                let _self=this;
                _self.loading=true;
                util.post(this,'admin/generator/getTables',this.searchForm,function(datas){                  
                    _self.tableList=datas;
                    _self.loading=false;                  
                });
            },
            handleSearch(){
                if(!this.tablename){
                    this.$Message.error('请先选择要生成代码的表名！');
                    return false;
                }
                let _self=this;
                _self.loading=true;
                let _table=_self.tablename.split('|');
                util.post(this,'admin/generator/getColumns',{tablename:_table[0]},function(datas){                  
                    _self.data=datas;
                    _self.formData=util.copy(datas);                   
                    _self.loading=false;          
                    _self.doshow=false;
                    _self.gongnengname=_table[1];

                });
            },           
            add (){     
                if(!this.tablename){
                    this.$Message.error('请先选择要生成代码的表名！');
                    return false;
                }
                if(!this.gongnengname){
                    this.$Message.error('请输入功能名称！');
                    return false;
                }
                if(!this.mokuainame){
                    this.$Message.error('请输入模块名称！');
                    return false;
                }
                let _self=this;
                _self.loading=true;
                this.$Message.loading({
                    content: '正在生成代码中，请耐心等耐。。。',
                    duration: 0
                });
                util.post(this,'admin/generator/todoCode',{parameter:_self.formData,tablename:_self.tablename.split('|')[0],tablecomment:_self.gongnengname,mokuainame:_self.mokuainame},function(datas){                  
                    _self.$Message.destroy();
                    _self.$Message.info({
                        content: datas.msg,
                        duration: 5,
                        closable: true
                    });                  
                    _self.loading=false;                  
                });           
            },                  
        },
        mounted () {
            this.init();
        }
    }
</script>