export default function About() {
  return (
    <main className="about-page">
      <div className="page-hero">
        <div className="page-hero-scanlines" />
        <p className="hero-eyebrow">// OUR MISSION</p>
        <h1>BUILT FOR <span className="neon-cyan">ATHLETES</span></h1>
        <p className="page-hero-sub">Fast food that actually works for you.</p>
      </div>

      <section className="about-body">
        <div className="about-text">
          <h2>// WHY WE EXIST</h2>
          <p>
            Most fast food is engineered to taste good and leave you feeling terrible.
            We flipped the script. Fitness Addiction was built by lifters, runners, and
            athletes who refused to choose between convenience and gains.
          </p>
          <p>
            Every item on our menu hits a minimum of <span className="neon-cyan">35g of protein</span>.
            No fillers. No seed oils. No compromises. Just fast, clean, high-performance food
            for people who take their body seriously.
          </p>
        </div>

        <div className="about-values">
          {[
            { icon: "⚡", title: "HIGH PROTEIN", desc: "Every meal delivers serious macros. Minimum 35g per serve." },
            { icon: "🔬", title: "CLEAN INGREDIENTS", desc: "No artificial fillers, no junk oils. Real food only." },
            { icon: "⏱", title: "FAST SERVICE", desc: "Average order ready in 15 minutes. Fuel fast, train fast." },
            { icon: "🪑", title: "DINE IN OR OUT", desc: "Eat in our cyber-styled space or grab it on the go." },
          ].map((v) => (
            <div key={v.title} className="value-card">
              <span className="value-icon">{v.icon}</span>
              <h3 className="neon-cyan">{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
