<template>
  <div>
    <el-upload
  class="upload-demo"
  :action="uploadUrl"
  :on-success="handleSuccess"
  :before-upload="beforeUpload">
  <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 2MB</div>
  <input type="file" name="file" />
</el-upload>
  </div>
</template>

<script>

export default {
  data() {
    return {
      uploadUrl: "http://localhost:88/api/third/aws/upload",
      headers: {
        "Content-Type": "multipart/form-data;boundary=---------------------------12345678901234567890",
      },
    };
  },
  methods: {
    beforeUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt500k = file.size / 1024 < 500;

      if (!isJPG) {
        this.$message.error("Upload only JPG/PNG files");
        return false;
      }

      if (!isLt500k) {
        this.$message.error("File size must be less than 500KB");
        return false;
      }

      return true;
    },
    handleSuccess(response) {
      console.log(response);
      this.$emit('input', response.msg)
      this.$message.success("Upload successfully");
    },
  },
};
</script>