<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.key"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button
          v-if="isAuth('product:brand:save')"
          type="primary"
          @click="addOrUpdateHandle()"
          >Add</el-button
        >
        <el-button
          v-if="isAuth('product:brand:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          >Batch Delete</el-button
        >
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      >
      </el-table-column>
      <el-table-column
        prop="brandId"
        header-align="center"
        align="center"
        label="Brand Id"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="Brand name"
      >
      </el-table-column>
      <el-table-column
        prop="logo"
        header-align="center"
        align="center"
        label="Brand logo"
      >
        <template slot-scope="scope">
          <img
            style="width: 100px; height: 100px"
            :src="scope.row.logo"
          
          ></img>
        </template>
      </el-table-column>
      <el-table-column
        prop="descript"
        header-align="center"
        align="center"
        label="description"
      >
      </el-table-column>
      <el-table-column
        prop="showStatus"
        header-align="center"
        align="center"
        label="Show status "
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.showStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
            @change="updateShowStatus(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        prop="firstLetter"
        header-align="center"
        align="center"
        label="firstLetter"
      >
      </el-table-column>
      <el-table-column
        prop="sort"
        header-align="center"
        align="center"
        label="sort"
      >
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="Actions"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="updateCatelogHandle(scope.row.brandId)">关联分类</el-button>

          <el-button
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.brandId)"
            >Update</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="deleteHandle(scope.row.brandId)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- Popup window, add / update -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></add-or-update>

    <el-dialog title="关联分类" :visible.sync="cateRelationDialogVisible" width="30%">
      <el-popover placement="right-end" v-model="popCatelogSelectVisible">
        <category-cascader :catelogPath.sync="catelogPath"></category-cascader>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="popCatelogSelectVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="addCatelogSelect">确定</el-button>
        </div>
        <el-button slot="reference">新增关联</el-button>
      </el-popover>
      <el-table :data="cateRelationTableData" style="width: 100%">
        <el-table-column prop="id" label="#"></el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="catelogName" label="分类名"></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="deleteCateRelationHandle(scope.row.id,scope.row.brandId)"
            >移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateRelationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cateRelationDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AddOrUpdate from "./brand-add-or-update";
import CategoryCascader from "../common/category-cascader";

export default {
  data() {
    return {
      dataForm: {
        key: "",
      },
      catelogPath: [],
      cateRelationDialogVisible: false,
      cateRelationTableData: [],
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      popCatelogSelectVisible: false
    };
  },
  components: {
    AddOrUpdate,
    CategoryCascader
  },
  //生命周期 - 创建完成（可以访问当前 this 实例）
  created() {
    console.log("1");
  },
  //生命周期 - 挂载完成（可以访问 DOM 元素）
  mounted() {
    console.log("2");
  },
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
  activated() {
    console.log("123");
    this.getDataList();
  },
  methods: {
    addCatelogSelect() {
      //{"brandId":1,"catelogId":2}
      this.popCatelogSelectVisible =false;
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/save"),
        method: "post",
        data: this.$http.adornData({brandId:this.brandId,catelogId:this.catelogPath[this.catelogPath.length-1]}, false)
      }).then(({ data }) => {
        this.getCateRelation();
      });
    },
    // get all brands
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/product/brand/list"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.dataForm.key,
        }),
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    updateCatelogHandle(brandId) {
      this.cateRelationDialogVisible = true;
      this.brandId = brandId;
      this.getCateRelation();
    },
    getCateRelation() {
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/catelog/list"),
        method: "get",
        params: this.$http.adornParams({
          brandId: this.brandId
        })
      }).then(({ data }) => {
        this.cateRelationTableData = data.data;
      });
    },
    deleteCateRelationHandle(id, brandId) {
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/delete"),
        method: "post",
        data: this.$http.adornData([id], false)
      }).then(({ data }) => {
        this.getCateRelation();
      });
    },
    updateShowStatus(data) {
      console.log("data ", data);
      let { brandId, showStatus } = data;

      this.$http({
        url: this.$http.adornUrl("/product/brand/update"),
        method: "post",
        data: this.$http.adornData(
          { brandId, showStatus: showStatus ? 1 : 0 },
          false
        ),
      }).then(({ data }) => {
        this.$message({
          type: "message",
          message: " status saved",
        });
      });
    },

    // page size
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // current page
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // multiplu selelction
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    //  add Or Update
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    //  delete
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
            return item.brandId;
          });
      this.$confirm(
        `Are you sure to  [id=${ids.join(",")}][${
          id ? "Delete" : "Batch Delete"
        }]?`,
        "warning",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl("/product/brand/delete"),
          method: "post",
          data: this.$http.adornData(ids, false),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "succeeded",
              type: "success",
              duration: 1500,
              onClose: () => {
                this.getDataList();
              },
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
  },
};
</script>
