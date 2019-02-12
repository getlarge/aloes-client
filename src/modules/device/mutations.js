import logger from "@/services/logger";

export function setModelKV(state, { key, value }) {
  state.instance[key] = value;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setModelKV:res",
  //   state.instance[key]
  // );
}

export function setModel(state, device) {
  state.instance = device;
  logger.publish(
    4,
    state.collectionName,
    "commit:setModel:res",
    state.instance
  );
}

export function setCollection(state, devices) {
  state.collection = devices;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setCollection:res",
  //   state.collection
  // );
}

export function setStateKV(state, { key, value }) {
  state[key] = value;
  logger.publish(4, state.collectionName, "commit:setStateKV:res", state[key]);
}

export function setEditorMode(state, value) {
  state.editorMode = value;
  logger.publish(
    4,
    state.collectionName,
    "commit:setEditorMode:res",
    state.editorMode
  );
}

//  export function setModelList(state, {command, list, value}) {
//   if (command === "add") {
//     state.instance[list].push(value);
//   } else if (command === "del") {
//     state.instance[list].splice(value, 1);
//   } else if (command === "update") {
//     state.instance[list] = value;
//   }
//   logger.publish(4, state.collectionName, `commit:setModelList:${command}`, state.instance[list]);
// }

export function cleanModel(state) {
  state.instance = {
    accountId: null,
    devEui: null,
    appKey: null,
    name: null,
    type: null,
    accessPointUrl: null,
    protocolName: null,
    protocolVersion: null,
    status: false,
    description: "",
    qrCode: "",
    icons: [],
    frameCounter: 0
  };
  logger.publish(
    4,
    state.collectionName,
    "commit:cleanModel:res",
    state.instance
  );
}

// export function setExperienceKV(state, {position, key, value}) {
//   if (position === -1) {
//     state.experience[key] = value;
//     logger.publish(4, state.collectionName, "commit:setExperienceKV:res", state.experience[key]);
//   } else {
//     state.model.experiences[position][key] = value;
//     logger.publish(4, state.collectionName, "commit:setExperienceKV:res", state.model.experiences[position][key]);
//   }
// }
