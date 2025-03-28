<style lang="less">
     .table-min-width{
        min-width:120px;
        width:120px
    }
</style>
<template>
     <div>
        <Row>
            <Col span="24">
                <Card>                   
                    <Row style="margin-top:10px;">
                        <Button type="info" @click="add">添加</Button>
                    </Row>
                    <Row type="flex" justify="center" align="middle" class="advanced-router">
                        <Table border stripe :columns="columns" :data="data" :loading="loading" style="width: 100%;margin-top:10px"></Table>
                        <Page :total="count" :current="searchForm.current" show-total  style="margin-top:10px;" @on-change="pageChange"></Page>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal  title="编辑"  :mask-closable="false" :closable="false" v-model="modalAdd">
            <Form ref="formRef" :model="formValidate" :rules="ruleValidate" :label-width="80">
                <FormItem label="属性名称" prop="attribute_id">
                    <Select v-model="formValidate.attribute_id" style="width: 162px;">
                        <Option v-for="item2 in item" :value="item2.id" :key="item2.id">{{ item2.name }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="属性说明" prop="value">
                    <Input v-model="formValidate.value"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button>
                <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
            </div>
        </Modal>    
        <Modal  title="详情" v-model="modalDetail">
            <Form :model="formValidate" :label-width="80">
                <FormItem label="属性名称">
                    <Select v-model="formValidate.attribute_id" style="width: 162px;" disabled>
                        <Option v-for="item2 in item" :value="item2.id" :key="item2.id">{{ item2.name }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="属性说明">
                    <Input v-model="formValidate.value" readonly></Input>
                </FormItem>
            </Form>
            <div slot="footer">
            </div>
        </Modal>    
    </div>
</template>
<script>
    import util from '@/libs/util.js';
    export default {
        data () {
            return {
                modalAdd:false,
                modalDetail:false,
                loading:false,
                modalLoading:false,
                modalCanBut:true,
                searchForm:{
                    current:1
                },
                data: [],
                item:[],
                formValidate: {
                },
                count:0,
                columns: [     
                    {
                        title: '属性名称',
                        key: 'attribute_name',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },
                    {
                        title: '属性说明',
                        key: 'value',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 210,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params)
                                        }
                                    }
                                }, '查看'),
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.edit(params)
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '您确定要删除这条数据吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                           this.remove(params);
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        style: {
                                            marginRight: '5px'
                                        },
                                        props: {
                                            type: 'error',
                                            placement: 'top',
                                            size: 'small'
                                        }
                                    }, '删除')
                                ])
                            ]);
                        }
                    }
                ],
                ruleValidate: {
                    attribute_id: [
                        { required: true, message: '属性名称为必填项'}
                    ],
                    value: [
                        { required: true, message: '属性说明为必填项'}
                    ],
                }
            }
        },
        methods: {
            search(id,pid){
                this.searchForm.goods_id=id;
                let _self=this;
                util.post(this,'wx/admin/wx_attribute/findListByPid',{pid:pid},function(datas){   
                    _self.item=datas;
                });
                this.init();
            },
            init () {
                this.data=[];
                let _self=this;
                _self.loading=true;
                util.post(this,'wx/admin/wx_goods_attribute/pageData',this.searchForm,function(datas){   
                    _self.data=datas.data;
                    _self.count=datas.count;
                    _self.loading=false;
                });
            },
            handleSearch(){
                this.searchForm.current=1;
                this.init();
            },
            pageChange(current){
                this.searchForm.current=current;
                this.init();
            },
            add (){     
                this.formValidate={}; 
                this.modalAdd=true;       
            },
            show (param) {
                this.formValidate=util.copy(param.row);
                this.modalDetail=true;        
             },
            edit (param) {
                this.formValidate=util.copy(param.row);
                this.modalAdd=true;        
             },
            remove (param) {
                let _self=this;
                this.loading=true;
                util.post(this,'wx/admin/wx_goods_attribute/delData',{id:param.row.id},function(datas){ 
                    _self.data.splice(param.index, 1);
                    _self.loading =false;      
                    _self.$Message.success('删除成功！');
                });
            },
            addOkFun(){
                let _self=this;
                this.$refs['formRef'].validate((valid) => {
                    if (valid) {
                        util.changeModalLoading(this,true);
                        let _data=util.copy(this.formValidate); 
                        _data.goods_id=_self.searchForm.goods_id;
                        if(this.formValidate&&this.formValidate.id){
                            util.post(this,'wx/admin/wx_goods_attribute/updateData',_data,function(datas){  
                                _self.$Message.success('编辑成功！');
                                _self.addCanFun();
                                _self.init();      
                            });                        
                        }else{
                            util.post(this,'wx/admin/wx_goods_attribute/addData',_data,function(datas){ 
                                _self.$Message.success('新增成功！');
                                _self.addCanFun(); 
                                _self.init();     
                            });     
                        }
                    }else{
                        util.changeModalLoading(this);
                    } 
                })  
            },   
            addCanFun(){ 
                this.modalAdd=false; 
                util.changeModalLoading(this);
                this.$refs['formRef'].resetFields(); 
            }
        },
        mounted () {
            // this.init();
        }
    }
</script>