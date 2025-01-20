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
  <v-toolbar dense dark>
    <v-btn icon @click="$emit('back')">
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <v-toolbar-title>{{ label }}</v-toolbar-title>
    <v-spacer />
    <v-btn icon @click="$emit('save')">
      <v-icon>check</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
export default {
  name: "SetUpToolbar",
  props: {
    label: { type: String, required: false, default: "" },
  },
  data() {
    return {};
  },
};
</script>
