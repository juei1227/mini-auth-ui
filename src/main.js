const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const profileButton = document.getElementById('profile-btn');
const dataButton = document.getElementById('data-btn');
const logoutButton = document.getElementById('logout-btn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

const AUTH_TOKEN_KEY = 'mini-auth-token';

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  updateButtons();
}

function updateButtons() {
  const hasToken = Boolean(getToken());
  profileButton.disabled = !hasToken;
  dataButton.disabled = !hasToken;
  logoutButton.disabled = !hasToken;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'status status-error' : 'status status-ok';
}

function setResult(data) {
  resultEl.textContent = JSON.stringify(data, null, 2);
}

function switchTab(activeTab, activeForm) {
  // Update tabs
  loginTab.classList.remove('active');
  registerTab.classList.remove('active');
  activeTab.classList.add('active');

  // Update forms
  loginForm.classList.remove('active');
  registerForm.classList.remove('active');
  activeForm.classList.add('active');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || body.error || response.statusText);
  }

  return body;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    setStatus('登入中...');
    const response = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    setToken(response.token);
    setStatus('登入成功，已儲存 JWT');
    setResult(response);
  } catch (error) {
    setStatus(`登入失敗：${error.message}`, true);
    setResult({});
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    setStatus('註冊中...');
    const response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    setStatus('註冊成功！請使用新帳號登入');
    setResult(response);
    // 自動切換到登入頁面
    switchTab(loginTab, loginForm);
  } catch (error) {
    setStatus(`註冊失敗：${error.message}`, true);
    setResult({});
  }
});

// Tab switching
loginTab.addEventListener('click', () => {
  switchTab(loginTab, loginForm);
});

registerTab.addEventListener('click', () => {
  switchTab(registerTab, registerForm);
});

profileButton.addEventListener('click', async () => {
  try {
    setStatus('正在取得個人資料...');
    const response = await request('/api/protected/profile');
    setStatus('已取得個人資料');
    setResult(response);
  } catch (error) {
    setStatus(`取資料失敗：${error.message}`, true);
    setResult({});
  }
});

dataButton.addEventListener('click', async () => {
  try {
    setStatus('正在取得受保護資料...');
    const response = await request('/api/protected/data');
    setStatus('已取得受保護資料');
    setResult(response);
  } catch (error) {
    setStatus(`取資料失敗：${error.message}`, true);
    setResult({});
  }
});

logoutButton.addEventListener('click', () => {
  setToken(null);
  setStatus('已登出，JWT 已清除');
  setResult({});
});

updateButtons();

const existingToken = getToken();
if (existingToken) {
  setStatus('已偵測到現有 JWT，請測試保護 API。');
}
