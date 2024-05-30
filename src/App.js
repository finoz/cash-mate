import { useState, useEffect } from "react";

const itemList = [
  {
    id: 1,
    name: "Panardo",
    notes: "Con salsiccia, prosciutto o wurstel, + salse",
    price: 5.0,
  },
  {
    id: 2,
    name: "Panardo plus",
    notes: "Aggiunta di verdure",
    price: 5.5,
  },
  {
    id: 3,
    name: "Patozze",
    price: 2.5,
  },
  {
    id: 4,
    name: "Acqua (0,5L)",
    price: 1.5,
  },
  {
    id: 5,
    name: "Bibite (0,33L)",
    price: 2.5,
  },
  {
    id: 6,
    name: "Birra(0,33L)",
    price: 3,
  },
  {
    id: 7,
    name: "Ghiacciolo",
    price: 1.5,
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
          Clear All
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
        <span className="total-items">{selectedItems.length} items</span>
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
    <li className={`item ${count > 0 ? "item--used" : ""}`}>
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
