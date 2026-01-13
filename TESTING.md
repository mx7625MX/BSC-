# Testing Guide

## Quick Start Testing

### 1. Installation Test
```bash
# Run installation script
./install.sh  # Linux/Mac
# or
install.bat   # Windows

# Verify installation
npm test
```

### 2. Configuration Validation
```bash
# After setting up .env file
node validate-config.js
```

This will check:
- Environment variables are set correctly
- Wallet address format is valid
- Network connection works
- Wallet has sufficient balance

### 3. Module Tests
```bash
npm test
```

Tests basic module loading and dependencies.

## BSC Testnet Testing

### Setup Testnet Environment

1. **Get Testnet BNB:**
   - Visit: https://testnet.binance.org/faucet-smart
   - Enter your wallet address
   - Receive test BNB

2. **Configure for Testnet:**
   ```env
   NETWORK=testnet
   BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
   ```

3. **Start Bot:**
   ```bash
   npm run dev
   ```

### Test Scenarios

#### Scenario 1: Wallet Monitoring
**Objective:** Verify the bot detects wallet transactions

**Steps:**
1. Start the bot with your wallet configured
2. Create a test transaction from your wallet
3. Verify the bot logs the transaction
4. Check Dashboard shows updated stats

**Expected Results:**
- Transaction appears in logs
- Dashboard shows increased transaction count
- No errors in console

#### Scenario 2: Token Detection
**Objective:** Verify token creation detection

**Steps:**
1. Deploy a simple ERC20 token from your wallet (or interact with existing token)
2. Observe bot logs for token detection event
3. Check Dashboard for monitored tokens count

**Expected Results:**
- Bot logs "New token detected"
- Token address is stored
- Liquidity monitoring starts for the token

#### Scenario 3: Liquidity Pool Monitoring
**Objective:** Test large buy detection

**Setup:**
1. Create or find a low-liquidity test pool
2. Configure buy threshold (e.g., 5% for easier testing)

**Steps:**
1. Make a buy transaction that exceeds threshold
2. Observe bot response
3. Check if defensive sell triggered (if enabled)

**Expected Results:**
- Bot logs "Large buy detected"
- Percentage calculation is correct
- Defensive action taken if configured

#### Scenario 4: Whitelist Functionality
**Objective:** Verify whitelist prevents defensive action

**Steps:**
1. Add token address to whitelist via GUI
2. Trigger a large buy on that token
3. Verify no defensive sell occurs

**Expected Results:**
- Token on whitelist
- Large buy detected
- No sell executed (logged as "Token is whitelisted")

#### Scenario 5: Blacklist Functionality
**Objective:** Verify blacklist triggers immediate action

**Steps:**
1. Add suspicious address to blacklist
2. Simulate buy from that address
3. Verify immediate defensive action

**Expected Results:**
- Address on blacklist
- Buy detected from blacklisted address
- Immediate defensive sell executed

#### Scenario 6: GUI Functionality
**Objective:** Test all GUI features

**Dashboard Tab:**
- [ ] Status indicator updates correctly
- [ ] Balance displays and updates
- [ ] Monitored tokens count is accurate
- [ ] Transaction count updates

**Settings Tab:**
- [ ] Can change network
- [ ] Can update trading parameters
- [ ] Save button works
- [ ] Changes persist after restart

**Whitelist/Blacklist Tabs:**
- [ ] Can add addresses
- [ ] Can remove addresses
- [ ] Lists persist after restart

**Logs Tab:**
- [ ] Logs display correctly
- [ ] Refresh button works
- [ ] Log levels show properly

**Transactions Tab:**
- [ ] Transactions display
- [ ] Details are accurate
- [ ] Updates in real-time

## Manual Testing Checklist

### Basic Functionality
- [ ] Bot starts without errors
- [ ] Bot connects to BSC network
- [ ] Bot stops cleanly
- [ ] GUI loads and displays correctly

### Monitoring
- [ ] Wallet transactions detected
- [ ] Token creation detected
- [ ] Liquidity addition detected
- [ ] Swap events detected

### Trading Logic
- [ ] Large buy detection works
- [ ] Threshold calculation correct
- [ ] Priority gas pricing works
- [ ] Slippage protection applied

### Configuration
- [ ] Settings save correctly
- [ ] Network switching works
- [ ] Parameters update properly
- [ ] Private key stored securely

### Security
- [ ] Private key not logged
- [ ] Sensitive data not exposed
- [ ] Error messages don't leak info
- [ ] .env file in .gitignore

## Performance Testing

### Resource Usage
Monitor during operation:
- CPU usage (should be < 5% idle, < 30% active)
- Memory usage (should be < 200MB)
- Network usage (periodic polls only)

### Response Time
Test priority transaction speed:
- Time from detection to sell execution
- Should be < 5 seconds for priority tx

## Load Testing

Test with multiple tokens:
1. Add 10+ tokens to monitoring
2. Verify performance remains acceptable
3. Check memory doesn't leak
4. Confirm all tokens monitored correctly

## Error Handling

Test error scenarios:
- [ ] Invalid wallet address
- [ ] Invalid private key
- [ ] Network disconnection
- [ ] Insufficient balance
- [ ] Gas price too low
- [ ] Transaction failure

For each, verify:
- Error logged appropriately
- User notified in GUI
- Bot doesn't crash
- Can recover gracefully

## Automated Testing (Future)

Consider adding:
- Unit tests for core modules
- Integration tests for Web3 interactions
- End-to-end GUI tests with Spectron
- Continuous integration with GitHub Actions

## Test Data

### Sample Test Token
For testnet testing, you can use:
- Deploy a simple ERC20 token
- Create a small liquidity pool
- Test with small amounts

### Sample Addresses
Use testnet addresses that you control for:
- Whitelist testing
- Blacklist testing
- Transaction monitoring

## Troubleshooting Tests

### Bot Won't Start
1. Check Node.js version: `node -v`
2. Run: `npm test`
3. Run: `node validate-config.js`
4. Check logs in `logs/` folder

### Tests Failing
1. Ensure dependencies installed: `npm install`
2. Verify .env configured correctly
3. Check network connectivity
4. Try testnet first

### GUI Not Loading
1. Check console for errors (Ctrl+Shift+I)
2. Verify all HTML/CSS files present
3. Try `npm run dev` for debugging

## Reporting Issues

When reporting issues, include:
1. Node.js version
2. Operating system
3. Network (mainnet/testnet)
4. Error messages from logs
5. Steps to reproduce
6. Expected vs actual behavior

## Test Report Template

```
Date: [Date]
Tester: [Name]
Version: [Version]
Network: [Mainnet/Testnet]

Results:
- Installation: [Pass/Fail]
- Configuration: [Pass/Fail]
- Wallet Monitoring: [Pass/Fail]
- Liquidity Monitoring: [Pass/Fail]
- Trading Logic: [Pass/Fail]
- GUI: [Pass/Fail]

Issues Found:
1. [Description]
2. [Description]

Notes:
[Additional observations]
```
