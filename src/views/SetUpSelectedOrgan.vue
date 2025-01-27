<!--
Copyright 2021 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <v-card class="spinal-setup-organ-body">
    <set-up-toolbar
      title="Setup Context's equipment to send"
      @back="back"
      @save="save"
    />

    <v-card-text class="spinal-setup-organ-container">
      <form action="none">
        <md-field>
          <label for="Select Spatial Context">Select the Organ</label>
          <md-select
            id="modelselect"
            v-model="selectedOrgan"
            name="modelselect"
            md-dense
          >
            <md-option
              v-for="organCfg in organsCfg"
              :key="organCfg.id"
              :value="organCfg.id"
            >
              {{ organCfg.name }}
            </md-option>
          </md-select>
        </md-field>
        <template v-if="selectedOrgan">

              <md-field>
                <label for="Select Configuration Sheet">Select Configuration Sheet</label>
                <md-file @md-change="getFileImported" v-model='configFileName'>
                </md-file>
              </md-field>
          
          <v-text-field
            v-model="pullInterval"
            placeholder="Interval between each data pull"
            type="number"
            label="Interval between each data pull in ms"
          />

          <VueCtkDateTimePicker
            v-model="lastSyncCompu"
            :dark="true"
            :max-date="today"
            label="Last Synchonization"
          />
        </template>
      </form>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  SpinalGraphService,
  SpinalNodePointer,
} from "spinal-env-viewer-graph-service";
import { FileSystem } from "spinal-core-connectorjs_type";
import moment from "moment";
import spinalEnvViewerContextGeographicService from "spinal-env-viewer-context-geographic-service";
import SetUpToolbar from "./SetUpToolbar.vue";
import { FileExplorer } from "../services/fileSystemExplorer";

const CONTEXT_GEO_TYPE =
  spinalEnvViewerContextGeographicService.constants.CONTEXT_TYPE;
export default {
  name: "SetUpSelectedOrgan",
  components: { SetUpToolbar },
  props: {
    contextId: { required: true, type: String },
  },
  data: function () {
    const today = new Date();
    return {
      spin: false,
      today: today.toISOString(),
      selectedOrgan: null,
      selectedDirectory: null,
      pullInterval: 5 * 60 * 1000, // 5 min
      configFileName: null,
      importedFile: null,
      lastSync: NaN,
      organsCfg: [],
      // selectedContextId: ""
    };
  },
  computed: {
    lastSyncCompu: {
      get() {
        if (!this.lastSync) {
          return null;
        } else {
          return new Date(this.lastSync).toISOString();
        }
      },
      set(value) {
        this.lastSync = moment.utc(value, "YYYY-MM-DD HH:mm:ss");
      },
    },
  },
  watch: {
    async selectedOrgan() {
      const selectedFile = FileSystem._objects[this.selectedOrgan];
      // eslint-disable-next-line no-undef
      const node = await spinal.spinalSystem.loadPtr(selectedFile);
      this.pullInterval = node.pullInterval.get();
      this.lastSync = node.lastSync.get();
    },
  },
  async mounted() {
    // eslint-disable-next-line no-undef
    const files = await spinal.spinalSystem.load("/etc/Organs/modbus");
    const organ = await this.getLinkedOrgan();
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      this.organsCfg.push({
        name: file.name.get(),
        id: file._server_id,
        ptr: file._ptr.data.value,
      });
      if (organ && organ._server_id === file._ptr.data.value) {
        this.selectedOrgan = file._server_id;
      }
      const node = SpinalGraphService.getRealNode(this.contextId);
      this.selectedDirectory = await FileExplorer.getDirectory(
        node
      );
      //console.log("SelectedDirectory", this.selectedDirectory)
      if(this.selectedDirectory.length > 0){ 
        this.configFileName = this.selectedDirectory[0].name.get();
      }
    }

    const graph = await window.spinal.spinalSystem.getModel();
    const children = await graph.getChildren();
  },
  methods: {
    async getLinkedOrgan() {
      const node = SpinalGraphService.getRealNode(this.contextId);
      if (!node.element) {
        return null;
      }
      const element = await node.element.load();
      if (element.contextId && this.contextId === element.contextId.get()) {
        return element;
      }
      return null;
    },
    getFileImported(file) {
         this.importedFile = file;
    },
    async saveFile(){
      if(!this.importedFile){
        return;
      }
      const node = SpinalGraphService.getRealNode(this.contextId);
      if(!this.selectedDirectory){ // if no directory is selected create one
        this.selectedDirectory = await FileExplorer.createDirectory(node);
      }
      if(this.selectedDirectory.length > 0){ //if a file already exist delete it
        this.selectedDirectory.splice(0, 1);
      }
        
      
      this.sendAddFile();

    },  
    sendAddFile() {
         if (this.configFileName) {
            FileExplorer.addFileUpload(
               this.selectedDirectory,
               this.importedFile
            );
         }
      this.importedFile = null;
      this.configFileName = null;
      this.importedFile = null;
    },
    saveSetting() {
      console.log("SaveSetting", this);
    },
    back() {
      this.$emit("close");
    },
    async save() {
      await this.saveFile();
      const selectedFile = FileSystem._objects[this.selectedOrgan];
      // eslint-disable-next-line no-undef
      const organCfgModel = await spinal.spinalSystem.loadPtr(
        selectedFile
      );
      const node = SpinalGraphService.getRealNode(this.contextId);
      if (node.element === undefined) {
        node.add_attr("element", new SpinalNodePointer(organCfgModel));
      } else if (node.element.ptr.data !== organCfgModel._server_id) {
        node.element.setElement(organCfgModel);
      }
      // eslint-disable-next-line no-undef
      organCfgModel.digitalTwinPath.set(spinal.spinalSystem.getPath());
      organCfgModel.contextId.set(this.contextId);
      organCfgModel.pullInterval.set(this.pullInterval);
      organCfgModel.lastSync.set(this.lastSync);
      organCfgModel.restart.set(true);
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.spinal-setup-organ-body {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.spinal-setup-organ-container {
  height: calc(100% - 50px);
  position: relative;
  overflow: auto;
}
</style>
