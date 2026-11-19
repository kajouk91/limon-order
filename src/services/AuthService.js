import { APP_CONFIG, getRuntimeConfig } from "../config/appConfig.js";

export class AuthService {
  constructor() {
    this.authenticated = false;
  }

  verifyPin(enteredPin) {
    const currentPin = getRuntimeConfig().adminPin;
    if (String(enteredPin).trim() === currentPin) {
      this.authenticated = true;
      return true;
    }
    return false;
  }

  isAuthenticated() {
    return this.authenticated;
  }

  updatePin(newPin) {
    const clean = String(newPin || "").trim();
    if (clean.length < 4) {
      throw new Error("PIN_TOO_SHORT");
    }
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PIN, clean);
    return true;
  }
}
