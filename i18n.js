window.I18N = {
  si: {
    tagline: 'CSE shares track කරන්න · Live prices · Dividends',
    login: 'ඇතුල් වන්න',
    signup: 'ලියාපදිංචි වන්න',
    email: 'Email',
    password: 'Password',
    loginBtn: 'ඇතුල් වන්න',
    signupBtn: 'Account හදන්න',
    disclaimer: 'මෙය investment advice නොවේ. Data delay විය හැක. ඔබේ research කරන්න.',
    logout: 'ඉවත් වන්න',
    portfolio: 'Portfolio',
    dividends: 'Dividends',
    news: 'News',
    addShare: '+ Share',
    updatePrices: '↻ Prices',
    save: 'Saved',
    needKey: 'config.js එකේ anon key එක paste කරන්න'
  },
  en: {
    tagline: 'Track CSE shares · Live prices · Dividends',
    login: 'Sign in',
    signup: 'Sign up',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Sign in',
    signupBtn: 'Create account',
    disclaimer: 'Not investment advice. Data may be delayed. Do your own research.',
    logout: 'Sign out',
    portfolio: 'Portfolio',
    dividends: 'Dividends',
    news: 'News',
    addShare: '+ Share',
    updatePrices: '↻ Prices',
    save: 'Saved',
    needKey: 'Paste anon key in js/config.js'
  }
};

window.lang = localStorage.getItem('cse_lang') || 'en';

window.setLang = function (l) {
  window.lang = l;
  localStorage.setItem('cse_lang', l);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    const t = (window.I18N[l] || window.I18N.en)[k];
    if (t) el.textContent = t;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => window.setLang(b.dataset.lang));
  });
  window.setLang(window.lang);
});
