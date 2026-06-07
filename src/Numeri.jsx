import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";

export default function Numeri() {
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [itemStats, setItemStats] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    async function load() {
      setLoading(true);
      setError(null);

      const [{ count, error: ordersError }, { data: items, error: itemsError }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("order_items").select("item_name, quantity"),
      ]);

      if (ordersError || itemsError) {
        setError((ordersError || itemsError).message);
        setLoading(false);
        return;
      }

      const totals = Object.values(
        items.reduce((acc, { item_name, quantity }) => {
          if (!acc[item_name]) acc[item_name] = { name: item_name, quantity: 0 };
          acc[item_name].quantity += quantity;
          return acc;
        }, {})
      ).sort((a, b) => b.quantity - a.quantity);

      setOrdersCount(count || 0);
      setItemStats(totals);
      setLoading(false);
    }

    load();
  }, [session]);

  async function handleDeleteAll() {
    const password = window.prompt("Per cancellare tutti i dati, scrivi la password:");
    if (password === null) return;
    if (password !== "totalrecall") {
      window.alert("Password sbagliata, non ho cancellato niente.");
      return;
    }

    setDeleting(true);
    setError(null);

    const { error: itemsError } = await supabase.from("order_items").delete().not("id", "is", null);
    const { error: ordersError } = itemsError
      ? { error: null }
      : await supabase.from("orders").delete().not("id", "is", null);

    setDeleting(false);

    if (itemsError || ordersError) {
      setError((itemsError || ordersError).message);
      return;
    }

    setOrdersCount(0);
    setItemStats([]);
  }

  if (session === undefined) return null;
  if (!session) return <Login />;

  const totalItems = itemStats.reduce((t, i) => t + i.quantity, 0);

  return (
    <main className="numeri">
      <header className="header">
        <h1>Numeri</h1>
        <a className="button" href="/">
          Cassa
        </a>
      </header>

      {loading && <p className="numeri-status">Carico...</p>}
      {error && <p className="numeri-status numeri-status--error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="numeri-summary">
            <div className="numeri-card">
              <span className="numeri-card-value">{ordersCount}</span>
              <span className="numeri-card-label">ordini</span>
            </div>
            <div className="numeri-card">
              <span className="numeri-card-value">{totalItems}</span>
              <span className="numeri-card-label">cose ordinate</span>
            </div>
          </div>

          <ul className="numeri-list">
            {itemStats.map((item) => (
              <li className="numeri-row" key={item.name}>
                <span className="numeri-row-name">{item.name}</span>
                <span className="numeri-row-value">{item.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="numeri-danger">
            <button className="button button--danger" onClick={handleDeleteAll} disabled={deleting}>
              {deleting ? "Cancello..." : "Cancella tutti i dati"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
