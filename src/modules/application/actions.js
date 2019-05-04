import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

const userResources = 'users';

export async function findApplicationsByAccount({ state, commit }, userId) {
  // return loopback
  //   .get(`/${userResources}/${userId}/${state.resources.toLowerCase()}`)
  return loopback
    .find(`/${state.resources}`, {
      where: { userId },
      limit: 20,
    })
    .then(apps => {
      logger.publish(3, state.collectionName, 'dispatch:findApplicationsByAccount:res', apps);
      commit('setCollection', apps);
      return apps;
    })
    .catch(err => err);
}

export async function findApplicationById({ state, commit }, id) {
  return loopback
    .get(`/${state.resources}/${id}`)
    .then(app => {
      if (app.id) {
        logger.publish(2, state.collectionName, 'dispatch:findApplicationById:res', app);
        commit('setModel', { viewer: false, app });
        return app;
      }
      return new Error('invalid app');
    })
    .catch(err => err);
}

export async function findApplicationKV({ state, commit }, { key, value }) {
  // define limit base on acccount type ?
  try {
    const apps = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      include: 'sensors',
      limit: 10,
    });
    commit('setCollection', apps);
    logger.publish(4, state.collectionName, 'dispatch:findApplicationKV:res', apps);
    return apps;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    logger.publish(2, state.collectionName, 'dispatch:findApplicationKV:err', error);
    return error;
  }
}

export async function subscribeToApplicationsUpdate({ state }, { userId }) {
  await state.collection.forEach(app => {
    return PubSub.subscribeToInstanceUpdate(socket.client, 'Application', userId, app.id);
  });
}

export async function unsubscribeFromApplicationsUpdate({ state }, { userId }) {
  await state.collection.forEach(app =>
    PubSub.unSubscribeWhere(socket.client, {
      collectionName: 'Application',
      userId: userId,
      method: 'PUT',
      modelId: app.id,
    }),
  );
}

export async function saveApplication({ dispatch }, { application }) {
  if (application.id) {
    return dispatch('updateApplication', { application });
  }
  return dispatch('createApplication', { application });
}

export async function createApplication({ state, commit }, { application }) {
  return loopback
    .post(`/Accounts/${application.userId}/${state.resources.toLowerCase()}`, application)
    .then(res => {
      logger.publish(4, state.collectionName, 'dispatch:createApplication:res', res);
      commit('setModel', res);
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function updateApplication({ state, commit }, { application }) {
  return (
    loopback
      .put(
        `/${userResources}/${application.userId}/${state.resources.toLowerCase()}/${
          application.id
        }`,
        application,
      )
      //  .put(`/${state.resources}/${application.id}`, application)
      .then(res => {
        logger.publish(3, state.collectionName, 'dispatch:updateApplication:res', res);
        commit('setModel', res);
        return res;
      })
      .catch(err => err)
  );
  //  return result;
}

export async function delApplication({ state, commit }, { application }) {
  try {
    const deletedApplication = await loopback.delete(
      `/${userResources}/${application.userId}/${state.resources.toLowerCase()}/${application.id}`,
    );
    await commit('setModelKV', {
      key: 'success',
      value: { message: 'application removed' },
    });
    return deletedApplication;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:delApplication:err', error);
    return error;
  }
}
