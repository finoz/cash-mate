import { useState, useEffect } from "react";

const itemList = [
  {
    id: "panardo",
    name: "Panardo",
    notes: "Con salsiccia, prosciutto o wurstel, + salse",
    price: 5.0,
  },
  {
    id: "panardo-plus",
    name: "Panardo plus",
    notes: "Aggiunta di verdure",
    price: 5.5,
  },
  {
    id: "patonze",
    name: "Patonze",
    price: 2.5,
  },
  {
    id: "bibita",
    name: "Bibita",
    price: 2.5,
  },
  {
    id: "birretta",
    name: "Birretta",
    price: 3.0,
  },
  {
    id: "acqua",
    name: "Acqua",
    price: 1,
  },
  {
    id: "ghiacciolo",
    name: "ghiacciolo",
    price: 1.0,
  },
];

export default function App() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [clear, setClear] = useState(false);

  useEffect(() => {
    setClear(selectedItems.length === 0);
    setTotal(selectedItems.reduce((t, i) => t + i.price, 0));
  }, [selectedItems]);

  function clearAll() {
    setSelectedItems([]);
  }

  function handleAdd(item) {
    setSelectedItems([...selectedItems, item]);
  }

  function handleRemove(item) {
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
        <h1>Cash Mate</h1>
        <button class="button" onClick={clearAll} disabled={clear}>
          Da capo
        </button>
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
        <span className="total-items">{selectedItems.length} cosette</span>
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
        <h3 className="item-name">{item.name}</h3>
        <span className="item-price">{item.price} €</span>
      </button>
    </li>
  );
}
