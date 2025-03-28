const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const banner = await this.model('wx_ad').select();
    const channel = await this.model('wx_category').where({parent_id: 0}).limit(4).order({sort_order: 'asc'}).select();
    const newGoods = await this.model('wx_goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1}).limit(4).select();
    const hotGoods = await this.model('wx_goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where({is_hot: 1}).limit(3).select();
    const brandList = await this.model('wx_brand').where({is_index: 1}).order({sort_order: 'asc'}).limit(4).select();
    const topicList = await this.model('wx_topic').limit(3).select();

    const categoryList = await this.model('wx_category').where({parent_id: 0, name: ['<>', '推荐']}).select();
    const newCategoryList = [];
    for (const categoryItem of categoryList) {
      const childCategoryIds = await this.model('wx_category').where({parent_id: categoryItem.id}).getField('id', 100);
      const categoryGoods = await this.model('wx_goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({category_id: ['IN', childCategoryIds]}).limit(7).select();
      newCategoryList.push({
        id: categoryItem.id,
        name: categoryItem.name,
        goodsList: categoryGoods
      });
    }

    return this.success({
      banner: banner,
      channel: channel,
      newGoodsList: newGoods,
      hotGoodsList: hotGoods,
      brandList: brandList,
      topicList: topicList,
      categoryList: newCategoryList
    });
  }
};
