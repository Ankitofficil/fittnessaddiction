import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function MenuCard({ item }) {
  const { addToCart, cart } = useCart();
  const inCart = cart.some((i) => i.id === item.id);
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`menu-card ${inCart ? "in-cart" : ""}`}>
      {item.tag && <span className="menu-tag">{item.tag}</span>}

      {/* Food image */}
      {item.image && !imgError ? (
        <div className="menu-card-img-wrap">
          <img
            src={item.image}
            alt={item.name}
            className="menu-card-img"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="menu-card-emoji-wrap">
          <span className="menu-emoji-lg">{item.emoji}</span>
        </div>
      )}

      <div className="menu-card-body">
        <div className="menu-card-top">
          <div className="menu-meta">
            <span className="menu-category">{item.category}</span>
            <div className="macro-pills">
              <span className="macro protein">{item.protein}g protein</span>
              <span className="macro cal">{item.calories} kcal</span>
            </div>
          </div>
        </div>
        <h3 className="menu-name">{item.name}</h3>
        <p className="menu-desc">{item.description}</p>
        <div className="menu-footer">
          <span className="menu-price">₹{item.price.toFixed(2)}</span>
          <button
            className={`add-btn ${inCart ? "added" : ""}`}
            onClick={() => addToCart(item)}
          >
            {inCart ? "✓ ADDED" : "+ ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}
