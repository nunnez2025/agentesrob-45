// src/core/apiManager.js
const fs = require('fs');
const path = require('path');

const keyStorageFile = path.resolve(__dirname, '../../config/api_keys.json');

const defaultFallbackOrder = [
  'openai',
  'anthropic',
  'google',
  'groq',
  'ollama'
];

const apiStatus = {
  openai: true,
  anthropic: true,
  google: true,
  groq: true,
  ollama: true
};

function loadKeys() {
  if (!fs.existsSync(keyStorageFile)) return {};
  const data = fs.readFileSync(keyStorageFile, 'utf-8');
  return JSON.parse(data);
}

function saveKeys(keys) {
  fs.writeFileSync(keyStorageFile, JSON.stringify(keys, null, 2));
}

const apiManager = {
  keys: loadKeys(),

  addKey(api, key) {
    if (!this.keys[api]) this.keys[api] = [];
    if (!this.keys[api].includes(key)) {
      this.keys[api].push(key);
      saveKeys(this.keys);
      console.log(`✅ Chave adicionada à fila de ${api}`);
    }
  },

  removeKey(api, key) {
    if (this.keys[api]) {
      this.keys[api] = this.keys[api].filter(k => k !== key);
      saveKeys(this.keys);
      console.log(`❌ Chave inválida removida de ${api}`);
    }
  },

  getNextAvailableKey() {
    for (const api of defaultFallbackOrder) {
      const keys = this.keys[api] || [];
      if (apiStatus[api] && keys.length > 0) {
        return { api, key: keys[0] };
      }
    }
    return null;
  },

  markApiAsFailed(api) {
    apiStatus[api] = false;
    console.warn(`⚠️ API ${api} marcada como inativa temporariamente`);
  },

  validateKey(api, key, validatorFn) {
    return validatorFn(key)
      .then(valid => {
        if (!valid) {
          this.removeKey(api, key);
        }
        return valid;
      })
      .catch(() => {
        this.removeKey(api, key);
        return false;
      });
  },

  listStatus() {
    console.table(apiStatus);
  },

  listKeys() {
    console.log(this.keys);
  }
};

module.exports = apiManager;
