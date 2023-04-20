<template>
  <div>
    <el-upload
      class="upload-demo"
      ref="upload"
      drag
      action=""
      :limit="1"
      :multiple="true"
      :auto-upload="false"
      :http-request="uploadFileToServer"
      multiple>
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>
<script>
import { policy } from "./policy";
import { getUUID } from '@/utils'
export default {
  name: "multiUpload",
  props: {
  
    value: Array,
    //maximum files 
    maxCount: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      file: {
        // policy: "",
        // signature: "",
        // key: "",
        // ossaccessKeyId: "",
        // dir: "",
        // host: "",
        // uuid: ""
      },
      dialogVisible: false,
      dialogImageUrl: null
    };
  },
  computed: {
    fileList() {
      let fileList = [];
      for (let i = 0; i < this.value.length; i++) {
        fileList.push({ url: this.value[i] });
      }

      return fileList;
    }
  },
  mounted() {},
  methods: {

    uploadFileToServer(file){
      console.log("12312313")
    let formData = new FormData();
    formData.append('file', file.file);
    this.$http.upload('/third/aws/upload/',formData).then(e=> {
      console.log(e,"66666");
    })
  },
    emitInput(fileList) {
      let value = [];
      for (let i = 0; i < fileList.length; i++) {
        value.push(fileList[i].url);
      }
      this.$emit("input", value);
    },
    handleRemove(file, fileList) {
      this.emitInput(fileList);
    },
    handlePreview(file) {
      this.dialogVisible = true;
      this.dialogImageUrl = file.url;
    },
    beforeUpload(file) {
      let _self = this;
      console.log(file)
      // return new Promise((resolve, reject) => {
      //   policy()
      //     .then(response => {
      //       console.log("这是什么${filename}");
      //       _self.dataObj.policy = response.data.policy;
      //       _self.dataObj.signature = response.data.signature;
      //       _self.dataObj.ossaccessKeyId = response.data.accessid;
      //       _self.dataObj.key = response.data.dir + "/"+getUUID()+"_${filename}";
      //       _self.dataObj.dir = response.data.dir;
      //       _self.dataObj.host = response.data.host;
      //       resolve(true);
      //     })
      //     .catch(err => {
      //       console.log("出错了...",err)
      //       reject(false);
      //     });``
      // });
    },
    handleUploadSuccess(res, file) {
      this.fileList.push({
        name: file.name,
        // url: this.dataObj.host + "/" + this.dataObj.dir + "/" + file.name； replace ${filename} to the real file name
        url: this.dataObj.host + "/" + this.dataObj.key.replace("${filename}",file.name)
      });
      this.emitInput(this.fileList);
    },
    handleExceed(files, fileList) {
      this.$message({
        message: "最多只能上传" + this.maxCount + "张图片",
        type: "warning",
        duration: 1000
      });
    }
  }
};
</script>
<style>
</style>


