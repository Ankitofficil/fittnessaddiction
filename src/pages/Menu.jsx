import { useState } from "react";
import { getStoredMenu, getStoredCategories } from "../hooks/useMenu";
import MenuCard from "../components/MenuCard";

export default function Menu() {
  const [items]    = useState(getStoredMenu);
  const categories = getStoredCategories();
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    const matchCat    = active === "All" || item.category === active;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="menu-page">
      <div className="page-hero">
        <div className="page-hero-scanlines" />
        <p className="hero-eyebrow">// FULL MENU</p>
        <h1>HIGH PROTEIN <span className="neon-pink">FAST FOOD</span></h1>
        <p className="page-hero-sub">Every item engineered for performance.</p>
      </div>

      <div className="menu-toolbar">
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${active === cat ? "active" : ""}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="cp-search"
          placeholder="// SEARCH MENU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="no-results">
          <p className="neon-pink">// NO ITEMS FOUND</p>
          <p>Try a different category or search term.</p>
        </div>
      ) : (
        <div className="menu-grid wide">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
