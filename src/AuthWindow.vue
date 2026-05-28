<template>
  <v-sheet>
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-container class="py-2 px-3">
        <v-row no-gutters class="mb-2 align-center">
          <v-col cols="4">
            <VcsLabel html-for="auth-username">{{
              $t('lux3dviewerAuth.usernameLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="8">
            <VcsTextField
              id="auth-username"
              v-model="username"
              :disabled="loading"
              autocomplete="username"
              :rules="[(v: string) => !!v || '']"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-3 align-center">
          <v-col cols="4">
            <VcsLabel html-for="auth-password">{{
              $t('lux3dviewerAuth.passwordLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="8">
            <VcsTextField
              id="auth-password"
              v-model="password"
              type="password"
              :disabled="loading"
              autocomplete="current-password"
              :rules="[(v: string) => !!v || '']"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="justify-end">
          <VcsFormButton
            type="submit"
            variant="filled"
            :loading="loading"
            :disabled="loading"
          >
            {{ $t('lux3dviewerAuth.submitButton') }}
          </VcsFormButton>
        </v-row>
      </v-container>
    </v-form>
  </v-sheet>
</template>

<script lang="ts">
  import { inject, ref } from 'vue';
  import { VcsTextField, VcsFormButton, VcsLabel, NotificationType } from '@vcmap/ui';
  import type { VcsUiApp } from '@vcmap/ui';
  import { VSheet, VContainer, VRow, VCol, VForm } from 'vuetify/components';
  import { name } from '../package.json';

  type AuthPluginRef = { doLogin: (u: string, p: string) => Promise<void> };

  export default {
    name: 'AuthWindow',
    components: { VcsTextField, VcsFormButton, VcsLabel, VSheet, VContainer, VRow, VCol, VForm },
    setup() {
      const app = inject<VcsUiApp>('vcsApp')!;
      const plugin = app.plugins.getByKey(name) as unknown as AuthPluginRef;
      const username = ref('');
      const password = ref('');
      const loading = ref(false);
      const formRef = ref();

      async function handleSubmit() {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
        loading.value = true;
        try {
          await plugin.doLogin(username.value, password.value);
        } catch (_) {
          app.notifier.add({
            type: NotificationType.ERROR,
            message: 'lux3dviewerAuth.loginError',
          });
        } finally {
          loading.value = false;
          password.value = '';
        }
      }

      return { username, password, loading, formRef, handleSubmit };
    },
  };
</script>
