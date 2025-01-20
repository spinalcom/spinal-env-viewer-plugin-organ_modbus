/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { spinalContextMenuService } from 'spinal-env-viewer-context-menu-service';
import { SpinalForgeExtention } from 'spinal-env-viewer-panel-manager-service_spinalforgeextention';
import Vue from 'vue';

import LinkAndManageOrgan from './src/views/LinkAndManageOrgan.vue';
import { LinkAndManageOrganBtn } from './src/buttons/LinkAndManageOrganBtn';

const SIDE_BAR_HOOK_NAME = 'GraphManagerSideBar';

spinalContextMenuService.registerApp(
  SIDE_BAR_HOOK_NAME,
  new LinkAndManageOrganBtn(),
  [7]
);

SpinalForgeExtention.registerExtention(
  'LinkAndManageOrgan',
  SpinalForgeExtention.createExtention({
    name: 'LinkAndManageOrgan',
    vueMountComponent: Vue.extend(LinkAndManageOrgan),
    parentContainer: document.body,
    panel: {
      title: 'Link And Manage Connector',
      classname: 'spinal-pannel',
      closeBehaviour: 'delete',
    },
    style: {
      left: '405px',
      width: '500px',
      height: '250px',
    },
  })
);
