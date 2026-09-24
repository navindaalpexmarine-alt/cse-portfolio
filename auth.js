(function () {
  let mode = 'login'; // login | signup

  function showErr(msg) {
    const el = document.getElementById('authErr');
    if (!el) return;
    if (!msg) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = msg;
  }

  async function boot() {
    if (!window.CSE_CONFIG.supabaseAnonKey || window.CSE_CONFIG.supabaseAnonKey.includes('PASTE_')) {
      showErr((window.I18N[window.lang] || window.I18N.en).needKey);
      return;
    }
    const sb = window.getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      location.href = 'app.html';
      return;
    }

    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
        const btn = document.getElementById('authBtn');
        const t = window.I18N[window.lang] || window.I18N.en;
        btn.textContent = mode === 'login' ? t.loginBtn : t.signupBtn;
        showErr('');
      });
    });

    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      showErr('');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('authBtn');
      btn.disabled = true;
      try {
        const sb = window.getSupabase();
        if (mode === 'signup') {
          const { data, error } = await sb.auth.signUp({ email, password });
          if (error) throw error;
          if (data.session) {
            location.href = 'app.html';
          } else {
            showErr('Check your email to confirm, or disable email confirm in Supabase Auth settings for testing.');
          }
        } else {
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
          location.href = 'app.html';
        }
      } catch (err) {
        showErr(err.message || String(err));
      } finally {
        btn.disabled = false;
      }
    });
  }

  boot();
})();
