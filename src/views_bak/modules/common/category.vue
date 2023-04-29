<template>
  <div>
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      node-key="catId"
      :default-expanded-keys="expandedKey"
      @node-click="nodeClick"
      ref="menuTree"
    >
    </el-tree>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具 js，第三方插件 js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import 引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data() {
    //这里存放数据
    return {
      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 0,
      title: "",
      dialogType: "", //edit,add
      category: {
        name: "",
        parentCid: 0,
        catLevel: 0,
        showStatus: 1,
        sort: 0,
        productUnit: "",
        icon: "",
        catId: null,
      },
      dialogVisible: false,
      menus: [],
      expandedKey: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
    };
  },
  //计算属性 类似于 data 概念
  computed: {},
  //监控 data 中的数据变化
  watch: {},
  //方法集合
  methods: {
    nodeClick(data,node,component){
        console.log("tree-node-click",data,node,component)
        this.$emit("tree-node-click",data,node,component)
    },
    getMenus() {
      // get all tree data
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/product/category/listTree"),
        method: "get",
      }).then(({ data }) => {
        console.log("successfully get category data", data.data);
        this.menus = data.data;
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前 this 实例）
  created() {
    this.getMenus();
  },
  //生命周期 - 挂载完成（可以访问 DOM 元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有 keep-alive 缓存功能，这个函数会触发
};
</script>
<style  scoped>
</style>