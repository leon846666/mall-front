<template>
  <el-dialog
    :title="!dataForm.brandId ? 'Add' : 'Update'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="120px"
    >
      <el-form-item label="Brand name" prop="name">
        <el-input v-model="dataForm.name" placeholder="Brand Name"></el-input>
      </el-form-item>
      <el-form-item label="Brand logo" prop="logo">
        <single-upload
          v-model="dataForm.logo"
          placeholder="Brand logo"
        ></single-upload>
      </el-form-item>
      <el-form-item label="Description" prop="descript">
        <el-input
          v-model="dataForm.descript"
          placeholder="Description"
        ></el-input>
      </el-form-item>
      <el-form-item label="Show status" prop="showStatus">
        <template slot-scope="scope">
          <el-switch
            v-model="dataForm.showStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          >
          </el-switch>
        </template>
      </el-form-item>
      <el-form-item label="FirstLetter" prop="firstLetter">
        <el-input
          v-model="dataForm.firstLetter"
          placeholder="FirstLetter"
        ></el-input>
      </el-form-item>
      <el-form-item label="Sort" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="Sort"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
import SingleUpload from "@/components/upload/singleUpload";

export default {
  components: {
    SingleUpload
  },
  data() {
    return {
      visible: false,
      dataForm: {
        brandId: 0,
        name: "",
        logo: "",
        descript: "",
        showStatus: 0,
        firstLetter: "",
        sort: "",
      },
      dataRule: {
        name: [
          {
            required: true,
            message: "Brand Name can not be empty",
            trigger: "blur",
          },
        ],
        logo: [
          {
            required: true,
            message: "Brand logo can not be empty",
            trigger: "blur",
          },
        ],
        descript: [
          {
            required: true,
            message: "Brand description can not be empty",
            trigger: "blur",
          },
        ],
        showStatus: [
          {
            required: true,
            message: "Show status  must be specified",
            trigger: "blur",
          },
        ],
        firstLetter: [
          {
            required: true,
            message: "FirstLetter must be specified",
            trigger: "blur",
          },
        ],
        sort: [
          {
            required: true,
            message: "Sort must be specified",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    init(id) {
      this.dataForm.brandId = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.brandId) {
          this.$http({
            url: this.$http.adornUrl(
              `/product/brand/info/${this.dataForm.brandId}`
            ),
            method: "get",
            params: this.$http.adornParams(),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.name = data.brand.name;
              this.dataForm.logo = data.brand.logo;
              this.dataForm.descript = data.brand.descript;
              this.dataForm.showStatus = data.brand.showStatus;
              this.dataForm.firstLetter = data.brand.firstLetter;
              this.dataForm.sort = data.brand.sort;
            }
          });
        }
      });
    },
    // form submit
    dataFormSubmit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/product/brand/${!this.dataForm.brandId ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              brandId: this.dataForm.brandId || undefined,
              name: this.dataForm.name,
              logo: this.dataForm.logo,
              descript: this.dataForm.descript,
              showStatus: this.dataForm.showStatus*1,
              firstLetter: this.dataForm.firstLetter,
              sort: this.dataForm.sort,
            }),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "succeeded",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                },
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    },
  },
  updateShowStatus(status) {
    console.log("status ", status);
  },
};
</script>
