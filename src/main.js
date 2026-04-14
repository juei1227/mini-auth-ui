const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const registerSubmitBtn = document.getElementById('register-submit-btn');
const passwordInput = document.getElementById('register-password');
const passwordStrength = document.getElementById('password-strength');
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
  const actionsEl = document.querySelector('.actions');

  if (hasToken) {
    actionsEl.classList.add('show');
    profileButton.disabled = false;
    dataButton.disabled = false;
    logoutButton.disabled = false;
  } else {
    actionsEl.classList.remove('show');
    profileButton.disabled = true;
    dataButton.disabled = true;
    logoutButton.disabled = true;
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'status status-error' : 'status status-ok';
}

function setResult(data) {
  resultEl.textContent = JSON.stringify(data, null, 2);
}

function setLoading(button, isLoading) {
  const btnText = button.querySelector('.btn-text');
  const btnLoading = button.querySelector('.btn-loading');

  if (isLoading) {
    button.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
  } else {
    button.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

function checkPasswordStrength(password) {
  let score = 0;

  // 長度檢查
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 字元類型檢查
  if (/[a-z]/.test(password)) score += 1; // 小寫字母
  if (/[A-Z]/.test(password)) score += 1; // 大寫字母
  if (/[0-9]/.test(password)) score += 1; // 數字
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // 特殊字元

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

function updatePasswordStrength() {
  const password = passwordInput.value;
  const strength = checkPasswordStrength(password);

  passwordStrength.className = `password-strength ${strength}`;
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

  setLoading(loginSubmitBtn, true);
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
  } finally {
    setLoading(loginSubmitBtn, false);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;

  // 檢查密碼強度
  const strength = checkPasswordStrength(password);
  if (strength === 'weak') {
    setStatus('密碼太弱，請使用更強的密碼', true);
    return;
  }

  setLoading(registerSubmitBtn, true);
  try {
    setStatus('註冊中...');
    const response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    setStatus('註冊成功！請使用新帳號登入');
    setResult(response);
    // 自動切換到登入頁面
    switchTab(loginTab, loginForm);
  } catch (error) {
    setStatus(`註冊失敗：${error.message}`, true);
    setResult({});
  } finally {
    setLoading(registerSubmitBtn, false);
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

// Password strength checker
passwordInput.addEventListener('input', updatePasswordStrength);

updateButtons();

const existingToken = getToken();
if (existingToken) {
  setStatus('已偵測到現有 JWT，請測試保護 API。');
}
