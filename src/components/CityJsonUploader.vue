<template>
  <div>
    <h2>{{ header_text }}</h2>
    <p>{{ main_text }}</p>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text"><i class="fas fa-upload mr-1"></i> Upload</span>
      </div>
      <div class="custom-file">
        <input type="file" class="custom-file-input" id="inputGroupFile01" ref="cityJSONFile" @change="selectedFile">
        <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
      </div>
    </div>
    <div class="alert alert-danger" role="alert" v-show="error_message">
      {{ error_message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CityJsonUploader',
  props: {
    header_text: {
      type: String,
      default: 'File Upload'
    },
    main_text: {
      type: String,
      default: 'Upload a versioned CityJSON file to have fun!'
    }
  },
  data() {
    return {
      error_message: null
    }
  },
  methods: {
    selectedFile() {
      this.error_message = null;

      let file = this.$refs.cityJSONFile.files[0];
      if (!file || file.type != "application/json")
      {
        this.error_message = "This is not a JSON file!";
        return;
      }

      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = evt => {
        var cm = JSON.parse(evt.target.result);

        if ("versioning" in cm)
        {
          this.$emit('file-loaded', cm);
        }
        else
        {
          this.error_message = "This is not a versioned CityJSON file!";
        }
      }
    },
  }
}
</script>