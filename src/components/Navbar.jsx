import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Cart from "./Cart";

export default function Navbar() {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-scan" />
        <Link to="/" className="navbar-logo">
          <span className="logo-glitch" data-text="FITNESS ADDICTION">FITNESS ADDICTION</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>[ HOME ]</NavLink></li>
          <li><NavLink to="/menu" onClick={() => setMenuOpen(false)}>[ MENU ]</NavLink></li>
          <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>[ ABOUT ]</NavLink></li>
        </ul>

        <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Open order">
          <span className="cart-icon-text">ORDER</span>
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </button>
      </nav>

      {cartOpen && <Cart onClose={() => setCartOpen(false)} />}
    </>
  );
}
