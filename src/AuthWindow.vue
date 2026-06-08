<template>
  <v-sheet>
    <v-form ref="formRef" @submit.prevent="handleConnect">
      <v-container class="py-2 px-3">
        <v-row no-gutters class="mb-2 align-center">
          <v-col cols="4">
            <VcsLabel html-for="auth-username">{{
              $t('lux3dviewerPluginAuth.usernameLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="8">
            <VcsTextField
              id="auth-username"
              :model-value="isConnected ? user!.login : username"
              :disabled="isConnected || loading"
              autocomplete="username"
              :rules="isConnected ? [] : requiredRule"
              @update:model-value="(v: string) => (username = v)"
            />
          </v-col>
        </v-row>
        <v-row v-if="isConnected" no-gutters class="mb-3 align-center">
          <v-col cols="4">
            <VcsLabel html-for="auth-mail">{{
              $t('lux3dviewerPluginAuth.emailLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="8">
            <VcsTextField
              id="auth-mail"
              :model-value="user!.mail ?? ''"
              :type="'text'"
              :disabled="true"
            />
          </v-col>
        </v-row>
        <v-row v-else no-gutters class="mb-3 align-center">
          <v-col cols="4">
            <VcsLabel html-for="auth-pwd">{{
              $t('lux3dviewerPluginAuth.passwordLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="8">
            <VcsTextField
              id="auth-pwd"
              :model-value="password"
              :type="'password'"
              :disabled="loading"
              :autocomplete="'current-password'"
              :rules="requiredRule"
              @update:model-value="(v: string) => (password = v)"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="justify-end">
          <VcsFormButton
            v-if="isConnected"
            variant="filled"
            :loading="loading"
            :disabled="loading"
            @click="handleDisconnect"
          >
            {{ $t('lux3dviewerPluginAuth.disconnectButton') }}
          </VcsFormButton>
          <VcsFormButton
            v-else
            type="submit"
            variant="filled"
            :loading="loading"
            :disabled="loading"
          >
            {{ $t('lux3dviewerPluginAuth.submitButton') }}
          </VcsFormButton>
        </v-row>
      </v-container>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
  import { inject, ref, computed } from 'vue';
  import {
    VcsTextField,
    VcsFormButton,
    VcsLabel,
    NotificationType,
  } from '@vcmap/ui';
  import type { VcsUiApp } from '@vcmap/ui';
  import { VSheet, VContainer, VRow, VCol, VForm } from 'vuetify/components';
  import { name } from '../package.json';
  import type { UserInfo } from './authService.js';

  type AuthPluginRef = {
    doLogin: (u: string, p: string) => Promise<void>;
    doLogout: () => Promise<void>;
    readonly userState: { user: UserInfo | null };
  };

  const app = inject<VcsUiApp>('vcsApp')!;
  const plugin = app.plugins.getByKey(name) as unknown as AuthPluginRef;
  const username = ref('');
  const password = ref('');
  const loading = ref(false);
  const formRef = ref();

  const user = computed(() => plugin.userState.user);
  const isConnected = computed(() => !!user.value);

  const requiredRule = [
    (v: string): string | boolean => !!v || 'lux3dviewerPluginAuth.required',
  ];

  async function handleConnect(): Promise<void> {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
    loading.value = true;
    try {
      await plugin.doLogin(username.value, password.value);
    } catch (_) {
      app.notifier.add({
        type: NotificationType.ERROR,
        message: 'lux3dviewerPluginAuth.loginError',
      });
    } finally {
      loading.value = false;
      password.value = '';
    }
  }

  async function handleDisconnect(): Promise<void> {
    loading.value = true;
    try {
      await plugin.doLogout();
    } catch (_) {
      app.notifier.add({
        type: NotificationType.ERROR,
        message: 'lux3dviewerPluginAuth.logoutError',
      });
    } finally {
      loading.value = false;
    }
  }
</script>
