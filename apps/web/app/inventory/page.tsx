"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEV_SEED_TENANT_ID } from "@jewellery-erp/shared";

type InventoryItem = {
  id: string;
  itemCode: string;
  category: string;
  metal: string;
  status: string;
  netWt: string | number;
};

type ApiError = {
  code?: string;
  message?: string;
};

function formatWeight(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(3) : String(value);
}

export default function InventoryListPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/inventory/items");
        const body = (await response.json()) as InventoryItem[] | ApiError;

        if (!response.ok) {
          const err = body as ApiError;
          const msg =
            err.message ||
            err.code ||
            `Failed to load inventory (${response.status})`;
          if (!cancelled) setError(msg);
          return;
        }

        if (!Array.isArray(body)) {
          if (!cancelled) setError("Unexpected response from server");
          return;
        }

        if (!cancelled) setItems(body);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <p>
        <Link href="/">Home</Link> · <Link href="/dashboard">Dashboard</Link>
      </p>
      <h1>Inventory List</h1>

      {loading && <p>Loading inventory…</p>}

      {!loading && error && (
        <div className="card">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p>
            <Link href="/login">Sign in again</Link>
          </p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p>No items found for this store.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Code</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Metal</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Net wt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{item.itemCode}</td>
                  <td style={{ padding: "8px" }}>{item.category}</td>
                  <td style={{ padding: "8px" }}>{item.metal}</td>
                  <td style={{ padding: "8px" }}>{item.status}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatWeight(item.netWt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
            {items.length} item{items.length === 1 ? "" : "s"} (dev tenant: {DEV_SEED_TENANT_ID})
          </p>
        </div>
      )}
    </main>
  );
}
