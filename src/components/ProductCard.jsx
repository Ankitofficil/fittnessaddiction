import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const inCart = cart.some((i) => i.id === product.id);

  return (
    <div className="product-card">
      {product.badge && <span className="badge">{product.badge}</span>}
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            className={`btn-add ${inCart ? "in-cart" : ""}`}
            onClick={() => addToCart(product)}
          >
            {inCart ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
