import { useState } from "react";
import { useCart } from "../context/CartContext";

const STEPS = { REVIEW: "review", ORDER_TYPE: "type", DETAILS: "details", CONFIRM: "confirm" };

export default function Cart({ onClose }) {
  const { cart, removeFromCart, updateQty, totalPrice, clearCart, orderType, setOrderType } = useCart();
  const [step, setStep] = useState(STEPS.REVIEW);
  const [name, setName] = useState("");
  const [tableNum, setTableNum] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [orderNum] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  function handlePlaceOrder(e) {
    e.preventDefault();
    const order = {
      id: orderNum,
      name,
      orderType,
      table: orderType === "dine-in" ? tableNum : null,
      pickupTime: orderType === "takeout" ? pickupTime : null,
      items: cart.map((i) => ({ name: i.name, emoji: i.emoji, qty: i.qty, price: i.price })),
      total: totalPrice,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("fa_orders") || "[]");
    localStorage.setItem("fa_orders", JSON.stringify([order, ...existing]));
    setStep(STEPS.CONFIRM);
  }

  function handleClose() {
    if (step === STEPS.CONFIRM) clearCart();
    onClose();
  }

  return (
    <div className="cart-overlay" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <span className="neon-cyan">▶</span>
            {step === STEPS.REVIEW && " YOUR ORDER"}
            {step === STEPS.ORDER_TYPE && " DINE IN OR TAKE OUT?"}
            {step === STEPS.DETAILS && " YOUR DETAILS"}
            {step === STEPS.CONFIRM && " ORDER CONFIRMED"}
          </div>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* STEP: REVIEW */}
        {step === STEPS.REVIEW && (
          <>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p className="neon-pink">// CART IS EMPTY</p>
                <p>Add items from the menu to get started.</p>
                <button className="cp-btn" onClick={handleClose}>BROWSE MENU</button>
              </div>
            ) : (
              <>
                <ul className="cart-items">
                  {cart.map((item) => (
                    <li key={item.id} className="cart-item">
                      <span className="cart-item-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-price neon-cyan">₹{(item.price * item.qty).toFixed(2)}</p>
                        <div className="qty-controls">
                          <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                    </li>
                  ))}
                </ul>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>TOTAL</span>
                    <span className="neon-cyan">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <button className="cp-btn full-width" onClick={() => setStep(STEPS.ORDER_TYPE)}>
                    NEXT: CHOOSE ORDER TYPE ▶
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* STEP: ORDER TYPE */}
        {step === STEPS.ORDER_TYPE && (
          <div className="order-type-step">
            <p className="step-sub">How will you be having your order?</p>
            <div className="order-type-options">
              <button
                className={`order-type-btn ${orderType === "dine-in" ? "selected" : ""}`}
                onClick={() => setOrderType("dine-in")}
              >
                <span className="type-icon">🪑</span>
                <span className="type-label">DINE IN</span>
                <span className="type-desc">Eat at the restaurant</span>
              </button>
              <button
                className={`order-type-btn ${orderType === "takeout" ? "selected" : ""}`}
                onClick={() => setOrderType("takeout")}
              >
                <span className="type-icon">🥡</span>
                <span className="type-label">TAKE OUT</span>
                <span className="type-desc">Pick up & go</span>
              </button>
            </div>
            <div className="step-nav">
              <button className="cp-btn ghost" onClick={() => setStep(STEPS.REVIEW)}>◀ BACK</button>
              <button
                className="cp-btn"
                disabled={!orderType}
                onClick={() => setStep(STEPS.DETAILS)}
              >
                NEXT ▶
              </button>
            </div>
          </div>
        )}

        {/* STEP: DETAILS */}
        {step === STEPS.DETAILS && (
          <form className="details-step" onSubmit={handlePlaceOrder}>
            <p className="step-sub">
              {orderType === "dine-in" ? "// DINE IN — enter your details" : "// TAKE OUT — enter pickup info"}
            </p>
            <label className="cp-label">
              YOUR NAME
              <input
                className="cp-input"
                required
                placeholder="e.g. Alex Reyes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {orderType === "dine-in" ? (
              <label className="cp-label">
                TABLE NUMBER
                <input
                  className="cp-input"
                  required
                  placeholder="e.g. 7"
                  value={tableNum}
                  onChange={(e) => setTableNum(e.target.value)}
                />
              </label>
            ) : (
              <label className="cp-label">
                PICKUP TIME
                <input
                  className="cp-input"
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </label>
            )}
            <div className="order-summary-mini">
              {cart.map((i) => (
                <div key={i.id} className="summary-row">
                  <span>{i.qty}× {i.name}</span>
                  <span className="neon-cyan">₹{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row total-row">
                <span>TOTAL</span>
                <span className="neon-yellow">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="step-nav">
              <button type="button" className="cp-btn ghost" onClick={() => setStep(STEPS.ORDER_TYPE)}>◀ BACK</button>
              <button type="submit" className="cp-btn">PLACE ORDER ▶</button>
            </div>
          </form>
        )}

        {/* STEP: CONFIRMED */}
        {step === STEPS.CONFIRM && (
          <div className="confirm-step">
            <div className="confirm-icon">✓</div>
            <h2 className="neon-cyan">ORDER #{orderNum}</h2>
            <p className="confirm-name">Thank you, <span className="neon-pink">{name}</span>!</p>
            <div className="confirm-badge">
              {orderType === "dine-in"
                ? `🪑 DINE IN — Table ${tableNum}`
                : `🥡 TAKE OUT — Pickup at ${pickupTime}`}
            </div>
            <p className="confirm-eta">⏱ Estimated wait: <span className="neon-yellow">15–20 min</span></p>
            <button className="cp-btn full-width" onClick={handleClose}>CLOSE ✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
