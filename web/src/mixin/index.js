export const mixins = {
  data() {
    return {
      platFormList: []
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.getPlatFormList()
  },
  methods: {
    getPlatFormList() {
      this.$api.fwReport.allData().then((data) => {
        this.platFormList = Array.isArray(data) && data.length > 0 ? data : []
        if (this.configData && this.configData.platformId) {
          this.$set(this.searchForm, 'platformId', this.configData.platformId)
        } else {
          this.$set(this.searchForm, 'platformId', data[0].id)
        }
      })
    }
  }
}
