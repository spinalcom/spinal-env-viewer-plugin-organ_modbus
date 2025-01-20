<!--
Copyright 2020 SpinalCom - www.spinalcom.com

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
  <v-app dark class="LinkAndManageContextTicketMission-body">
    <SetUpContextEquip
      v-if="openSetupEquip"
      :server-id="serverId"
      @close="openSetupEquip = false"
    />
    <setUpSelectedOrgan
      v-else-if="openSetup"
      :context-id="contextId"
      @close="onCloseSetup()"
    />
    <v-card v-else class="LinkAndManageContextTicketMission-card">
      <v-toolbar class="LinkAndManageContextTicketMission-toolbar" dense dark>
        <v-toolbar-title> Status : {{ statusCompu }} </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="openSetup = true">
          <v-icon>settings</v-icon>
        </v-btn>

        <v-speed-dial v-model="fabBtn" direction="left" :open-on-hover="false">
          <template #activator>
            <v-btn v-model="fabBtn" color="blue" small fab>
              <v-icon>more_vert</v-icon>
              <v-icon>close</v-icon>
            </v-btn>
          </template>

          <v-btn
            v-tooltip="runStopCompu"
            fab
            :disabled="disableBtn"
            small
            :color="runStopColorCompu"
            @click="runOrStop"
          >
            <v-icon>{{ runStopIconCompu }}</v-icon>
          </v-btn>

          <v-btn
            v-tooltip="'Restart Organ'"
            fab
            :disabled="linked === false || restart === true"
            small
            color="red"
            @click="restartOrgan"
          >
            <v-icon>refresh</v-icon>
          </v-btn>
        </v-speed-dial>
      </v-toolbar>
      <v-card-text class="LinkAndManageContextTicketMission-card-container">
        <md-empty-state
          :md-icon="statusIconCompu"
          :md-label="statusCompu"
          md-description=""
        >
          <md-button
            v-if="linked === false"
            class="md-primary md-raised"
            @click="openSetup = true"
          >
            Click here for Setup
          </md-button>
        </md-empty-state>
      </v-card-text>
    </v-card>
    <v-progress-linear
      v-if="spin"
      style="margin: 0"
      class="spinal-modal-progress-bar"
      :indeterminate="true"
      color="primary"
    />
  </v-app>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import SetUpSelectedOrgan from './SetUpSelectedOrgan.vue';
export default {
  name: 'LinkAndManageOrgan',
  components: { SetUpSelectedOrgan },
  data: function () {
    return {
      openSetup: false,
      openSetupEquip: false,
      contextId: '',
      linked: false,
      status: -1,
      serverId: 0,
      restart: false,
      fabBtn: false,
    };
  },
  computed: {
    statusCompu() {
      if (this.linked === false) return 'Not linked';
      if (this.restart === true) return 'Restarting';
      switch (this.status) {
        case 0:
          return 'Stand By';
        case 1:
          return 'Sync spatial';
        case 2:
          return 'Sync process';
        case 3:
          return 'Running';
        case 4:
          return 'Sync Equipments';
        default:
          return 'Stand By';
      }
    },
    statusIconCompu() {
      if (this.linked === false) return 'settings';
      if (this.restart === true) return 'refresh';
      switch (this.status) {
        case 0:
          return 'done';
        case 1:
          return 'location_city';
        case 2:
          return 'assignment_returned';
        case 3:
          return 'play_arrow';
        case 4:
          return 'device_hub';
        default:
          return 'done';
      }
    },

    spin() {
      if (this.restart === true || this.status === 1 || this.status === 2) {
        return true;
      }
      return false;
    },
    disableBtn() {
      if (this.linked === true && this.spin === false) {
        return false;
      }
      return true;
    },
    runStopCompu() {
      if (this.linked === true && this.status === 3) return 'Stop';
      return 'Run';
    },
    runStopIconCompu() {
      if (this.linked === true && this.status === 3) return 'pause';
      return 'play_arrow';
    },
    runStopColorCompu() {
      if (this.linked === true && this.status === 3) return 'red';
      return 'green';
    },
  },
  mounted() {},
  methods: {
    async getLinkedOrgan() {
      const node = SpinalGraphService.getRealNode(this.contextId);
      if (!node.element) {
        return null;
      }
      const element = await node.element.load();
      if (element.contextId && this.contextId === element.contextId.get()) {
        if (this.unbindFct) this.unbindFct();
        const unbind = element.bind(() => {
          if (this) {
            this.status = element.organStatus.get();
            console.log('this.status', this.status);
            this.linked = true;
            this.serverId = element._server_id;
            this.restart = element.restart.get();
          }
        });
        this.unbindFct = () => {
          element.unbind(unbind);
        };
        return element;
      }
      return null;
    },
    async runOrStop() {
      const node = SpinalGraphService.getRealNode(this.contextId);
      if (!node.element) {
        return null;
      }
      const element = await node.element.load();
      element.organStatus.set(this.status === 3 ? 0 : 3);
    },
    async restartOrgan() {
      const node = SpinalGraphService.getRealNode(this.contextId);
      if (!node.element) {
        return null;
      }
      const element = await node.element.load();
      element.restart.set(true);
    },
    start() {},
    async onCloseSetup() {
      this.openSetup = false;
      await this.getLinkedOrgan();
    },
    async opened(data) {
      console.log('opened', data);
      this.contextId = data;
      this.status = -1;
      this.linked = false;
      this.serverId = 0;
      this.restart = false;
      await this.getLinkedOrgan();
    },
    removed() {},
    close() {},
    closeDialog() {},
  },
};
</script>

<style scoped>
.LinkAndManageContextTicketMission-body {
  height: calc(100% - 17px);
  position: relative;
  overflow: auto;
}
.spinal-modal-progress-bar {
  margin: 0;
  z-index: 1;
  position: absolute;
  bottom: 2px;
}
.LinkAndManageContextTicketMission-card {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.LinkAndManageContextTicketMission-card-container {
  height: calc(100% - 50px);
  position: relative;
  overflow: auto;
}
</style>
<style>
.LinkAndManageContextTicketMission-body > .application--wrap {
  height: 100%;
  min-height: unset;
  position: relative;
}
.LinkAndManageContextTicketMission-body,
.LinkAndManageContextTicketMission-body * {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.LinkAndManageContextTicketMission-body .v-btn--floating .v-btn__content {
  height: unset;
}

.LinkAndManageContextTicketMission-body
  .v-btn--floating
  .v-btn__content
  > :not(:only-child):first-child,
.v-btn--floating .v-btn__content > :not(:only-child):last-child {
  top: unset;
}

.LinkAndManageContextTicketMission-toolbar .v-speed-dial__list > div {
  background: #212121;
  height: 48px;
}

.LinkAndManageContextTicketMission-toolbar > .v-toolbar__content {
  padding-right: 0;
}

.LinkAndManageContextTicketMission-body *::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.LinkAndManageContextTicketMission-body *::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.LinkAndManageContextTicketMission-body *::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
</style>
