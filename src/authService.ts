export type UserInfo = {
  login: string;
  mail?: string;
  role?: string;
  role_id?: number; //eslint-disable-line
  mymaps_role?: string; //eslint-disable-line
  is_admin?: boolean; //eslint-disable-line
  sn: string;
  typeUtisilisateur?: string;
};

export async function getUserInfo(
  baseUrl: string,
  credentials?: RequestCredentials,
): Promise<UserInfo> {
  const res = await fetch(`${baseUrl}/getuserinfo`, {
    method: 'POST',
    credentials: credentials ?? 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, //eslint-disable-line
    body: new URLSearchParams({}),
  });
  if (!res.ok) throw new Error('not authenticated');
  const data = (await res.json()) as Record<string, unknown>;
  if (!data.login) throw new Error('no login');
  return data as UserInfo;
}

export async function login(
  baseUrl: string,
  username: string,
  password: string,
  credentials?: RequestCredentials,
): Promise<UserInfo> {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    credentials: credentials ?? 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, //eslint-disable-line
    body: new URLSearchParams({ login: username, password }),
  });
  if (!res.ok) throw new Error('login failed');
  const data = (await res.json()) as Record<string, unknown>;
  if (!data.login) throw new Error('invalid credentials');
  return data as UserInfo;
}

export async function logout(
  baseUrl: string,
  credentials?: RequestCredentials,
): Promise<void> {
  const res = await fetch(`${baseUrl}/logout`, {
    credentials: credentials ?? 'same-origin',
  });
  if (!res.ok) throw new Error('logout failed');
}
