<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="device-sensors-view">
    <div class="sensors-list" v-observer:[optionsObserver]="itemId" @intersected="onIntersected">
      <transition name="fade">
        <b-row v-if="filteredSensors" class="sensor-snaps-container">
          <b-col
            v-for="(sensor, index) in filteredSensors"
            :key="sensor.id"
            :id="`sensor-inline-${index}`"
            :ref="`sensorInline-${sensor.id}`"
            cols="12"
            sm="6"
            md="6"
            lg="4"
            xl="3"
            class="sensor-snap-container"
          >
            <sensor-snap
              :ref="`sensorSnap${sensor.id}`"
              :id="sensor.id.toString()"
              :owner-id="sensor.ownerId.toString()"
              :device-id="sensor.deviceId.toString()"
              :dev-eui="sensor.devEui"
              :name="sensor.name"
              :type="sensor.type"
              :value="JSON.stringify(sensor.value)"
              :frame-counter="sensor.frameCounter"
              :resources="JSON.stringify(sensor.resources)"
              :resource="sensor.resource"
              :icons="sensor.icons.toString()"
              :colors="JSON.stringify(sensor.colors)"
              :transport-protocol="sensor.transportProtocol"
              :transport-protocol-version="sensor.transportProtocolVersion"
              :message-protocol="sensor.messageProtocol"
              :message-protocol-version="sensor.messageProtocolVersion"
              :input-path="sensor.inputPath || null"
              :output-path="sensor.outputPath || null"
              :in-prefix="sensor.inPrefix"
              :out-prefix="sensor.outPrefix"
              :native-type="sensor.nativeType"
              :native-resource="sensor.nativeResource"
              :native-sensor-id="sensor.nativeSensorId"
              :native-node-id="sensor.nativeNodeId || null"
              :width="sensorSnapWidth"
              :height="sensorSnapHeight"
              @update-sensor="onUpdateSensor"
              @update-setting="onUpdateSetting"
              @delete-sensor="onDeleteSensor"
            />
          </b-col>
        </b-row>
      </transition>
    </div>
    <b-modal ref="confirmPopup" hide-backdrop size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </div>
</template>

<script>
import { BModal } from 'bootstrap-vue';
import Observer from '@/directives/observer';
import Collection from '@/mixins/collection';
import logger from '@/services/logger';

