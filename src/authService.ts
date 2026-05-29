export type UserInfo = {
  login: string;
  mail?: string;
  role?: string;
  is_admin?: boolean;
};

export async function getUserInfo(baseUrl: string): Promise<UserInfo> {
  const res = await fetch(`${baseUrl}/getuserinfo`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
): Promise<UserInfo> {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ login: username, password }),
  });
  if (!res.ok) throw new Error('login failed');
  const data = (await res.json()) as Record<string, unknown>;
  if (!data.login) throw new Error('invalid credentials');
  return data as UserInfo;
}

export async function logout(baseUrl: string): Promise<void> {
  const res = await fetch(`${baseUrl}/logout`, { credentials: 'include' });
  if (!res.ok) throw new Error('logout failed');
}
