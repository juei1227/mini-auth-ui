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
const changePasswordButton = document.getElementById('change-password-btn');
const logoutButton = document.getElementById('logout-btn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

// Change password modal elements
const changePasswordModal = document.getElementById('change-password-modal');
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const newPasswordStrength = document.getElementById('new-password-strength');
const cancelChangePasswordBtn = document.getElementById('cancel-change-password-btn');
const submitChangePasswordBtn = document.getElementById('submit-change-password-btn');

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
  const isRegisterActive = registerForm.classList.contains('active');

  // 在註冊頁面時永遠不顯示操作按鈕，讓註冊頁面保持獨立
  if (hasToken && !isRegisterActive) {
    actionsEl.classList.add('show');
    profileButton.disabled = false;
    dataButton.disabled = false;
    changePasswordButton.disabled = false;
    logoutButton.disabled = false;
  } else {
    actionsEl.classList.remove('show');
    profileButton.disabled = true;
    dataButton.disabled = true;
    changePasswordButton.disabled = true;
    logoutButton.disabled = true;
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'status status-error' : 'status status-ok';
}

function setResult(data) {
  if (data && Object.keys(data).length > 0) {
    resultEl.textContent = JSON.stringify(data, null, 2);
  } else {
    resultEl.textContent = '';
  }
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

  // Clear status and result when switching tabs
  setStatus('');
  setResult({});

  // Update button visibility based on current tab and login state
  updateButtons();
}

async function request(path, options = {}) {
  const token = getToken();
  const { headers = {}, ...rest } = options;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...rest,
    headers: finalHeaders,
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

    setStatus('註冊成功！您可以切換到登入頁面使用新帳號登入');
    setResult(response);
    // 不自動切換，讓用戶自己決定何時登入
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

// Change password functionality
changePasswordButton.addEventListener('click', () => {
  console.log('Change password button clicked');
  console.log('Modal element:', changePasswordModal);
  changePasswordModal.classList.add('show');
  console.log('Modal classes after adding show:', changePasswordModal.className);
  currentPasswordInput.focus();
});

cancelChangePasswordBtn.addEventListener('click', () => {
  console.log('Cancel button clicked');
  changePasswordModal.classList.remove('show');
  console.log('Modal classes after removing show:', changePasswordModal.className);
  changePasswordForm.reset();
  newPasswordStrength.className = 'password-strength';
});

// Close modal when clicking outside
changePasswordModal.addEventListener('click', (event) => {
  if (event.target === changePasswordModal) {
    console.log('Clicked outside modal');
    changePasswordModal.classList.remove('show');
    changePasswordForm.reset();
    newPasswordStrength.className = 'password-strength';
  }
});

changePasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;
  
  // Validate new password strength
  const strength = checkPasswordStrength(newPassword);
  if (strength === 'weak') {
    setStatus('新密碼太弱，請使用更強的密碼', true);
    return;
  }
  
  // Check if passwords match
  if (newPassword !== confirmNewPassword) {
    setStatus('新密碼與確認密碼不相符', true);
    return;
  }
  
  setLoading(submitChangePasswordBtn, true);
  try {
    setStatus('正在修改密碼...');
    const response = await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword
      }),
    });
    
    setStatus('密碼修改成功！');
    setResult(response);
    
    // Close modal and reset form
    changePasswordModal.classList.remove('show');
    changePasswordForm.reset();
    newPasswordStrength.className = 'password-strength';
    
  } catch (error) {
    setStatus(`密碼修改失敗：${error.message}`, true);
    setResult({});
  } finally {
    setLoading(submitChangePasswordBtn, false);
  }
});

// Password strength checker for new password
passwordInput.addEventListener('input', updatePasswordStrength);
newPasswordInput.addEventListener('input', updateNewPasswordStrength);

function updateNewPasswordStrength() {
  const password = newPasswordInput.value;
  const strength = checkPasswordStrength(password);
  
  newPasswordStrength.className = `password-strength ${strength}`;
}

updateButtons();

const existingToken = getToken();
if (existingToken) {
  setStatus('已偵測到現有 JWT，請測試保護 API。');
}
