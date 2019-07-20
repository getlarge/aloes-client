import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Device',
    resources: 'Devices',
    editorMode: false,
    success: null,
    error: null,
    dismissSecs: 5,
    dismissCountDown: 0,
    loading: null,
    outputTopic: 'IoTAgent',
    collection: [],
    instance: {
      ownerId: null,
      name: null,
      type: null,
      accessPointUrl: null,
      protocolName: null,
      protocolVersion: null,
      transportProtocol: null,
      transportProtocolVersion: null,
      messageProtocol: null,
      messageProtocolVersion: null,
      status: false,
      description: '',
      qrCode: '',
      icons: [],
      frameCounter: 0,
      appEui: null,
      devEui: null,
      devAddr: null,
      apiKey: null,
      appKey: null,
      appSKey: null,
      nwkSKey: null,
      authMode: null,
    },
    network: {},
  },
  mutations,
  actions,
};
