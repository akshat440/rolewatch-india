// Use sessionStorage (tab-specific) instead of localStorage (shared across tabs)

export const setUserSession = (token, user, permissions) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('permissions', JSON.stringify(permissions));
  
  // Also set a unique tab ID
  const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('tabId', tabId);
  
  console.log('Session set for tab:', tabId);
};

export const getUserSession = () => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');
  const permissions = sessionStorage.getItem('permissions');
  const tabId = sessionStorage.getItem('tabId');
  
  if (!token || !user || !permissions) {
    return null;
  }
  
  return {
    token,
    user: JSON.parse(user),
    permissions: JSON.parse(permissions),
    tabId
  };
};

export const updatePermissions = (newPermissions) => {
  const current = getUserSession();
  if (current) {
    sessionStorage.setItem('permissions', JSON.stringify(newPermissions));
  }
};

export const clearSession = () => {
  sessionStorage.clear();
};

export const getTabId = () => {
  return sessionStorage.getItem('tabId');
};
