<template>
   
  <div>
    <el-upload
      ref="upload"
      class="upload-demo"
      :action="s3UploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
    >
      <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
  </div>
</template>
<script>
import { policy } from "./policy";
import { getUUID } from "@/utils";

export default {
  name: "singleUpload",
  props: {
    value: String,
  },
  computed: {
    imageUrl() {
      return this.value;
    },
    imageName() {
      if (this.value != null && this.value !== "") {
        return this.value.substr(this.value.lastIndexOf("/") + 1);
      } else {
        return null;
      }
    },
    fileList() {
      return [
        {
          name: this.imageName,
          url: this.imageUrl,
        },
      ];
    },
    showFileList: {
      get: function () {
        return (
          this.value !== null && this.value !== "" && this.value !== undefined
        );
      },
      set: function (newValue) {},
    },
  },
  data() {
    return {
      s3UploadUrl: "https://mall-oss.s3.ap-southeast-2.amazonaws.com/",
      s3Bucket: "",
      s3Region: "",
      s3AccessKeyId: "",
      s3SecretKey: "",
      dataObj: {
        policy: "",
        signature: "",
        key: "",
        ossaccessKeyId: "",
        dir: "",
        host: "",
        // callback:'',
      },
      dialogVisible: false,
    };
  },
  methods: {
    createUploadPolicy(fileName, fileType) {
      const date = new Date();
      const expiration = new Date(date.getTime() + 60 * 1000);
      const policy = {
        expiration: expiration.toISOString(),
        conditions: [
          ["starts-with", "$key", fileName],
          { bucket: this.s3Bucket },
          { acl: "public-read" },
          ["starts-with", "$Content-Type", fileType],
          ["content-length-range", 0, 524288000],
        ],
      };
      return Buffer.from(JSON.stringify(policy)).toString("base64");
    },

    createUploadSignature(policy, access, secret) {
      const signature = new AWS.S3({
        accessKeyId: access,
        secretAccessKey: secret,
      }).createSign("sha1");
      signature.update(policy);
      return signature.sign("base64");
    },
    created() {},
    getS3UploadUrl() {
      // 这里你可以使用你的后端服务来获取S3上传所需的签名和policy，返回的数据包含以下字段：
      // s3UploadUrl：S3上传地址
      // s3AccessKeyId：S3访问密钥ID
      // s3Policy：S3上传策略
      // s3Signature：S3上传签名
      // s3Region：S3存储区域
      // s3Bucket：S3存储桶名字
      // 这里为了方便，我们直接使用前端生成的签名和policy
      const fileName = "test.jpg";
      const fileType = "image/jpeg";
      this.s3Bucket = "mall-oss";
      this.s3Region = "ap-southeast-2";
      this.s3AccessKeyId = "AKIARIMKWXLF4VGPZ6J7";
      this.s3SecretKey = "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";
      const s3Policy = this.createUploadPolicy(fileName, fileType);
      const s3Signature = this.createUploadSignature(
        this.s3Policy,
        this.s3AccessKeyId,
        this.s3SecretKey
      );
     
    },

    handleBeforeUpload(file) {
      this.getS3UploadUrl();
      const xhr = new XMLHttpRequest();
      xhr.open("POST", this.s3UploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.setRequestHeader("x-amz-acl", "public-read");
      xhr.setRequestHeader("x-amz-meta-filename", file.name);
      console.log("policy", this.s3Policy);
      xhr.setRequestHeader("x-amz-meta-policy", this.s3Policy);
      console.log("s3Signature", this.s3Signature);
      xhr.setRequestHeader("x-amz-signature", this.s3Signature);
      xhr.setRequestHeader("x-amz-Date", "20151229T000000Z");
      console.log(xhr);
      xhr.send(file);
      return false;
    },
    handleUploadSuccess(response, file) {
      console.log("上传成功", response);
    },
    handleUploadError(error, file) {
      console.log("上传失败", error);
    },
    uploadImage(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      this.uploadAvatar(formData)
        .then((response) => {
          console.log("上传图片成功");
          this.form.picUrl = process.env.VUE_APP_BASE_API + response.imgUrl;
        })
        .catch((response) => {
          console.log("图片上传失败");
        });
    },
    uploadAvatar(formData) {
      this.$http.request({
        url: "localhost:88/api/third/aws/upload",
        method: "post",
        data: formData,
      });
    },

    emitInput(val) {
      this.$emit("input", val);
    },
    handleRemove(file, fileList) {
      this.emitInput("");
    },
    handlePreview(file) {
      this.dialogVisible = true;
    },
    beforeUpload(file) {
      let _self = this;
      return new Promise((resolve, reject) => {
        policy()
          .then((response) => {
            _self.dataObj.policy = response.data.policy;
            _self.dataObj.signature = response.data.signature;
            _self.dataObj.ossaccessKeyId = response.data.accessid;
            _self.dataObj.key =
              response.data.dir + "/" + getUUID() + "_${filename}";
            _self.dataObj.dir = response.data.dir;
            _self.dataObj.host = response.data.host;
            resolve(true);
          })
          .catch((err) => {
            reject(false);
          });
      });
    },
    handleUploadSuccess(res, file) {
      console.log("上传成功...");
      this.showFileList = true;
      this.fileList.pop();
      this.fileList.push({
        name: file.name,
        url:
          this.dataObj.host +
          "/" +
          this.dataObj.key.replace("${filename}", file.name),
      });
      this.emitInput(this.fileList[0].url);
    },
  },
};
</script>
<style>
</style>


