<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

r<template lang="html">
  <div class="contact-form-view">
    <h5 class="title">CONTACT</h5>
    <br />
    <b-row align-h="center">
      <b-col sm="12" md="10" lg="8" xl="6">
        <p>
          If you need more information about Aloes or want to get in touch, you can use this good
          old form!
        </p>
      </b-col>
    </b-row>

    <br />
    <b-row align-h="center">
      <b-col sm="12" md="10" lg="8" xl="6">
        <b-form class="contact-form" @submit="sendMessage">
          <b-row>
            <b-col cols="12" sm="6">
              <b-form-group
                id="first-name-contact-group"
                label="First name *"
                label-size="sm"
                label-for="first-name-contact"
              >
                <b-form-input
                  id="first-name-contact"
                  v-model="firstName"
                  type="text"
                  autocomplete="username"
                  size="sm"
                  required
                />
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6">
              <b-form-group
                id="last-name-contact-group"
                label="Last name *"
                label-size="sm"
                label-for="last-name-contact"
              >
                <b-form-input
                  id="last-name-contact"
                  v-model="lastName"
                  size="sm"
                  type="text"
                  autocomplete="username"
                  required
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-form-group
            id="email-contact-group"
            label="Email *"
            label-size="sm"
            label-for="email-contact"
          >
            <b-form-input
              id="email-contact"
              v-model="email"
              type="email"
              autocomplete="email"
              size="sm"
              aria-describedby="emailHelp"
              required
            />
          </b-form-group>
          <b-form-group
            id="contact-object-group"
            label="Subject *"
            label-size="sm"
            label-for="contact-object"
          >
            <b-form-input
              id="contact-object"
              v-model="subject"
              size="sm"
              type="text"
              autocomplete="text"
              required
            />
          </b-form-group>
          <b-form-group
            id="contact-message-group"
            label="Message *"
            label-size="sm"
            label-for="contact-message"
          >
            <b-form-textarea
              id="contact-message"
              v-model="content"
              :rows="4"
              :max-rows="4"
              no-resize
              required
            />
          </b-form-group>
          <b-button type="submit" size="sm" class="send-contact-form">
            Send
          </b-button>
        </b-form>
      </b-col>
    </b-row>
    <b-alert v-if="error" :show="error !== null" variant="alert">
      {{ error.message }}
    </b-alert>
    <b-alert v-if="success" :show="success !== null" variant="success">
      {{ success.message }}
    </b-alert>
  </div>
</template>

<script type="text/javascript">
import { BAlert, BButton, BForm, BFormInput, BFormGroup, BFormTextarea } from 'bootstrap-vue';

export default {
  name: 'ContactForm',

  components: {
    'b-alert': BAlert,
    'b-button': BButton,
    'b-form': BForm,
    'b-form-input': BFormInput,
    'b-form-group': BFormGroup,
    'b-form-textarea': BFormTextarea,
  },

  data() {
    return {
      success: null,
      error: null,
    };
  },

  computed: {
    firstName: {
      get() {
        return this.$store.state.contactForm.firstName;
      },
      set(value) {
        this.$store.commit('setContactFormKV', {
          key: 'firstName',
          value,
        });
      },
    },
    lastName: {
      get() {
        return this.$store.state.contactForm.lastName;
      },
      set(value) {
        this.$store.commit('setContactFormKV', {
          key: 'lastName',
          value,
        });
      },
    },
    email: {
      get() {
        return this.$store.state.contactForm.email;
      },
      set(value) {
        this.$store.commit('setContactFormKV', {
          key: 'email',
          value,
        });
      },
    },
    subject: {
      get() {
        return this.$store.state.contactForm.subject;
      },
      set(value) {
        this.$store.commit('setContactFormKV', {
          key: 'subject',
          value,
        });
      },
    },
    content: {
      get() {
        return this.$store.state.contactForm.content;
      },
      set(value) {
        this.$store.commit('setContactFormKV', {
          key: 'content',
          value,
        });
      },
    },
  },

  mounted() {
    //  this.onReset();
  },

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    async sendMessage(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.success = null;
      this.error = null;
      try {
        const result = await this.$store.dispatch('sendContactForm');
        if (result) {
          this.success = { message: 'Message sent, thanks.' };
          return this.success;
        }
        const error = new Error("Sorry your message couldn't be sent.");
        throw error;
      } catch (error) {
        this.error = error;
        throw error;
      }
    },

    onReset() {
      this.$store.commit('cleanContactForm');
      this.success = null;
      this.error = null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/contact-form.scss';
</style>
