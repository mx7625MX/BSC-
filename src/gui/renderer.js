const { ipcRenderer } = require('electron');

// UI Elements
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('page-title');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

// Dashboard elements
const walletBalance = document.getElementById('wallet-balance');
const monitoredTokens = document.getElementById('monitored-tokens');
const totalTransactions = document.getElementById('total-transactions');
const networkDisplay = document.getElementById('network');
const walletAddressDisplay = document.getElementById('wallet-address');
const lastUpdate = document.getElementById('last-update');
const recentEvents = document.getElementById('recent-events');

// Transaction elements
const transactionsList = document.getElementById('transactions-list');

// Settings elements
const networkSelect = document.getElementById('network-select');
const walletAddressInput = document.getElementById('wallet-address-input');
const privateKeyInput = document.getElementById('private-key-input');
const buyThresholdInput = document.getElementById('buy-threshold-input');
const gasMultiplierInput = document.getElementById('gas-multiplier-input');
const slippageInput = document.getElementById('slippage-input');
const pollIntervalInput = document.getElementById('poll-interval-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// Whitelist elements
const whitelistInput = document.getElementById('whitelist-input');
const addWhitelistBtn = document.getElementById('add-whitelist-btn');
const whitelistItems = document.getElementById('whitelist-items');

// Blacklist elements
const blacklistInput = document.getElementById('blacklist-input');
const addBlacklistBtn = document.getElementById('add-blacklist-btn');
const blacklistItems = document.getElementById('blacklist-items');

// Logs elements
const logsContainer = document.getElementById('logs-container');
const refreshLogsBtn = document.getElementById('refresh-logs-btn');

// State
let currentConfig = null;
let statusUpdateInterval = null;

// Navigation
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetPage = btn.dataset.page;
    
    // Update nav buttons
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update pages
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`${targetPage}-page`).classList.add('active');
    
    // Update page title
    pageTitle.textContent = btn.textContent.trim().substring(2);
    
    // Load page-specific data
    loadPageData(targetPage);
  });
});

// Start/Stop Bot
startBtn.addEventListener('click', async () => {
  try {
    startBtn.disabled = true;
    const result = await ipcRenderer.invoke('start-bot');
    
    if (result.success) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      statusDot.classList.add('active');
      statusText.textContent = 'Running';
      showNotification('Bot started successfully', 'success');
      startStatusUpdates();
    } else {
      startBtn.disabled = false;
      showNotification('Failed to start bot: ' + result.message, 'error');
    }
  } catch (error) {
    startBtn.disabled = false;
    showNotification('Error: ' + error.message, 'error');
  }
});

stopBtn.addEventListener('click', async () => {
  try {
    stopBtn.disabled = true;
    const result = await ipcRenderer.invoke('stop-bot');
    
    if (result.success) {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      statusDot.classList.remove('active');
      statusText.textContent = 'Stopped';
      showNotification('Bot stopped successfully', 'success');
      stopStatusUpdates();
    } else {
      stopBtn.disabled = false;
      showNotification('Failed to stop bot: ' + result.message, 'error');
    }
  } catch (error) {
    stopBtn.disabled = false;
    showNotification('Error: ' + error.message, 'error');
  }
});

