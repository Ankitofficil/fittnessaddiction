import { useState, useEffect, useCallback } from "react";
import { useMenu } from "../hooks/useMenu";

/* ── Auth ── */
const ADMIN_USER = "admin";
const ADMIN_PASS = "addiction";
const AUTH_KEY   = "fa_admin_auth";

/* ── Orders ── */
const STATUSES = ["all", "pending", "preparing", "ready", "done"];
const STATUS_META = {
  pending:   { label: "PENDING",   color: "var(--yellow)", next: "preparing" },
  preparing: { label: "PREPARING", color: "var(--cyan)",   next: "ready"     },
  ready:     { label: "READY",     color: "#00ff88",       next: "done"      },
  done:      { label: "DONE",      color: "var(--muted)",  next: null        },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ── Analytics helpers ── */
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getChartData(orders, range) {
  const now = new Date();
  let groups = [];
  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      groups.push({ label: d.toLocaleDateString("en", { weekday: "short" }), dateStr: d.toISOString().slice(0, 10), items: [] });
    }
    orders.forEach((o) => { const g = groups.find((g) => g.dateStr === new Date(o.timestamp).toISOString().slice(0, 10)); if (g) g.items.push(o); });
  } else if (range === "month") {
    for (let i = 3; i >= 0; i--) groups.push({ label: `WK ${4 - i}`, items: [] });
    orders.forEach((o) => { const d = Math.floor((now - new Date(o.timestamp)) / 86400000); if (d <= 28) groups[3 - Math.min(3, Math.floor(d / 7))].items.push(o); });
  } else {
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); groups.push({ label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), items: [] }); }
    orders.forEach((o) => { const d = new Date(o.timestamp); const g = groups.find((g) => g.year === d.getFullYear() && g.month === d.getMonth()); if (g) g.items.push(o); });
  }
  return groups.map((g) => ({ label: g.label, revenue: g.items.reduce((s, o) => s + o.total, 0), count: g.items.length }));
}

function getTopItems(orders, range) {
  const now = new Date(); const cutoff = new Date(now);
  if (range === "week") cutoff.setDate(cutoff.getDate() - 7);
  else if (range === "month") cutoff.setDate(cutoff.getDate() - 30);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  const map = {};
  orders.filter((o) => new Date(o.timestamp) >= cutoff).forEach((o) => o.items.forEach((item) => {
    if (!map[item.name]) map[item.name] = { name: item.name, emoji: item.emoji, qty: 0, revenue: 0 };
    map[item.name].qty += item.qty; map[item.name].revenue += item.price * item.qty;
  }));
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

function getSummary(orders, range) {
  const now = new Date(); const cutoff = new Date(now);
  if (range === "week") cutoff.setDate(cutoff.getDate() - 7);
  else if (range === "month") cutoff.setDate(cutoff.getDate() - 30);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  const f = orders.filter((o) => new Date(o.timestamp) >= cutoff);
  const revenue = f.reduce((s, o) => s + o.total, 0);
  return { orders: f.length, revenue, avg: f.length ? revenue / f.length : 0, dineIn: f.filter((o) => o.orderType === "dine-in").length, takeout: f.filter((o) => o.orderType === "takeout").length };
}

/* ── Bar Chart ── */
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <span className="bar-revenue">{d.revenue > 0 ? `₹${d.revenue.toFixed(0)}` : ""}</span>
          <div className="bar-wrap">
            <div className="bar" style={{ height: `${(d.revenue / max) * 100}%` }} title={`${d.count} order${d.count !== 1 ? "s" : ""} · ₹${d.revenue.toFixed(2)}`} />
          </div>
          <span className="bar-label">{d.label}</span>
          {d.count > 0 && <span className="bar-count">{d.count}</span>}
        </div>
      ))}
    </div>
  );
}

/* ── Item Form Modal ── */
const BLANK_FORM = { name: "", category: "", price: "", protein: "", calories: "", description: "", emoji: "🍽", tag: "", image: "" };

function ItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item ? { name: item.name, category: item.category, price: item.price, protein: item.protein, calories: item.calories, description: item.description, emoji: item.emoji || "🍽", tag: item.tag || "", image: item.image || "" } : BLANK_FORM);
  const [imgError, setImgError] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); setImgError(false); }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price) || 0, protein: parseInt(form.protein) || 0, calories: parseInt(form.calories) || 0 });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{item ? "EDIT ITEM" : "ADD NEW ITEM"}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Image preview */}
          <div className="modal-img-preview">
            {form.image && !imgError ? (
              <img src={form.image} alt="preview" onError={() => setImgError(true)} />
            ) : (
              <span className="modal-img-placeholder">{form.emoji || "🍽"}</span>
            )}
          </div>

          <label className="cp-label">
            ITEM NAME *
            <input className="cp-input" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Grilled Chicken Salad" />
          </label>

          <div className="modal-row-2">
            <label className="cp-label">
              CATEGORY *
              <input className="cp-input" value={form.category} onChange={(e) => set("category", e.target.value)} required list="cat-list" placeholder="e.g. Salads" />
              <datalist id="cat-list">
                {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            <label className="cp-label">
              EMOJI
              <input className="cp-input" value={form.emoji} onChange={(e) => set("emoji", e.target.value)} placeholder="🍽" maxLength={4} />
            </label>
          </div>

          <div className="modal-row-3">
            <label className="cp-label">
              PRICE (₹) *
              <input className="cp-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required placeholder="9.99" />
            </label>
            <label className="cp-label">
              PROTEIN (g)
              <input className="cp-input" type="number" min="0" value={form.protein} onChange={(e) => set("protein", e.target.value)} placeholder="30" />
            </label>
            <label className="cp-label">
              CALORIES
              <input className="cp-input" type="number" min="0" value={form.calories} onChange={(e) => set("calories", e.target.value)} placeholder="400" />
            </label>
          </div>

          <label className="cp-label">
            DESCRIPTION
            <textarea className="cp-input cp-textarea" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe this item..." rows={3} />
          </label>

          <div className="modal-row-2">
            <label className="cp-label">
              TAG (optional)
              <input className="cp-input" value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="BESTSELLER" />
            </label>
            <label className="cp-label">
              IMAGE URL
              <input className="cp-input" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="cp-btn ghost" onClick={onClose}>CANCEL</button>
            <button type="submit" className="cp-btn">{item ? "SAVE CHANGES ▶" : "ADD ITEM ▶"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Items Management View ── */
function ItemsView() {
  const { items, categories, addItem, updateItem, removeItem, resetToDefault } = useMenu();
  const [modal, setModal] = useState(null); // null | "add" | item object
  const [confirmReset, setConfirmReset] = useState(false);
  const [search, setSearch] = useState("");
  const [imgErrors, setImgErrors] = useState({});

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  function handleSave(data) {
    if (modal === "add") addItem(data);
    else updateItem(modal.id, data);
    setModal(null);
  }

  function handleDelete(id) {
    if (window.confirm("Remove this item from the menu?")) removeItem(id);
  }

  function handleReset() {
    if (confirmReset) { resetToDefault(); setConfirmReset(false); }
    else setConfirmReset(true);
  }

  return (
    <div className="items-page">
      <div className="items-toolbar">
        <div className="items-toolbar-left">
          <span className="items-count neon-cyan">{items.length} ITEMS</span>
          <input className="cp-search" placeholder="// SEARCH ITEMS..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
        </div>
        <div className="items-toolbar-right">
          <button className={`cp-btn ghost ${confirmReset ? "reset-confirm" : ""}`} onClick={handleReset} onBlur={() => setConfirmReset(false)}>
            {confirmReset ? "CONFIRM RESET?" : "RESET TO DEFAULT"}
          </button>
          <button className="cp-btn" onClick={() => setModal("add")}>+ ADD ITEM</button>
        </div>
      </div>

      <div className="items-list">
        {filtered.length === 0 && (
          <div className="admin-empty" style={{ gridColumn: "1/-1" }}>
            <p className="neon-cyan">// NO ITEMS FOUND</p>
          </div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="item-row">
            <div className="item-row-thumb">
              {item.image && !imgErrors[item.id] ? (
                <img src={item.image} alt={item.name} onError={() => setImgErrors((e) => ({ ...e, [item.id]: true }))} />
              ) : (
                <span>{item.emoji}</span>
              )}
            </div>
            <div className="item-row-info">
              <span className="item-row-name">{item.name}</span>
              <span className="item-row-cat">{item.category}</span>
            </div>
            <div className="item-row-macros">
              <span className="neon-cyan">{item.protein}g</span>
              <span className="item-row-kcal">{item.calories} kcal</span>
            </div>
            <span className="item-row-price neon-yellow">₹{item.price.toFixed(2)}</span>
            {item.tag && <span className="item-row-tag">{item.tag}</span>}
            {!item.tag && <span />}
            <div className="item-row-actions">
              <button className="cp-btn ghost" style={{ fontSize: "0.6rem", padding: "0.3rem 0.7rem" }} onClick={() => setModal(item)}>EDIT</button>
              <button className="item-delete-btn" onClick={() => handleDelete(item.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ItemModal
          item={modal === "add" ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ── Analytics View ── */
function AnalyticsView({ orders }) {
  const [range, setRange] = useState("week");
  const chartData = getChartData(orders, range);
  const topItems  = getTopItems(orders, range);
  const summary   = getSummary(orders, range);
  const rangeLabel = { week: "LAST 7 DAYS", month: "LAST 4 WEEKS", year: "LAST 12 MONTHS" }[range];

  return (
    <div className="analytics-page">
      <div className="analytics-toolbar">
        <span className="analytics-title">SALES ANALYTICS</span>
        <div className="analytics-range">
          {["week","month","year"].map((r) => (
            <button key={r} className={`filter-btn ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="analytics-summary">
        {[
          { label: "ORDERS",   value: summary.orders,                  color: "var(--white)"  },
          { label: "REVENUE",  value: `₹${summary.revenue.toFixed(2)}`, color: "var(--pink)"   },
          { label: "AVG ORDER",value: `₹${summary.avg.toFixed(2)}`,    color: "var(--cyan)"   },
          { label: "DINE IN",  value: summary.dineIn,                  color: "var(--cyan)"   },
          { label: "TAKE OUT", value: summary.takeout,                 color: "var(--yellow)" },
        ].map((s) => (
          <div key={s.label} className="analytics-stat">
            <span className="analytics-stat-val" style={{ color: s.color, textShadow: `0 0 12px ${s.color}` }}>{s.value}</span>
            <span className="admin-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="analytics-chart-section">
        <div className="analytics-section-header">
          <span className="analytics-section-title">REVENUE — <span className="neon-cyan">{rangeLabel}</span></span>
        </div>
        {summary.orders === 0 ? (
          <div className="analytics-no-data"><p className="neon-cyan">// NO DATA FOR THIS PERIOD</p><p>Place some orders to see sales analytics.</p></div>
        ) : <BarChart data={chartData} />}
      </div>

      <div className="analytics-top-section">
        <div className="analytics-section-header">
          <span className="analytics-section-title">TOP SELLERS — <span className="neon-pink">{rangeLabel}</span></span>
        </div>
        {topItems.length === 0 ? (
          <div className="analytics-no-data"><p className="neon-cyan">// NO DATA FOR THIS PERIOD</p></div>
        ) : (
          <div className="top-items-list">
            {topItems.map((item, i) => {
              const maxRev = topItems[0].revenue;
              return (
                <div key={item.name} className="top-item-row">
                  <span className="top-item-rank neon-yellow">#{i + 1}</span>
                  <span className="top-item-emoji">{item.emoji}</span>
                  <span className="top-item-name">{item.name}</span>
                  <div className="top-item-bar-wrap"><div className="top-item-bar" style={{ width: `${(item.revenue / maxRev) * 100}%` }} /></div>
                  <span className="top-item-qty neon-cyan">{item.qty}×</span>
                  <span className="top-item-rev neon-yellow">₹{item.revenue.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onLogin();
    } else {
      setError("ACCESS DENIED — INVALID CREDENTIALS");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-bg" />
      <form className={`login-card ${shake ? "shake" : ""}`} onSubmit={handleSubmit} autoComplete="off">
        <div className="login-logo">
          <span className="neon-pink">FITNESS ADDICTION</span>
          <span className="login-sub">STAFF ACCESS PORTAL</span>
        </div>
        <div className="login-icon">⚙</div>
        <label className="cp-label">
          USERNAME
          <input className="cp-input" value={user} onChange={(e) => { setUser(e.target.value); setError(""); }} placeholder="enter username" autoFocus />
        </label>
        <label className="cp-label">
          PASSWORD
          <input className="cp-input" type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(""); }} placeholder="enter password" />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="cp-btn full-width large" style={{ marginTop: "0.5rem" }}>AUTHENTICATE ▶</button>
        <a href="/" className="login-back">← BACK TO SITE</a>
      </form>
    </div>
  );
}

/* ── Main Admin ── */
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [view, setView]         = useState("orders");
  const [orders, setOrders]     = useState([]);
  const [filter, setFilter]     = useState("all");

  const load = useCallback(() => { setOrders(JSON.parse(localStorage.getItem("fa_orders") || "[]")); }, []);

  useEffect(() => {
    if (!loggedIn) return;
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load, loggedIn]);

  function advanceStatus(id) {
    const updated = orders.map((o) => o.id === id && STATUS_META[o.status].next ? { ...o, status: STATUS_META[o.status].next } : o);
    localStorage.setItem("fa_orders", JSON.stringify(updated));
    setOrders(updated);
  }

  function clearDone() {
    const updated = orders.filter((o) => o.status !== "done");
    localStorage.setItem("fa_orders", JSON.stringify(updated));
    setOrders(updated);
  }

  function logout() { sessionStorage.removeItem(AUTH_KEY); setLoggedIn(false); }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts  = {
    all: orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready:     orders.filter((o) => o.status === "ready").length,
    done:      orders.filter((o) => o.status === "done").length,
  };
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = counts.pending + counts.preparing + counts.ready;

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-scan" />
        <div className="admin-logo">
          <span className="neon-pink">FITNESS ADDICTION</span>
          <span className="admin-badge">STAFF PANEL</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-live"><span className="live-dot" /> LIVE</span>
          <button className="cp-btn ghost admin-back" onClick={logout}>LOGOUT</button>
          <a href="/" className="cp-btn ghost admin-back">← SITE</a>
        </div>
      </header>

      {/* View tabs */}
      <div className="admin-view-tabs">
        <button className={`admin-tab ${view === "orders" ? "active" : ""}`} onClick={() => setView("orders")}>
          ORDERS {activeOrders > 0 && <span className="filter-count">{activeOrders}</span>}
        </button>
        <button className={`admin-tab ${view === "analytics" ? "active" : ""}`} onClick={() => setView("analytics")}>
          ANALYTICS
        </button>
        <button className={`admin-tab ${view === "items" ? "active" : ""}`} onClick={() => setView("items")}>
          MENU ITEMS
        </button>
      </div>

      {view === "analytics" && <AnalyticsView orders={orders} />}
      {view === "items"     && <ItemsView />}

      {view === "orders" && (
        <>
          <div className="admin-stats">
            {[
              { label: "TOTAL",     value: orders.length,            color: "var(--white)"  },
              { label: "PENDING",   value: counts.pending,           color: "var(--yellow)" },
              { label: "PREPARING", value: counts.preparing,         color: "var(--cyan)"   },
              { label: "READY",     value: counts.ready,             color: "#00ff88"       },
              { label: "REVENUE",   value: `₹${revenue.toFixed(2)}`, color: "var(--pink)"   },
            ].map((s) => (
              <div key={s.label} className="admin-stat">
                <span className="admin-stat-val" style={{ color: s.color, textShadow: `0 0 12px ${s.color}` }}>{s.value}</span>
                <span className="admin-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="admin-toolbar">
            <div className="admin-filters">
              {STATUSES.map((s) => (
                <button key={s} className={`filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
                  {s.toUpperCase()} {counts[s] > 0 && <span className="filter-count">{counts[s]}</span>}
                </button>
              ))}
            </div>
            {counts.done > 0 && <button className="cp-btn ghost" onClick={clearDone}>CLEAR DONE ({counts.done})</button>}
          </div>

          <div className="admin-orders">
            {visible.length === 0 ? (
              <div className="admin-empty">
                <p className="neon-cyan">// NO ORDERS YET</p>
                <p>Orders placed on the site will appear here automatically.</p>
              </div>
            ) : (
              visible.map((order) => {
                const meta = STATUS_META[order.status];
                return (
                  <div key={order.id} className={`order-card status-${order.status}`}>
                    <div className="order-card-top">
                      <div className="order-id-block">
                        <span className="order-num neon-cyan">#{order.id}</span>
                        <span className="order-time">{timeAgo(order.timestamp)}</span>
                      </div>
                      <span className="order-status-badge" style={{ color: meta.color, borderColor: meta.color, boxShadow: `0 0 10px ${meta.color}44` }}>{meta.label}</span>
                    </div>
                    <div className="order-customer">
                      <span className="order-name neon-pink">{order.name}</span>
                      <span className="order-type-tag">{order.orderType === "dine-in" ? `🪑 Dine In — Table ${order.table}` : `🥡 Take Out — ${order.pickupTime}`}</span>
                    </div>
                    <ul className="order-items">
                      {order.items.map((item, i) => (
                        <li key={i} className="order-item-row">
                          <span>{item.emoji} {item.qty}× {item.name}</span>
                          <span className="neon-cyan">₹{(item.price * item.qty).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-card-footer">
                      <span className="order-total">TOTAL <span className="neon-yellow">₹{order.total.toFixed(2)}</span></span>
                      {meta.next && (
                        <button className="cp-btn advance-btn" style={{ color: STATUS_META[meta.next].color, borderColor: STATUS_META[meta.next].color }} onClick={() => advanceStatus(order.id)}>
                          MARK {STATUS_META[meta.next].label} ▶
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
