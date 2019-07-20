import logger from '@/services/logger';

export function setProfileAddress(state, { viewer, address }) {
  if (viewer) {
    state.viewedProfileAddress = address;
    logger.publish(
      4,
      state.collectionName,
      'commit:setProfileAddress:res',
      state.viewedProfileAddress,
    );
  } else {
    state.profileAddress = address;
    logger.publish(4, state.collectionName, 'commit:setProfileAddress:res', state.profileAddress);
  }
}

export function setDeviceAddress(state, address) {
  state.deviceAddress = address;
  logger.publish(4, state.collectionName, 'commit:setDeviceAddress:res', state.deviceAddress);
}

export function setModelKV(state, { ownerType, key, value }) {
  if (ownerType === 'Devices') {
    state.deviceAddress[key] = value;
    logger.publish(
      4,
      state.collectionName,
      'commit:setDeviceAddressKV:res',
      state.deviceAddress[key],
    );
  } else if (ownerType === 'users') {
    state.profileAddress[key] = value;
    logger.publish(
      4,
      state.collectionName,
      'commit:setProfileAddressKV:res',
      state.profileAddress[key],
    );
  }
}