export default {
  name: 'SensorsList',

  components: {
    'b-modal': BModal,
    'sensor-snap': () => import('sensor-snap'),
  },

  mixins: [Collection],

  directives: { Observer },

  props: {
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'device-id': {
      type: String,
      required: true,
      default: '',
    },
  },

  data() {
    return {
      elementsMounted: false,
      sensorSnapWidth: 180,
      sensorSnapHeight: 200,
      sensorsFilter: null,
      filteredSensors: null,
      updatedDeviceId: null,
      sensorsListLimit: 8,
      sensorsListCounter: 0,
      page: 0,
      optionsObserver: {
        margin: 0,
      },
      confirm: {
        message: `Are you sure you want to delete this sensor ?`,
      },
    };
  },

  computed: {
    sensors: {
      get() {
        return this.$store.state.sensor.collection;
      },
      set(value) {
        this.$store.commit('sensor/setStateKV', { key: 'collection', value });
      },
    },
    deviceSensors: {
      get() {
        return this.$store.state.sensor.deviceSensors;
      },
      set(value) {
        this.$store.commit('sensor/setStateKV', { key: 'deviceSensors', value });
      },
    },
    sensor: {
      get() {
        return this.$store.state.sensor.instance;
      },
      set(value) {
        this.$store.commit('sensor/setModel', value);
      },
    },
    sensorsCount() {
      return this.$store.state.sensor.deviceSensorsCount;
    },
    itemId() {
      if (this.filteredSensors && this.filteredSensors.length > 0) {
        return `sensor-inline-${this.filteredSensors.length - 1}`;
      }
      return null;
    },
  },

  watch: {
    className: {
      handler(name) {
        this.updatedClassName = name;
      },
      immediate: true,
    },
    deviceId: {
      async handler(id, prevId) {
        if (this.$el && id && id !== null) {
          this.updatedDeviceId = id;
          if (!prevId || id.toString() !== prevId.toString()) {
            this.deviceSensors = [];
            this.filteredSensors = [];
            this.sensorsListCounter = 0;
            this.page = 0;
            this.calculateListLimit();
            await this.countSensors();
            await this.updateSensorsList(this.sensorsListCounter);
          }
        }
      },
      immediate: true,
    },
    sensorsFilter: {
      handler(value) {
        this.updateFilteredSensors(value);
      },
      immediate: true,
    },
    sensors: {
      handler(value) {
        if (!this.updatedDeviceId) return;
        if (value && Array.isArray(value)) {
          this.deviceSensors = value.filter(
            (sensor) => sensor.deviceId.toString() === this.updatedDeviceId.toString(),
          );
          this.updateFilteredSensors(this.sensorsFilter);
        }
      },
      immediate: true,
    },
  },

  methods: {
    async loadSensors(deviceId, filter) {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        if (
          this.$store.cache.has('sensor/findByDevice', {
            deviceId,
            filter,
          })
        ) {
          return this.filteredSensors;
        }
        const sensors = await this.$store.cache.dispatch('sensor/findByDevice', {
          deviceId,
          filter,
        });
        // logger.publish(4, 'sensor', 'loadSensors:res', sensors);
        this.loading = false;
        return sensors;
      } catch (error) {
        this.loading = false;
        throw error;
      }
    },

    async countSensors() {
      await this.$store.dispatch('sensor/countByDevice', {
        deviceId: this.updatedDeviceId,
      });
    },

    async onUpdateSensor(...args) {
      try {
        logger.publish(4, 'sensor', 'onUpdateSensor:req', { key: args[1], value: args[2] });
        if (!args || !args[0].id) return;
        const sensor = await this.updateSensor(args[0], args[1], args[2]);
        await this.$store.dispatch('sensor/publish', {
          sensor,
          userId: this.$props.userId,
        });
        //  return sensor;
      } catch (error) {
        logger.publish(2, 'sensor', 'onUpdateSensor:err', error);
        throw error;
      }
    },

    async onUpdateSetting(...args) {
      logger.publish(4, 'sensor', 'onUpdateSetting:req', { key: args[1], value: args[2] });
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor.resources[args[1].toString()] = args[2];
      sensor.resource = args[1];
      sensor.value = args[2];
      sensor.method = 'PUT';
      sensor.lastSignal = new Date();
      //  const updatedSensor = await this.$store.dispatch('sensor/updateInstance', { sensor });
      await this.$store.dispatch('sensor/publish', {
        sensor,
        userId: this.$props.userId,
      });
      return sensor;
    },

    onDeleteSensor(sensor) {
      logger.publish(4, 'sensor', 'onDeleteSensor:req', sensor);
      if (sensor && sensor.id) {
        this.sensor = sensor;
        this.$refs.confirmPopup.show();
      }
    },

    async updateSensorsList(counter) {
      try {
        logger.publish(4, 'sensor', 'updateSensorsList:req', counter);
        const sensors = await this.loadSensors(this.updatedDeviceId, {
          skip: counter,
          limit: this.sensorsListLimit,
        });
        this.sensors = await this.batchSensorCollection(this.sensors, 'create', sensors, false);
        this.updateFilteredSensors(this.sensorsFilter);
        return sensors;
      } catch (error) {
        return null;
      }
    },

    calculateListLimit() {
      const rowRatio = Math.round((this.$el.clientHeight / this.sensorSnapHeight) * 1.1);
      const columnRatio = Math.round(this.$el.clientWidth / (this.sensorSnapWidth * 1.5));
      const limit = rowRatio * columnRatio;
      if (limit > 0) this.sensorsListLimit = limit;
      // console.log('Ratios:', rowRatio, columnRatio, this.sensorsListLimit);
      return limit;
    },

    updateFilteredSensors(filter) {
      if (filter && filter.key && filter.value) {
        this.filteredSensors = this.deviceSensors.filter((sensor) => {
          sensor[filter.key].toLowerCase() === filter.value;
        });
      } else {
        this.filteredSensors = this.deviceSensors;
      }
      return this.filteredSensors;
    },

    async onIntersected(evt) {
      const obs = evt.detail.obs;
      if (!obs || !obs.isIntersecting || obs.intersectionRatio !== 1) return;
      // console.log('onIntersected', obs);
      this.calculateListLimit();
      if (this.page + 1 >= this.sensorsCount / this.sensorsListLimit) return;
      this.page += 1;
      let counter = 0;
      if (this.sensorsFilter) return;
      else counter = this.sensorsListLimit * this.page || 0;
      if (counter < 0) counter = 0;
      // console.log('onScrollBottom', counter, this.sensorsCount, this.sensorsListLimit);
      if (counter !== this.sensorsListCounter) {
        this.sensorsListCounter = counter;
        return this.updateSensorsList(counter);
      }
      return null;
    },

    async onYes() {
      await this.$store.dispatch('sensor/deleteInstance', {
        sensor: this.sensor,
      });
      return this.$refs.confirmPopup.hide();
    },

    onNo() {
      this.$refs.confirmPopup.hide();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/sensors-list.scss';
</style>
