<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark">
        <a class="navbar-brand" href="#">vCityJSON Viewer</a>
    </nav>
    <div v-if="file_loaded">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-xl-4 py-2">
            <div class="form-inline input-group my-2 my-lg-0">
              <div class="input-group-prepend">
                <label class="input-group-text" for="branchSelect"><i class="fas fa-code-branch mr-1"></i> Branch</label>
              </div>
              <select class="custom-select" id="branchSelect" v-model="active_branch">
                <option
                  v-for="(version, branch) in versioning.branches"
                  :key="branch">
                  {{ branch }}
                  </option>
              </select>
            </div>
            <div class="list-group py-md-2">
              <version-list-item
                  v-for="(item, hash) in orderedVersions(active_branch)"
                  :key="hash"
                  :version="item"
                  :vid="hash"
                  :active="isActive(hash)"
              ></version-list-item>
            </div>              
            <div class="card">
              <div class="card-header bg-secondary text-white"><i class="fas fa-cog mr-1"></i> Settings</div>
              <div class="card-body">
                <div class="form-group">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="show_preview" id="showPreview">
                    <label class="form-check-label" for="showPreview">
                      Show 3D preview
                    </label>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-danger" v-on:click="reset"><i class="fas fa-redo mr-1"></i> Start over</button>
              </div>
            </div>
          </div>
          <main class="col-12 col-xl-8 py-2">
            <div class="row" v-show="isVersionSelected">
              <div class="col-12 my-2">
                <version-viewer
                  v-bind:version="activeVersionObject"
                  v-bind:vid="active_version"
                ></version-viewer>
              </div>
            </div>
            <div class="row">
              <div class="col-12" v-if="showPreview">
                <div class="card mb-2">
                  <h5 class="card-header bg-dark text-white">
                    Preview
                  </h5>
                  <div class="card-body p-0" style="height: 500px">
                    <three-js-viewer
                      v-if="isVersionSelected"
                      v-bind:citymodel="activeCityModel"
                    ></three-js-viewer>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="container">
        <div class="row">
          <main class="col-12 py-md-3 pl-md-5">
            <CityJsonUploader @file-loaded="loadFile"></CityJsonUploader>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VersionListItem from './components/VersionListItem.vue'
import VersionViewer from './components/VersionViewer.vue'
import CityJsonUploader from './components/CityJsonUploader.vue'
import $ from 'jquery'

export default {
  name: 'app',
  components: {
    VersionListItem,
    VersionViewer,
    CityJsonUploader
  },
  data() {
    return {
      file_loaded: false,
      show_preview: false,
      active_branch: "master",
      active_version: null,
      citymodel: {},
      versioning: {
        versions: {
          "db244f6be3791d72c94b099fde8db2915c6a7041": { author: "Solid Snake", message: "Initial commit", date: new Date('2011-04-11T10:20:30Z'), parents: [] },
          "816590924a31e92959281353dda3ce5b3f70bf44": { author: "Liquid Snake", message: "Something fixed", date: new Date('2011-04-13T10:20:30Z'), parents: [ "db244f6be3791d72c94b099fde8db2915c6a7041" ] },
        },
        branches: {
          "master": "db244f6be3791d72c94b099fde8db2915c6a7041",
          "develop": "816590924a31e92959281353dda3ce5b3f70bf44"
        }
      }
    }
  },
  created() {
    let self = this;

    this.$root.$on('download_version', (vid) => {
      // console.log(self.file_loaded);
      self.downloadVersion(vid);
    });

    this.$root.$on('select_version', (vid) => {
      this.active_version = vid;
    });
  },
  computed: {
    activeVersionObject: function() {
      if (this.isVersionSelected)
        return this.versioning.versions[this.active_version];
      
      return {};
    },
    isVersionSelected: function() {
      return this.active_version !== null;
    },
    activeCityModel: function() {
      if (!this.isVersionSelected)
      {
        return {};
      }

      // console.log(this.active_version);
      return this.extract_citymodel(this.active_version);
    },
    showPreview: function () {
      return this.show_preview && this.isVersionSelected;
    }
  },
  methods: {
    orderedVersions(branch) {
      var result = {};

      var current_vid = this.versioning.branches[branch];
      result[current_vid] = this.versioning.versions[current_vid];

      var new_parents = [];
      
      if ("parents" in result[current_vid])
      {
        new_parents = new_parents.concat(result[current_vid].parents);
      }

      while (new_parents.length > 0)
      {
        current_vid = new_parents.pop();

        result[current_vid] = this.versioning.versions[current_vid];

        if ("parents" in result[current_vid])
        {
          new_parents = result[current_vid].parents.concat(new_parents);
        }
      }

      return result;
    },
    isActive(vid) {
      return this.active_version == vid;
    },
    reset() {
      this.versions = {};
      this.active_branch = "master";
      this.active_version = null;
      this.file_loaded = false;
    },
    extract_citymodel(vid) {
      var cityobjects = this.versioning.versions[vid].objects;

      var result = $.extend({}, this.citymodel);

      result["CityObjects"] = {};

      delete result["versioning"];

      for (var key in this.citymodel["CityObjects"])
      {
        if (cityobjects.indexOf(key) != -1)
        {
          var new_key = this.citymodel["CityObjects"][key]["cityobject_id"];
          result["CityObjects"][new_key] = $.extend({}, this.citymodel["CityObjects"][key]);
          delete result["CityObjects"][new_key]["cityobject_id"];
        }
      }

      return result;
    },
    download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    },
    downloadVersion(vid) {
      var text = JSON.stringify(this.activeCityModel);

      this.download(vid + ".json", text);
    },
    loadFile(citymodel) {
      this.citymodel = citymodel;

      this.versioning = this.citymodel.versioning;
      var versions = this.citymodel.versioning.versions;
      for (var key in versions){
        versions[key].date = new Date(versions[key].date);
      }
      this.versioning.versions = versions;

      this.file_loaded = true;
    }
  }
}
</script>