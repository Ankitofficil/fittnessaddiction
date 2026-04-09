import { useState } from "react";
import { Link } from "react-router-dom";
import { getStoredMenu } from "../hooks/useMenu";
import MenuCard from "../components/MenuCard";

const FEATURED_IDS = [1, 3, 4, 8];

export default function Home() {
  const [allItems] = useState(getStoredMenu);
  const featured   = allItems.filter((m) => FEATURED_IDS.includes(m.id));

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div
          className="hero-bg-img"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80)" }}
        />
        <div className="hero-scanlines" />
        <div className="hero-content">
          <p className="hero-eyebrow">// HIGH PROTEIN FAST FOOD</p>
          <h1 className="hero-title">
            <span className="glitch" data-text="FUEL THE">FUEL THE</span>
            <br />
            <span className="glitch neon-pink" data-text="MACHINE">MACHINE</span>
          </h1>
          <p className="hero-sub">
            Real food. Real gains. No excuses.<br />
            Every item is engineered for maximum protein output.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="cp-btn large">VIEW MENU ▶</Link>
          </div>
        </div>
        <div className="hero-stats">
          {[
            { val: "54g+",  label: "Max Protein Per Meal" },
            { val: "19",    label: "Menu Items" },
            { val: "0",     label: "Junk Ingredients" },
            { val: "15min", label: "Avg Wait Time" },
          ].map((s) => (
            <div key={s.label} className="hero-stat">
              <span className="hero-stat-val neon-cyan">{s.val}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Order Type Banner */}
      <section className="order-banner">
        <div className="ob-card dine">
          <span className="ob-icon">🪑</span>
          <div>
            <h3>DINE IN</h3>
            <p>Sit back and power up in our cyber-styled restaurant.</p>
          </div>
        </div>
        <div className="ob-divider">OR</div>
        <div className="ob-card take">
          <span className="ob-icon">🥡</span>
          <div>
            <h3>TAKE OUT</h3>
            <p>Order ahead. Pick up in 15 minutes. Keep grinding.</p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="section-header">
          <h2>// FEATURED ITEMS</h2>
          <Link to="/menu" className="see-all">SEE ALL MENU →</Link>
        </div>
        <div className="menu-grid">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div className="cta-content">
          <h2>READY TO <span className="neon-yellow">RELOAD?</span></h2>
          <p>Browse all 19 high-protein items. Build your order now.</p>
          <Link to="/menu" className="cp-btn large">FULL MENU ▶</Link>
        </div>
      </section>
    </main>
  );
}
