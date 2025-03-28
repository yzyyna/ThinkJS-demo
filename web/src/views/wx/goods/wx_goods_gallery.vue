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
                <FormItem label="图片" prop="img_url">
                    <img :src="imgDataUrl" style="width: 100%">
                    <Upload :before-upload="handleUpload" action="" accept="image/*">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
                    </Upload>
                    <Tag type="border">图片大小为：800*800</Tag>
                </FormItem>
                <FormItem label="文字说明" prop="img_desc">
                    <Input v-model="formValidate.img_desc"></Input>
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
        <Modal  title="详情" v-model="modalDetail">
            <Form :model="formValidate" :label-width="80">
                <FormItem label="图片">
                    <img :src="imgDataUrl" style="width: 100%">
                </FormItem>
                <FormItem label="文字说明">
                    <Input v-model="formValidate.img_desc" readonly></Input>
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
                searchForm:{
                    current:1
                },
                data: [],
                imgDataUrl:'',
                formValidate: {
                },
                count:0,
                columns: [     
                    {
                        title: '图片',
                        key: 'img_url',
                        className: 'table-min-width3',
                        ellipsis:true,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [                              
                                h('img', {
                                    attrs:{
                                        src:UPLOAD_IMG_URL+params.row.img_url
                                    },
                                    style: {
                                        width: '200px'
                                    },
                                }),
                                
                            ]);
                        }
                    },
                    {
                        title: '文字说明',
                        key: 'img_desc',
                        className: 'table-min-width',
                        ellipsis:true,
                        align: 'center',
                    },
                    {
                        title: '排序',
                        key: 'sort_order',
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
                    img_url: [
                        { required: true, message: '图片为必填项'}
                    ]
                }
            }
        },
        methods: {
            search(id){
                this.searchForm.goods_id=id;
                this.init();
            },
            init () {
                this.data=[];
                let _self=this;
                _self.loading=true;
                util.post(this,'wx/admin/wx_goods_gallery/pageData',this.searchForm,function(datas){   
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
                this.modalAdd=true;       
            },
            show (param) {
                this.formValidate=util.copy(param.row);
                this.imgDataUrl=UPLOAD_IMG_URL+this.formValidate.img_url;
                this.modalDetail=true;        
             },
            edit (param) {
                this.formValidate=util.copy(param.row);
                this.imgDataUrl=UPLOAD_IMG_URL+this.formValidate.img_url;
                this.modalAdd=true;        
             },
            remove (param) {
                let _self=this;
                this.loading=true;
                util.post(this,'wx/admin/wx_goods_gallery/delData',{id:param.row.id},function(datas){ 
                    _self.data.splice(param.index, 1);
                    _self.loading =false;      
                    _self.$Message.success('删除成功！');
                });
            },
            handleUpload (file) {
                let _self=this;
                util.imageUpload(this,file,function(datas){
                    _self.imgDataUrl=UPLOAD_IMG_URL+datas; 
                    _self.formValidate.img_url=datas;
                });      
                return false;
            },
            handleImageAdded: function(file, Editor, cursorLocation) {
              util.imageUpload(this,file,function(datas){
                  let url = UPLOAD_IMG_URL+datas;
                  Editor.insertEmbed(cursorLocation, 'image', url);
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
                            util.post(this,'wx/admin/wx_goods_gallery/updateData',_data,function(datas){  
                                _self.$Message.success('编辑成功！');
                                _self.addCanFun();
                                _self.init();      
                            });                        
                        }else{
                            util.post(this,'wx/admin/wx_goods_gallery/addData',_data,function(datas){ 
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