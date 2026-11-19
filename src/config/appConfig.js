export const APP_CONFIG = {
  COMPANY_NAME_AR: "شركة ليمون ميديكال",
  COMPANY_NAME_EN: "LIMON KIMYA VE ORGANIZASYON TIC. LTD. STI.",
  // رابط Google Apps Script الخاص بك مدمج ومفعّل تلقائياً
  DEFAULT_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyvSzmbKejhsZZagYRe1pW4btmkjZi3jVEVqzTMn8ciHRkWJiJc4ESMLvIGpar1BHb4/exec",
  DEFAULT_ADMIN_PIN: "1234",
  POLL_INTERVAL_MS: 15000,
  STORAGE_KEYS: {
    CATALOG: "lm_solid_catalog_v1",
    CART: "lm_solid_cart_v1",
    ORDERS: "lm_solid_orders_v1",
    SCRIPT_URL: "lm_solid_script_url_v1",
    WHATSAPP: "lm_solid_whatsapp_v1",
    TG_TOKEN: "lm_solid_tg_token_v1",
    TG_CHAT: "lm_solid_tg_chat_v1",
    PIN: "lm_solid_admin_pin_v1",
    CUSTOMER_PROFILE: "lm_solid_customer_v1",
    LANG: "lm_solid_lang_v1"
  }
};

export function getRuntimeConfig() {
  const keys = APP_CONFIG.STORAGE_KEYS;
  return {
    scriptUrl: (localStorage.getItem(keys.SCRIPT_URL) || APP_CONFIG.DEFAULT_SCRIPT_URL).trim(),
    whatsapp: (localStorage.getItem(keys.WHATSAPP) || "").trim(),
    tgToken: (localStorage.getItem(keys.TG_TOKEN) || "").trim(),
    tgChatId: (localStorage.getItem(keys.TG_CHAT) || "").trim(),
    adminPin: (localStorage.getItem(keys.PIN) || APP_CONFIG.DEFAULT_ADMIN_PIN).trim()
  };
}
