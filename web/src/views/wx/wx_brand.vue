<style lang="less">
     .table-min-width{
        min-width:120px;
        width:120px
    }

    .table-min-width3{
        min-width:200px;
        width:200px
    }

</style>
<template>
     <div>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="ios-list"></Icon>
                        制造商列表
                    </p>
                    <Row>
                        名称：<Input v-model="searchForm.name" placeholder="请输入要搜索的名称" style="width: 200px;margin-right: 20px;" />
                        <span @click="handleSearch"><Button type="primary" icon="search">搜索</Button></span>
                    </Row>
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
                <FormItem label="名称" prop="name">
                    <Input v-model="formValidate.name"></Input>
                </FormItem>               
                <FormItem label="底价" prop="floor_price">
                    <Input v-model="formValidate.floor_price" number></Input>
                </FormItem>
                <FormItem label="详情图片" prop="app_list_pic_url">
                    <img :src="imgDataUrl" style="width: 100%">
                    <Upload :before-upload="handleUpload" action="" accept="image/*">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
                    </Upload>
                    <Tag type="border">图片大小为：750*420</Tag>
                </FormItem>
                <FormItem label="首页推广背景图" prop="new_pic_url">
                    <img :src="imgDataUrl2" style="width: 100%">
                    <Upload :before-upload="handleUpload2" action="" accept="image/*">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
                    </Upload>
                    <Tag type="border">图片大小为：760*484</Tag>
                </FormItem>
                <FormItem label="简介" prop="simple_desc">
                    <Input v-model="formValidate.simple_desc"></Input>
                </FormItem>
                <FormItem label="排序" prop="sort_order">
                    <InputNumber :min="1" v-model="formValidate.sort_order"></InputNumber>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="addCanFun" v-show="modalCanBut">取消</Button>
                <Button type="primary" @click="addOkFun" :loading="modalLoading">确定</Button>
            </div>
        </Modal>    
        <Modal  title="详情"  v-model="modalDetail">
            <Form :model="formValidate" :label-width="80">
                <FormItem label="名称">
                    <Input v-model="formValidate.name" readonly></Input>
                </FormItem>
                <FormItem label="简介">
                    <Input v-model="formValidate.simple_desc" readonly></Input>
                </FormItem>               
                <FormItem label="底价">
                    <Input v-model="formValidate.floor_price" readonly></Input>
                </FormItem>
                <FormItem label="详情图片">
                   <img :src="imgDataUrl" style="width: 100%;">
                </FormItem>
                <FormItem label="首页推广背景图" prop="new_pic_url">
                    <img :src="imgDataUrl2" style="width: 100%;">
                </FormItem>
                <FormItem label="排序">
                    <Input v-model="formValidate.sort_order" readonly></Input>
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
                imgDataUrl:'',
                imgDataUrl2:'',
                searchForm:{
                    current:1
                },
                count:0,
                columns: [     
                    {
                        title: '名称',
                        key: 'name',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },                    
                    {
                        title: '底价',
                        key: 'floor_price',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },
                    {
                        title: '图片',
                        key: 'app_list_pic_url',
                        className: 'table-min-width3',
                        ellipsis:true,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [                              
                                h('img', {
                                    attrs:{
                                        src:UPLOAD_IMG_URL+params.row.app_list_pic_url
                                    },
                                    style: {
                                        width: '200px'
                                    },
                                }),
                                
                            ]);
                        }
                    },
                    {
                        title: '排序',
                        key: 'sort_order',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },
                    {
                        title: '是否首页推荐',
                        key: 'is_index',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                        render: (h, params) => {
                            return  h('div', [
                                h('i-switch', {
                                    props: {
                                        value:params.row.is_index==1,
                                        size: 'large'
                                    },
                                    on: {  
                                      'on-change': (value) => {
                                        this.changeStatus(value,params)
                                      }  
                                    }                                  
                                },[
                                    h('span', {
                                        slot: 'open'
                                    }, '是'),
                                    h('span', {
                                        slot: 'close',
                                    }, '否')
                                ])
                            ]);             
                        }
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
                data: [],
                formValidate: {
                    sort_order: 1
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '名称为必填项', trigger: 'blur' }
                    ],
                    simple_desc: [
                        { required: true, message: '简介为必填项', trigger: 'blur' }
                    ],                 
                    floor_price: [
                        { required: true,type:'number', message: '底价为数字类型的必填项', trigger: 'blur' }
                    ],
                    app_list_pic_url: [
                        { required: true, message: '图片为必填项', trigger: 'blur' }
                    ],
                }
            }
        },
        methods: {
            init () {
                let _self=this;
                _self.loading=true;
                util.post(this,'wx/admin/wx_brand/pageData',this.searchForm,function(datas){   
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
                this.formValidate={sort_order:1}; 
                this.imgDataUrl='';
                this.imgDataUrl2='';
                this.modalAdd=true;       
            },
            show (param) {
                this.formValidate=util.copy(param.row);
                this.imgDataUrl=UPLOAD_IMG_URL+this.formValidate.app_list_pic_url;
                this.imgDataUrl2=UPLOAD_IMG_URL+this.formValidate.new_pic_url;
                this.modalDetail=true;        
            },
            edit (param) {
                this.formValidate=util.copy(param.row);
                this.imgDataUrl=UPLOAD_IMG_URL+this.formValidate.app_list_pic_url;
                this.imgDataUrl2=UPLOAD_IMG_URL+this.formValidate.new_pic_url;
                this.modalAdd=true;        
            },
            changeStatus (value,param) {
                let _self=this;
                this.loading=true;
                let is_index=0;
                if(value){
                    is_index=1;
                }
                util.post(this,'wx/admin/wx_brand/changeStatus',{id:param.row.id,is_index:is_index},function(datas){ 
                    _self.data[param.index].is_index=is_index;
                    _self.loading =false;               
                    _self.$Message.success('修改成功！');              
                });
            },    
            remove (param) {
                let _self=this;
                this.loading=true;
                util.post(this,'wx/admin/wx_brand/delData',{id:param.row.id},function(datas){ 
                    _self.data.splice(param.index, 1);
                    _self.loading =false;      
                    _self.$Message.success('删除成功！');
                });
            },
            handleUpload (file) {
                let _self=this;
                util.imageUpload(this,file,function(datas){
                    _self.imgDataUrl=UPLOAD_IMG_URL+datas; // Get url from response
                    _self.formValidate.app_list_pic_url=datas;
                });      
                return false;
            },
            handleUpload2 (file) {
                let _self=this;
                util.imageUpload(this,file,function(datas){
                    _self.imgDataUrl2=UPLOAD_IMG_URL+datas; // Get url from response
                    _self.formValidate.new_pic_url=datas;
                });      
                return false;
            },
            addOkFun(){
                let _self=this;
                this.$refs['formRef'].validate((valid) => {
                    if (valid) {
                        util.changeModalLoading(this,true);
                        let _data=util.copy(this.formValidate); 
                        if(this.formValidate&&this.formValidate.id){
                            util.post(this,'wx/admin/wx_brand/updateData',_data,function(datas){  
                                _self.$Message.success('编辑成功！');
                                _self.addCanFun();
                                _self.init();      
                            });                        
                        }else{
                            util.post(this,'wx/admin/wx_brand/addData',_data,function(datas){ 
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
            this.init();
        }
    }
</script>