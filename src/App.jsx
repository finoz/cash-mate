import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";

const itemList = [
  {
    id: "panardo",
    name: "Panardo",
    notes: "Con salsiccia o wurstel, + salse",
    price: 5.0,
  },
  {
    id: "panardo-plus",
    name: "Panardo plus",
    notes: "Aggiunta di verdure (cipolle, peperoni, zucchine)",
    price: 6,
  },
  {
    id: "piada-base",
    name: "Piada easy",
    notes: "Con prosciutto cotto o salame",
    price: 5.0,
  },

  {
    id: "piada-royal",
    name: "Piada Royal",
    notes: "Crudo, rucola e squacquerone",
    price: 6,
  },
  {
    id: "patonze",
    name: "Patonze",
    price: 3,
  },
  {
    id: "bibita",
    name: "Bibita",
    notes: "Coca, sprite",
    price: 2.5,
  },
  {
    id: "birretta",
    name: "Birretta",
    price: 2.5,
  },
  {
    id: "acqua",
    name: "Acqua",
    price: 1,
  },
  {
    id: "ghiacciolo",
    name: "Ghiacciolo",
    price: 1,
  },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) setShowLogin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (showLogin) return <Login onClose={() => setShowLogin(false)} />;

  const total = selectedItems.reduce((t, i) => t + i.price, 0);
  const clear = selectedItems.length === 0;

  function clearAll() {
    setSelectedItems([]);
    setSaveError(null);
    setSaved(false);
  }

  async function handleConfirm() {
    setSaving(true);
    setSaveError(null);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ total })
      .select("id")
      .single();

    if (orderError) {
      setSaveError(orderError.message);
      setSaving(false);
      return;
    }

    const orderItems = Object.values(
      selectedItems.reduce((acc, item) => {
        if (acc[item.id]) {
          acc[item.id].quantity += 1;
        } else {
          acc[item.id] = {
            order_id: order.id,
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: 1,
          };
        }
        return acc;
      }, {})
    );

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    setSaving(false);
    if (itemsError) {
      setSaveError(itemsError.message);
    } else {
      setSaved(true);
    }
  }

  function handleAdd(item) {
    setSelectedItems([...selectedItems, item]);
    setSaved(false);
  }

  function handleRemove(item) {
    setSaved(false);
    setSelectedItems((s) => {
      const index = s.findIndex((i) => i.id === item.id);
      if (index > -1) {
        return [...s.slice(0, index), ...s.slice(index + 1)];
      }
      return s;
    });
  }

  return (
    <main className="app">
      <header className="header">
        <h1>cashmate</h1>
        {session ? (
          <button className="button" onClick={() => supabase.auth.signOut()}>
            Esci
          </button>
        ) : (
          <button className="button" onClick={() => setShowLogin(true)}>
            Accedi
          </button>
        )}
      </header>
      <ul className="item-list">
        {itemList.map((item) => (
          <Item
            item={item}
            key={item.id}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={clear}
          />
        ))}
      </ul>
      <footer className="footer">
        <span className="total-main">Totalone {total} €</span>
        <span className="total-items">
          {selectedItems.length > 0
            ? selectedItems.length > 1
              ? ` ${selectedItems.length} cosette`
              : " 1 cosetta"
            : "niente proprio"}
        </span>
        <div className="footer-ctas">
          <button className="button" onClick={clearAll} disabled={clear}>Da capo</button>
          {session && (
            <>
              <button
                className={`button button--confirm${saved ? " button--saved" : ""}`}
                onClick={handleConfirm}
                disabled={total === 0 || saving || saved}
              >
                {saving ? "Salvo..." : saved ? "Salvato" : "Conferma ordine"}
              </button>
              {saveError && <span className="save-error">{saveError}</span>}
            </>
          )}
        </div>
      </footer>
    </main>
  );
}

function Item({ item, onAdd, onRemove, onClear }) {
  const [count, setCount] = useState(0);

  function handleAdd() {
    setCount(count + 1);
    onAdd(item);
  }

  function handleRemove() {
    if (count > 0) {
      setCount(count - 1);
      onRemove(item);
    }
  }

  useEffect(() => {
    onClear && setCount(0);
  }, [onClear]);

  return (
    <li className={`item item--${item.id} ${count > 0 ? "item--used" : ""}`}>
      <button className="item-remove" onClick={() => handleRemove(item)}>
        -
      </button>
      <button className="item-add" onClick={() => handleAdd()}>
        <span className="item-counter">{count}</span>
        <div className="item-label">
          <h3 className="item-name">{item.name}</h3>
          <span className="item-notes">{item.notes}</span>
        </div>
        <span className="item-price">{item.price} €</span>
      </button>
    </li>
  );
}
