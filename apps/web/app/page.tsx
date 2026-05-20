import Link from "next/link";

const screens = [
  { title: "Login", href: "/login" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Add Item", href: "/inventory/add-item" },
  { title: "Inventory List", href: "/inventory" },
  { title: "New Sale", href: "/sales/new" },
  { title: "Karigar Jobs", href: "/karigar-jobs" },
  { title: "Ledger", href: "/ledger" },
  { title: "Customer List", href: "/customers" }
] as const;

export default function HomePage() {
  return (
    <main>
      <h1>Jewellery ERP - Phase 1 Shell</h1>
      <p>Core screen placeholders are scaffolded for rapid iteration.</p>
      <section className="grid">
        {screens.map(({ title, href }) => (
          <Link key={href} href={href} className="card card-link">
            <article>
              <h3>{title}</h3>
              <p>Open {title.toLowerCase()}.</p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
