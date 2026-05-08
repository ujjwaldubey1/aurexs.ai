const screens = [
  "Login",
  "Dashboard",
  "Add Item",
  "Inventory List",
  "New Sale",
  "Karigar Jobs",
  "Ledger",
  "Customer List"
];

export default function HomePage() {
  return (
    <main>
      <h1>Jewellery ERP - Phase 1 Shell</h1>
      <p>Core screen placeholders are scaffolded for rapid iteration.</p>
      <section className="grid">
        {screens.map((screen) => (
          <article key={screen} className="card">
            <h3>{screen}</h3>
            <p>Wireframe and contract aligned view pending feature logic.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
