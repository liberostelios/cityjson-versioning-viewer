<template>
  <div class="list-group py-md-2">
    <version-list-item
      v-for="(item, hash) in versions"
      :key="hash"
      :version="item"
      :vid="hash"
      :active="isActive(hash)"
    ></version-list-item>
  </div>
</template>

<script>
import VersionListItem from './VersionListItem.vue'

export default {
  name: 'VersionList',
  components: {
    VersionListItem
  },
  props: {
    versions: Object,
    active_version: String,
  },
  methods: {
    isActive(vid) {
      return this.active_version == vid;
    },
  }
}
</script>