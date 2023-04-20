<template>
  <div>
    <el-switch
      v-model="draggable"
      active-text="Enable draggable"
      inactive-text="Disable draggable"
    >
    </el-switch>
    <el-button v-if="draggable" @click="batchSave">Batch save</el-button>
    <el-button type="danger" @click="batchDelete">Batch delete</el-button>
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox
      node-key="catId"
      :default-expanded-keys="expandedKey"
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
      ref="menuTree"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            Append
          </el-button>

          <el-button type="text" size="mini" @click="() => edit(data)">
            Edit
          </el-button>
          <el-button
            v-if="node.childNodes.length == 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="category">
        <el-form-item label="Category name">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Category icon">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Product unit">
          <el-input
            v-model="category.productUnit"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </span>
    </el-dialog>
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
    handleNodeClick(data) {
      console.log(data);
    },

    // check if the node is allowed to be dropped here
    allowDrop(draggingNode, dropNode, type) {
      // the level of a dragging node plus the level of dropnode must less than 3.
      var dragLevel = draggingNode.data.catLevel;
      console.log("draggingNode, dropNode, type", draggingNode, dropNode, type);
      console.log("dragLevel :", dragLevel);

      this.countNodeLevel(draggingNode.data);

      console.log("maxLevel :", this.maxLevel);
      let deepth = this.maxLevel - dragLevel + 1;
      console.log("DEEPTH :", deepth);
      if (type == "inner") {
        return deepth + dropNode.data.level <= 3;
      } else {
        return deepth + dropNode.parent.level <= 3;
      }
    },

    countNodeLevel(node) {
      if (node.children != null && node.children.length > 0) {
        for (let index = 0; index < node.children.length; index++) {
          const childNode = node.children[index];
          if (childNode.catLevel > this.maxLevel) {
            this.maxLevel = childNode.catLevel;
          }
          this.countNodeLevel(childNode);
        }
      }
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
    append(data) {
      this.dialogType = "add";
      this.title = "Add category";
      this.dialogVisible = true;
      this.category.parentCid = data.catId;
      this.category.catLevel = data.catLevel * 1 + 1;

      this.category.catId = null;
      this.category.name = "";
      this.category.icon = "";
      this.category.productUnit = "";
      this.category.sort = 0;
      this.category.showStatus = 1;
    },
    edit(data) {
      console.log("data want to be edit", data);
      this.dialogVisible = true;
      this.title = "Edit category";
      this.dialogType = "edit";

      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: "get",
        params: this.$http.adornParams({}),
      }).then(({ data }) => {
        console.log("query result data ", data);
        this.category.catId = data.category.catId;
        this.category.name = data.category.name;
        this.category.icon = data.category.icon;
        this.category.productUnit = data.category.productUnit;
        this.category.parentCid = data.category.parentCid;
      });
    },

    submitForm() {
      if (this.dialogType == "edit") {
        this.editCategory();
      } else if (this.dialogType == "add") {
        this.addCategory();
      }
    },
    editCategory() {
      // edit a category
      console.log("edit a category ", this.category);
      var { catId, name, icon, productUnit } = this.category;
      this.$http({
        url: this.$http.adornUrl("/product/category/update"),
        method: "post",
        data: this.$http.adornData({ catId, name, icon, productUnit }, false),
      }).then(({}) => {
        console.log("update success");

        // close the dialog
        this.dialogVisible = false;
        // refresh new data
        this.getMenus();
        // set the default expanded menu
        this.expandedKey = [this.category.parentCid];

        this.$message({
          type: "success",
          message: "update completed",
        });
      });
    },
    addCategory() {
      // add a category
      console.log(" add a category ", this.category);

      this.$http({
        url: this.$http.adornUrl("/product/category/save"),
        method: "post",
        data: this.$http.adornData(this.category, false),
      }).then(({}) => {
        console.log("saved success");

        // close the dialog
        this.dialogVisible = false;
        // refresh new data
        this.getMenus();
        // set the default expanded menu
        this.expandedKey = [this.category.parentCid];

        this.$message({
          type: "success",
          message: "Delete completed",
        });
      });
    },
    batchDelete() {
      let catIds = [];
      let checkedNodes = this.$refs.menuTree.getCheckedNodes();
      console.log(" the chosen element ", checkedNodes);
      for (let i = 0; i < checkedNodes.length; i++) {
        catIds.push(checkedNodes[i].catId);
      }
      this.$confirm(`are you sure batch delete ${catIds} menu?`, "warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(catIds, false),
          }).then(({ data }) => {
            this.$message({
              message: "Batch delete succeed",
              type: "success",
            });
            this.getMenus();
          });
        })
        .catch(() => {});
    },
    batchSave() {
      this.$http({
        url: this.$http.adornUrl("/product/category/update/sort"),
        method: "post",
        data: this.$http.adornData(this.updateNodes, false),
      }).then(({ data }) => {
        this.$message({
          message: "menu order update succeed",
          type: "success",
        });

        // refresh new data
        this.getMenus();
        // set the default expanded menu
        this.expandedKey = this.pCid;
        this.updateNodes = [];
        this.maxLevel = 0;
        // this.pCid = 0;
      });
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("handleDrop: ", draggingNode, dropNode, dropType);
      //1、new parent Cid of the current node
      let pCid = 0;
      let siblings = null;
      if (dropType == "before" || dropType == "after") {
        pCid =
          dropNode.parent.data.catId == undefined
            ? 0
            : dropNode.parent.data.catId;
        siblings = dropNode.parent.childNodes;
      } else {
        pCid = dropNode.data.catId;
        siblings = dropNode.childNodes;
      }
      this.pCid.push(pCid);

      //2、 new order，
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId == draggingNode.data.catId) {
          //if the node is current node
          let catLevel = draggingNode.level;
          if (siblings[i].level != draggingNode.level) {
            //current level changed
            catLevel = siblings[i].level;
            this.updateChildNodeLevel(siblings[i]);
          }
          this.updateNodes.push({
            catId: siblings[i].data.catId,
            sort: i,
            parentCid: pCid,
            catLevel: catLevel,
          });
        } else {
          this.updateNodes.push({ catId: siblings[i].data.catId, sort: i });
        }
      }

      console.log("updateNodes", this.updateNodes);
    },
    updateChildNodeLevel(node) {
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          var cNode = node.childNodes[i].data;
          this.updateNodes.push({
            catId: cNode.catId,
            catLevel: node.childNodes[i].level,
          });
          this.updateChildNodeLevel(node.childNodes[i]);
        }
      }
    },

    remove(node, data) {
      console.log("remove---", data);
      var ids = [data.catId];

      this.$confirm(
        `This will permanently delete 【${data.name}】 menu. Continue?`,
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(ids, false),
          }).then(({ data }) => {
            console.log("Deleted success");

            // refresh new data
            this.getMenus();
            // set the default expanded menu
            this.expandedKey = [node.parent.data.catId];
          });

          this.$message({
            type: "success",
            message: "Delete completed",
          });
        })
        .catch(() => {});
    },
  },
  //生命周期 - 创建完成（可以访问当前 this 实例）
  created() {
    this.getMenus();
  },
  //生命周期 - 挂载完成（可以访问 DOM 元素）
  mounted() {},
  //生命周期 - 创建之前
  beforeCreate() {},
  //生命周期 - 挂载之前
  beforeMount() {},
  //生命周期 - 更新之前
  beforeUpdate() {},
  //生命周期 - 更新之后
  updated() {},
  //生命周期 - 销毁之前
  beforeDestroy() {},
  //生命周期 - 销毁完成
  destroyed() {},
  activated() {},
};
</script>
<style  scoped>
</style>