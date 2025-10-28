# Security Guidelines for TikTok Trainer

## 🔒 Important Security Notes

### API Keys and Secrets

**⚠️ NEVER commit the following files to Git:**

- `src/config/localEnv.js` - Contains actual API keys
- `.env` files - Environment configuration
- Any file with real API keys or secrets
- `backend/.env` - Backend configuration

### ✅ What's Safe to Commit

- `src/config/localEnv.example.js` - Template file with placeholders
- `.env.example` files - Template files
- Documentation files
- Code without hardcoded secrets

---

## 🛡️ Setting Up Environment Variables

### For Frontend (React Native)

1. **Copy the template:**
   ```bash
   cp src/config/localEnv.example.js src/config/localEnv.js
   ```

2. **Add your API keys:**
   ```javascript
   const LOCAL_ENV = {
     GOOGLE_MAPS_API_KEY: 'your-actual-key-here',
     // ... other keys
   };
   ```

3. **Verify it's ignored:**
   ```bash
   git status
   # localEnv.js should NOT appear in the list
   ```

### For Backend (Python)

1. **Copy the template:**
   ```bash
   cp backend/env.example backend/.env
   ```

2. **Add your configuration:**
   ```bash
   DATABASE_URL=your-database-url
   SECRET_KEY=your-secret-key
   # ... other variables
   ```

---

## 🚨 If You Accidentally Commit Secrets

If you accidentally commit API keys or secrets:

### 1. **Immediately Revoke the Keys**
   - Go to the API provider's console
   - Revoke/regenerate the exposed keys
   - Never reuse exposed keys

### 2. **Remove from Git History**
   ```bash
   # For the last commit
   git reset --soft HEAD~1
   git reset HEAD src/config/localEnv.js
   git commit -m "Your commit message"
   
   # For older commits, use git filter-branch or BFG Repo-Cleaner
   # See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```

### 3. **Update .gitignore**
   - Ensure the file is in `.gitignore`
   - Commit the updated `.gitignore`

### 4. **Force Push (if already pushed)**
   ```bash
   git push --force
   ```
   ⚠️ **Warning**: Only do this if you're the only one working on the repo!

---

## 📋 Pre-Commit Checklist

Before committing, verify:

- [ ] No `.env` files are staged
- [ ] No `localEnv.js` is staged  
- [ ] No API keys in code
- [ ] No hardcoded passwords
- [ ] No database credentials
- [ ] No private keys or certificates

### Quick Check Command
```bash
git diff --cached | grep -i "api[_-]key\|secret\|password\|token"
```
If this returns anything, review carefully!

---

## 🔍 Files That Should NEVER Be Committed

### Environment & Configuration
```
.env
.env.local
.env.*.local
src/config/localEnv.js
backend/.env
**/apiKeys.js
**/secrets.js
**/*secret*.js
**/*key*.json
```

### Credentials & Keys
```
*.pem
*.key
*.p12
*.p8
*.jks
*.keystore
*.mobileprovision
```

### Backup & Personal Files
```
*.backup
*.old
*.tmp
NOTES.md
TODO.local.md
```

---

## ✅ Best Practices

### 1. Use Environment Variables
```javascript
// ❌ BAD: Hardcoded
const apiKey = 'AIzaSyCCSOx25vrb5z0tbedCB3_JRzzbVW6Uwgw';

// ✅ GOOD: From environment
import LOCAL_ENV from './config/localEnv';
const apiKey = LOCAL_ENV.GOOGLE_MAPS_API_KEY;
```

### 2. Use Template Files
- Commit `localEnv.example.js` with placeholders
- Never commit `localEnv.js` with real values
- Document required variables

### 3. Validate in Code
```javascript
// Check if API keys are configured
if (!LOCAL_ENV.GOOGLE_MAPS_API_KEY || 
    LOCAL_ENV.GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
  console.warn('⚠️ Google Maps API key not configured');
}
```

### 4. Different Keys for Different Environments
- Development keys for local testing
- Production keys for live app
- Never use production keys in development

### 5. Regular Key Rotation
- Rotate API keys periodically
- Use different keys per project
- Monitor API usage for anomalies

---

## 🔐 Secure API Key Management

### For Local Development
1. Use `localEnv.js` (gitignored)
2. Keep keys in password manager
3. Don't share keys via chat/email

### For Team Collaboration
1. Use a secrets manager (1Password, LastPass)
2. Share keys securely
3. Document which keys are needed

### For Production
1. Use environment variables in hosting platform
2. Use secrets management service (AWS Secrets Manager, etc.)
3. Enable API key restrictions (IP/domain whitelist)
4. Monitor API usage

---

## 🚫 What NOT to Do

### ❌ Don't:
- Hardcode API keys in source code
- Commit `.env` files to Git
- Share API keys in chat or email
- Use the same key for all environments
- Post API keys in GitHub issues
- Include keys in screenshots
- Check in backup files with keys

### ✅ Do:
- Use environment variables
- Keep keys in `.gitignore`
- Use template files for reference
- Rotate keys regularly
- Use different keys per environment
- Enable API restrictions
- Monitor usage

---

## 📱 Mobile App Specific Considerations

### iOS
- Use Xcode secrets management
- Never hardcode keys in Info.plist
- Use Keychain for sensitive data

### Android
- Use BuildConfig for API keys
- Never hardcode in AndroidManifest.xml
- Use Android Keystore for sensitive data

### React Native / Expo
- Use `app.config.js` with environment variables
- Don't store secrets in `app.json`
- Use Expo SecureStore for runtime secrets

---

## 🛠️ Tools to Help

### Pre-commit Hooks
```bash
# Install git-secrets
brew install git-secrets

# Initialize
git secrets --install
git secrets --register-aws

# Scan for secrets
git secrets --scan
```

### Secret Scanning Tools
- [git-secrets](https://github.com/awslabs/git-secrets)
- [truffleHog](https://github.com/trufflesecurity/trufflehog)
- [detect-secrets](https://github.com/Yelp/detect-secrets)

### GitHub Secret Scanning
GitHub automatically scans for known secret patterns and alerts you.

---

## 📞 Questions?

If you're unsure whether something should be committed:
1. Check if it's in `.gitignore`
2. Ask: "Would I want this public?"
3. When in doubt, don't commit it!

---

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [12 Factor App: Config](https://12factor.net/config)

---

**Remember: It's easier to prevent secrets from being committed than to clean them up afterwards!**

Stay secure! 🔒

