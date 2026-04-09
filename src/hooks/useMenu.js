import { useState } from "react";
import { menuItems as defaultItems } from "../data/menu";

export const MENU_KEY = "fa_menu";

export function getStoredMenu() {
  try {
    const stored = localStorage.getItem(MENU_KEY);
    return stored ? JSON.parse(stored) : defaultItems;
  } catch {
    return defaultItems;
  }
}

export function getStoredCategories() {
  const items = getStoredMenu();
  return ["All", ...new Set(items.map((i) => i.category))];
}

export function useMenu() {
  const [items, setItems] = useState(getStoredMenu);

  function persist(updated) {
    localStorage.setItem(MENU_KEY, JSON.stringify(updated));
    setItems([...updated]);
  }

  return {
    items,
    categories: ["All", ...new Set(items.map((i) => i.category))],
    addItem:     (item) => persist([...items, { ...item, id: Date.now() }]),
    updateItem:  (id, data) => persist(items.map((i) => (i.id === id ? { ...i, ...data } : i))),
    removeItem:  (id) => persist(items.filter((i) => i.id !== id)),
    resetToDefault: () => { localStorage.removeItem(MENU_KEY); setItems([...defaultItems]); },
  };
}
