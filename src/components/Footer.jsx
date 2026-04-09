export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">FITNESS ADDICTION</div>
          <p>High protein fast food. Fuel the machine.</p>
          <p className="footer-hours">
            <span className="neon-cyan">⏰ OPEN DAILY</span><br />
            Mon–Fri: 07:00 – 22:00<br />
            Sat–Sun: 08:00 – 23:00
          </p>
        </div>
        <div className="footer-col">
          <h4>// NAVIGATE</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/admin" className="admin-link">⚙ Staff Orders</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>// CONTACT</h4>
          <ul>
            <li>📍 HIMALYA Store, Near Kolkata Biryani, Tharpakhna, Ranchi, Jharkhand 834001</li>
            <li>📞 +91 79922 58860</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="neon-pink">FITNESS ADDICTION</span> © {new Date().getFullYear()} — All rights reserved.
        <span className="footer-tag">HIGH PROTEIN. HIGH VOLTAGE.</span>
      </div>
    </footer>
  );
}