// Settings
saveSettingsBtn.addEventListener('click', async () => {
  try {
    const config = {
      network: networkSelect.value,
      walletAddress: walletAddressInput.value,
      privateKey: privateKeyInput.value,
      buyThresholdPercent: parseFloat(buyThresholdInput.value),
      sellPriorityGasMultiplier: parseFloat(gasMultiplierInput.value),
      slippageTolerance: parseFloat(slippageInput.value),
      pollIntervalMs: parseInt(pollIntervalInput.value)
    };

    const result = await ipcRenderer.invoke('update-config', config);
    
    if (result.success) {
      showNotification('Settings saved successfully', 'success');
      await loadConfig();
    } else {
      showNotification('Failed to save settings: ' + result.message, 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
});

// Whitelist
addWhitelistBtn.addEventListener('click', async () => {
  const address = whitelistInput.value.trim();
  if (!address) {
    showNotification('Please enter an address', 'error');
    return;
  }

  try {
    const result = await ipcRenderer.invoke('add-whitelist', address);
    if (result.success) {
      whitelistInput.value = '';
      showNotification('Address added to whitelist', 'success');
      await loadWhitelist();
    } else {
      showNotification('Failed to add address: ' + result.message, 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
});

// Blacklist
addBlacklistBtn.addEventListener('click', async () => {
  const address = blacklistInput.value.trim();
  if (!address) {
    showNotification('Please enter an address', 'error');
    return;
  }

  try {
    const result = await ipcRenderer.invoke('add-blacklist', address);
    if (result.success) {
      blacklistInput.value = '';
      showNotification('Address added to blacklist', 'success');
      await loadBlacklist();
    } else {
      showNotification('Failed to add address: ' + result.message, 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
});

// Logs
refreshLogsBtn.addEventListener('click', () => {
  loadLogs();
});

// Load functions
async function loadConfig() {
  try {
    currentConfig = await ipcRenderer.invoke('get-config');
    
    // Update settings inputs
    networkSelect.value = currentConfig.network || 'mainnet';
    walletAddressInput.value = currentConfig.walletAddress || '';
    privateKeyInput.value = currentConfig.privateKey || '';
    buyThresholdInput.value = currentConfig.buyThresholdPercent || 10;
    gasMultiplierInput.value = currentConfig.sellPriorityGasMultiplier || 1.5;
    slippageInput.value = currentConfig.slippageTolerance || 5;
    pollIntervalInput.value = currentConfig.pollIntervalMs || 5000;
    
    // Update dashboard
    networkDisplay.textContent = currentConfig.network || '-';
    walletAddressDisplay.textContent = currentConfig.walletAddress || 'Not configured';
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

async function loadStatus() {
  try {
    const status = await ipcRenderer.invoke('get-status');
    
    // Update UI
    walletBalance.textContent = `${parseFloat(status.balance).toFixed(4)} BNB`;
    monitoredTokens.textContent = status.monitoredTokens;
    totalTransactions.textContent = status.totalTransactions;
    lastUpdate.textContent = status.lastUpdate ? new Date(status.lastUpdate).toLocaleString() : '-';
    
    // Update status indicator
    if (status.running) {
      statusDot.classList.add('active');
      statusText.textContent = 'Running';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Stopped';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  } catch (error) {
    console.error('Error loading status:', error);
  }
}

async function loadTransactions() {
  try {
    const transactions = await ipcRenderer.invoke('get-transactions');
    
    if (transactions.length === 0) {
      transactionsList.innerHTML = '<p class="no-data">No transactions yet</p>';
      return;
    }

    transactionsList.innerHTML = transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-type ${tx.status}">${tx.type.toUpperCase()} - ${tx.status}</div>
          <div class="transaction-details">
            <div>Token: ${tx.tokenAddress}</div>
            <div>Hash: ${tx.txHash || 'N/A'}</div>
            <div>Time: ${new Date(tx.timestamp).toLocaleString()}</div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

async function loadWhitelist() {
  try {
    const config = await ipcRenderer.invoke('get-config');
    const whitelist = config.whitelist || [];
    
    if (whitelist.length === 0) {
      whitelistItems.innerHTML = '<p class="no-data">No whitelisted addresses</p>';
      return;
    }

    whitelistItems.innerHTML = whitelist.map(address => `
      <div class="list-item">
        <span class="list-item-address">${address}</span>
        <button class="list-item-remove" onclick="removeFromWhitelist('${address}')">Remove</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading whitelist:', error);
  }
}

async function loadBlacklist() {
  try {
    const config = await ipcRenderer.invoke('get-config');
    const blacklist = config.blacklist || [];
    
    if (blacklist.length === 0) {
      blacklistItems.innerHTML = '<p class="no-data">No blacklisted addresses</p>';
      return;
    }

    blacklistItems.innerHTML = blacklist.map(address => `
      <div class="list-item">
        <span class="list-item-address">${address}</span>
        <button class="list-item-remove" onclick="removeFromBlacklist('${address}')">Remove</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading blacklist:', error);
  }
}

async function loadLogs() {
  try {
    const logs = await ipcRenderer.invoke('get-logs', 100);
    
    if (logs.length === 0) {
      logsContainer.innerHTML = '<p class="no-data">No logs available</p>';
      return;
    }

    logsContainer.innerHTML = logs.map(log => `
      <div class="log-entry">
        <span class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
        <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).reverse().join('');
    
    // Scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
  } catch (error) {
    console.error('Error loading logs:', error);
  }
}

function loadPageData(page) {
  switch (page) {
    case 'dashboard':
      loadStatus();
      break;
    case 'transactions':
      loadTransactions();
      break;
    case 'settings':
      loadConfig();
      break;
    case 'whitelist':
      loadWhitelist();
      break;
    case 'blacklist':
      loadBlacklist();
      break;
    case 'logs':
      loadLogs();
      break;
  }
}

// Global functions for HTML onclick
window.removeFromWhitelist = async function(address) {
  try {
    const result = await ipcRenderer.invoke('remove-whitelist', address);
    if (result.success) {
      showNotification('Address removed from whitelist', 'success');
      await loadWhitelist();
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
};

window.removeFromBlacklist = async function(address) {
  try {
    const result = await ipcRenderer.invoke('remove-blacklist', address);
    if (result.success) {
      showNotification('Address removed from blacklist', 'success');
      await loadBlacklist();
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
};

// Status updates
function startStatusUpdates() {
  statusUpdateInterval = setInterval(() => {
    loadStatus();
    loadTransactions();
  }, 5000);
}

function stopStatusUpdates() {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
    statusUpdateInterval = null;
  }
}

// Notifications
function showNotification(message, type = 'info') {
  // Simple notification - could be enhanced with a toast library
  console.log(`[${type}] ${message}`);
  alert(message);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadStatus();
  loadPageData('dashboard');
});
