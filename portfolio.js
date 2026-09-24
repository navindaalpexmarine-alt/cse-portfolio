(function () {
  const COMMISSION = 1.12;
  let user = null;
  let holdings = []; // { id?, symbol, balance, avg_price, bes_price, total_cost, traded_price }

  const fmt = n => (n == null || isNaN(n)) ? '0.00' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const toast = msg => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  };
  const calcBes = avg => {
    if (!avg || avg <= 0) return 0;
    const f = 1 - COMMISSION / 100;
    return f <= 0 ? avg : Math.ceil((avg / f) * 100) / 100;
  };

  async function requireAuth() {
    if (!window.CSE_CONFIG.supabaseAnonKey || window.CSE_CONFIG.supabaseAnonKey.includes('PASTE_')) {
      alert('Paste anon key in js/config.js first');
      location.href = 'index.html';
      return null;
    }
    const sb = window.getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      location.href = 'index.html';
      return null;
    }
    user = session.user;
    document.getElementById('userEmail').textContent = user.email || user.id;
    return sb;
  }

  async function loadHoldings(sb) {
    const { data, error } = await sb
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      toast('Load error: ' + error.message);
      holdings = [];
      return;
    }
    holdings = data || [];
  }

  async function saveRow(sb, row) {
    document.getElementById('saveStatus').textContent = 'Saving…';
    const payload = {
      user_id: user.id,
      symbol: (row.symbol || '').toUpperCase().trim(),
      balance: Number(row.balance) || 0,
      avg_price: Number(row.avg_price) || 0,
      bes_price: Number(row.bes_price) || 0,
      total_cost: Number(row.total_cost) || 0,
      traded_price: Number(row.traded_price) || 0,
      updated_at: new Date().toISOString()
    };
    if (row.id) {
      const { error } = await sb.from('portfolios').update(payload).eq('id', row.id).eq('user_id', user.id);
      if (error) throw error;
    } else {
      const { data, error } = await sb.from('portfolios').insert(payload).select().single();
      if (error) throw error;
      row.id = data.id;
    }
    document.getElementById('saveStatus').textContent = 'Saved';
  }

  async function deleteRow(sb, id) {
    const { error } = await sb.from('portfolios').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }

  function compute(h) {
    const mv = (Number(h.balance) || 0) * (Number(h.traded_price) || 0);
    const fee = mv * (COMMISSION / 100);
    const net = mv - fee;
    const cost = Number(h.total_cost) || 0;
    const gl = net - cost;
    return { mv, net, gl };
  }

  function render() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    let totalCost = 0, totalMv = 0, totalGl = 0;

    holdings.forEach((h, idx) => {
      const c = compute(h);
      totalCost += Number(h.total_cost) || 0;
      totalMv += c.mv;
      totalGl += c.gl;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input class="cell name-cell" data-i="${idx}" data-f="symbol" value="${(h.symbol || '').replace(/"/g, '')}"></td>
        <td><input class="cell" data-i="${idx}" data-f="balance" value="${h.balance ?? 0}"></td>
        <td><input class="cell" data-i="${idx}" data-f="avg_price" value="${h.avg_price ?? 0}"></td>
        <td><input class="cell" data-i="${idx}" data-f="bes_price" value="${h.bes_price ?? 0}"></td>
        <td><input class="cell" data-i="${idx}" data-f="total_cost" value="${h.total_cost ?? 0}"></td>
        <td><input class="cell live" data-i="${idx}" data-f="traded_price" value="${h.traded_price ?? 0}"></td>
        <td>${fmt(c.mv)}</td>
        <td style="color:${c.gl >= 0 ? 'var(--pos)' : 'var(--neg)'};font-weight:600">${c.gl >= 0 ? '+' : ''}${fmt(c.gl)}</td>
        <td><button class="del" data-i="${idx}" type="button">&times;</button></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input.cell').forEach(inp => {
      inp.addEventListener('change', async e => {
        const i = +e.target.dataset.i;
        const f = e.target.dataset.f;
        let v = e.target.value;
        if (f === 'symbol') v = String(v).trim().toUpperCase();
        else { v = parseFloat(v); if (isNaN(v)) v = 0; }
        holdings[i][f] = v;
        if ((f === 'balance' || f === 'avg_price') && holdings[i].balance > 0 && holdings[i].avg_price > 0) {
          holdings[i].total_cost = Math.round(holdings[i].balance * holdings[i].avg_price * 100) / 100;
          if (!holdings[i].bes_price) holdings[i].bes_price = calcBes(holdings[i].avg_price);
        }
        try {
          await saveRow(window.getSupabase(), holdings[i]);
          render();
        } catch (err) {
          toast(err.message || 'Save failed');
        }
      });
    });

    tbody.querySelectorAll('.del').forEach(btn => {
      btn.addEventListener('click', async e => {
        const i = +e.target.dataset.i;
        const row = holdings[i];
        if (!confirm('Delete ' + (row.symbol || 'share') + '?')) return;
        try {
          if (row.id) await deleteRow(window.getSupabase(), row.id);
          holdings.splice(i, 1);
          render();
          toast('Deleted');
        } catch (err) {
          toast(err.message || 'Delete failed');
        }
      });
    });

    document.getElementById('summaryCards').innerHTML = `
      <div class="card"><div class="label">Total Cost</div><div class="value">Rs ${fmt(totalCost)}</div></div>
      <div class="card"><div class="label">Market Value</div><div class="value">Rs ${fmt(totalMv)}</div></div>
      <div class="card"><div class="label">Gain / Loss</div><div class="value ${totalGl >= 0 ? 'pos' : 'neg'}">${totalGl >= 0 ? '+' : ''}Rs ${fmt(totalGl)}</div></div>
      <div class="card"><div class="label">Shares</div><div class="value">${holdings.length}</div></div>`;
  }

  async function tryLivePrices() {
    // Optional: if deployed with /api/cse proxy later
    try {
      const res = await fetch('/api/cse/tradeSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: ''
      });
      if (!res.ok) throw new Error('no proxy');
      const data = await res.json();
      const list = data.reqTradeSummery || data || [];
      const map = {};
      list.forEach(item => {
        if (item?.symbol) map[String(item.symbol).toUpperCase()] = item.price ?? item.lastTradedPrice;
      });
      let n = 0;
      for (const h of holdings) {
        const p = map[(h.symbol || '').toUpperCase()];
        if (p != null && !isNaN(p)) {
          h.traded_price = Number(p);
          await saveRow(window.getSupabase(), h);
          n++;
        }
      }
      render();
      toast(n ? `Prices updated · ${n}` : 'No matching symbols');
    } catch {
      toast('Live prices: type Market manually (proxy later)');
    }
  }

  async function boot() {
    const sb = await requireAuth();
    if (!sb) return;

    await loadHoldings(sb);
    render();

    document.getElementById('addBtn').addEventListener('click', async () => {
      const row = {
        symbol: '',
        balance: 0,
        avg_price: 0,
        bes_price: 0,
        total_cost: 0,
        traded_price: 0
      };
      try {
        await saveRow(sb, row);
        holdings.push(row);
        render();
        toast('Share added');
      } catch (err) {
        toast(err.message || 'Add failed');
      }
    });

    document.getElementById('refreshBtn').addEventListener('click', tryLivePrices);

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await sb.auth.signOut();
      location.href = 'index.html';
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
        document.getElementById('view-' + btn.dataset.view).classList.add('on');
      });
    });
  }

  boot();
})();
