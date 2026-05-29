import { reactive } from 'vue';
import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { ButtonLocation, WindowSlot, NotificationType } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import { getUserInfo, login, logout } from './authService.js';
import type { UserInfo } from './authService.js';
import AuthWindow from './AuthWindow.vue';

//TODO: move to/add config
const DEFAULT_BASE_URL = 'http://localhost:8080';
const AUTH_WINDOW_ID = 'lux-auth-login-window';

type PluginConfig = {
  baseUrl?: string;
};

type PluginState = Record<never, never>;

type NavbarAction = {
  name: string;
  title: string;
  icon: string;
  active: boolean;
  callback: () => void;
};

type ThemesyncPlugin = {
  reloadThemes?: (app: VcsUiApp) => Promise<void>;
};

export type AuthPlugin = VcsPlugin<PluginConfig, PluginState> & {
  readonly userState: { user: UserInfo | null };
  doLogin(username: string, password: string): Promise<void>;
  doLogout(): Promise<void>;
};

export default function plugin(
  config: PluginConfig,
  _pluginBaseUrl: string,
): AuthPlugin {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const userState = reactive<{ user: UserInfo | null }>({ user: null });
  let _app: VcsUiApp | null = null;
  let _action: NavbarAction | null = null;

  function updateAction(): void {
    if (!_action) return;
    if (userState.user) {
      _action.name = userState.user.login;
      _action.title = 'lux3dviewerPluginAuth.logoutTooltip';
      _action.icon = 'mdi-account-check';
    } else {
      _action.name = 'lux3dviewerPluginAuth.loginButton';
      _action.title = 'lux3dviewerPluginAuth.loginTooltip';
      _action.icon = 'mdi-account-outline';
    }
  }

  async function reloadThemes(): Promise<void> {
    const themesync = _app?.plugins.getByKey(
      '@geoportallux/lux-3dviewer-themesync',
    ) as ThemesyncPlugin | undefined;
    if (_app && typeof themesync?.reloadThemes === 'function') {
      await themesync.reloadThemes(_app);
    }
  }

  async function doLogin(username: string, password: string): Promise<void> {
    userState.user = await login(baseUrl, username, password);
    updateAction();
    _app?.windowManager.remove(AUTH_WINDOW_ID);
    _app?.notifier.add({
      type: NotificationType.SUCCESS,
      message: 'lux3dviewerPluginAuth.loginSuccess',
    });
    await reloadThemes();
  }

  async function doLogout(): Promise<void> {
    await logout(baseUrl);
    userState.user = null;
    updateAction();
    _app?.windowManager.remove(AUTH_WINDOW_ID);
    _app?.notifier.add({
      type: NotificationType.SUCCESS,
      message: 'lux3dviewerPluginAuth.logoutSuccess',
    });
    await reloadThemes();
  }

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    get userState() {
      return userState;
    },
    doLogin,
    doLogout,

    async initialize(vcsUiApp: VcsUiApp): Promise<void> {
      _app = vcsUiApp;
      try {
        userState.user = await getUserInfo(baseUrl);
        updateAction();
      } catch (_) {
        // not logged in — normal
      }
    },

    onVcsAppMounted(vcsUiApp: VcsUiApp): void {
      _action = reactive<NavbarAction>({
        name: userState.user?.login ?? 'lux3dviewerPluginAuth.loginButton',
        title: userState.user
          ? 'lux3dviewerPluginAuth.logoutTooltip'
          : 'lux3dviewerPluginAuth.loginTooltip',
        icon: userState.user ? 'mdi-account-check' : 'mdi-account-outline',
        active: false,
        callback() {
          if (vcsUiApp.windowManager.has(AUTH_WINDOW_ID)) {
            vcsUiApp.windowManager.remove(AUTH_WINDOW_ID);
          } else {
            vcsUiApp.windowManager.add(
              {
                id: AUTH_WINDOW_ID,
                component: AuthWindow,
                slot: WindowSlot.DYNAMIC_RIGHT,
                state: {
                  headerTitle: 'lux3dviewerPluginAuth.windowTitle',
                  headerIcon: 'mdi-account-outline',
                  styles: { width: '320px', height: 'auto' },
                },
              },
              name,
            );
          }
        },
      });
      vcsUiApp.navbarManager.add(
        { id: 'lux-auth-button', action: _action },
        name,
        ButtonLocation.PROJECT,
      );
    },

    getDefaultOptions(): PluginConfig {
      return { baseUrl: DEFAULT_BASE_URL };
    },

    toJSON(): PluginConfig {
      if (config.baseUrl && config.baseUrl !== DEFAULT_BASE_URL) {
        return { baseUrl: config.baseUrl };
      }
      return {};
    },

    getState(_forUrl?: boolean): PluginState {
      return {};
    },

    getConfigEditors(): PluginConfigEditor<object>[] {
      return [];
    },

    destroy(): void {
      _app?.windowManager.remove(AUTH_WINDOW_ID);
      _app?.navbarManager.removeOwner(name);
      _app = null;
      _action = null;
    },

    i18n: {
      en: {
        lux3dviewerPluginAuth: {
          loginButton: 'Login',
          loginTooltip: 'Log in to your account',
          logoutTooltip: 'Log out',
          windowTitle: 'My Account',
          usernameLabel: 'Username',
          passwordLabel: 'Password',
          emailLabel: 'Email',
          submitButton: 'Connect',
          disconnectButton: 'Disconnect',
          loginSuccess: 'You are now logged in.',
          loginError: 'Invalid username or password.',
          logoutSuccess: 'You have been logged out.',
          logoutError: 'An error occurred while logging out.',
        },
      },
      fr: {
        lux3dviewerPluginAuth: {
          loginButton: 'Connexion',
          loginTooltip: 'Se connecter',
          logoutTooltip: 'Se déconnecter',
          windowTitle: 'Mon compte',
          usernameLabel: "Nom d'utilisateur",
          passwordLabel: 'Mot de passe',
          emailLabel: 'E-mail',
          submitButton: 'Connexion',
          disconnectButton: 'Déconnexion',
          loginSuccess: 'Vous êtes maintenant connecté.',
          loginError: "Nom d'utilisateur ou mot de passe incorrect.",
          logoutSuccess: 'Vous avez été déconnecté.',
          logoutError: 'Une erreur est survenue lors de la déconnexion.',
        },
      },
      de: {
        lux3dviewerPluginAuth: {
          loginButton: 'Anmelden',
          loginTooltip: 'Beim Konto anmelden',
          logoutTooltip: 'Abmelden',
          windowTitle: 'Mein Konto',
          usernameLabel: 'Benutzername',
          passwordLabel: 'Passwort',
          emailLabel: 'E-Mail',
          submitButton: 'Verbinden',
          disconnectButton: 'Trennen',
          loginSuccess: 'Sie sind jetzt angemeldet.',
          loginError: 'Ungültiger Benutzername oder Passwort.',
          logoutSuccess: 'Sie wurden abgemeldet.',
          logoutError: 'Beim Abmelden ist ein Fehler aufgetreten.',
        },
      },
      lb: {
        lux3dviewerPluginAuth: {
          loginButton: 'Umellen',
          loginTooltip: 'Am Kont umellen',
          logoutTooltip: 'Ofmellen',
          windowTitle: 'Mäi Kont',
          usernameLabel: 'Benotzernumm',
          passwordLabel: 'Passwuert',
          emailLabel: 'E-Mail',
          submitButton: 'Verbannen',
          disconnectButton: 'Ofmellen',
          loginSuccess: 'Dir sidd elo umgemellt.',
          loginError: 'Falschen Benotzernumm oder Passwuert.',
          logoutSuccess: 'Dir gouft ofgemellt.',
          logoutError: 'E Feeler ass beim Ofmellen opgetrueden.',
        },
      },
    },
  };
}
