import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage("noxe_cart", []);
  const [isOpen, setIsOpen] = useLocalStorage("noxe_cart_open", false);

  // Gera chave única por produto+cor+tamanho
  const itemKey = (id, cor, tamanho) => `${id}__${cor}__${tamanho ?? ""}`;

  const addItem = useCallback(
    (product, cor, tamanho, qty = 1) => {
      const key = itemKey(product.id, cor, tamanho);
      setItems((prev) => {
        const existing = prev.find((i) => i._key === key);
        if (existing) {
          return prev.map((i) =>
            i._key === key ? { ...i, quantidade: i.quantidade + qty } : i
          );
        }
        return [
          ...prev,
          {
            _key: key,
            id: product.id,
            nome: product.nome,
            preco: product.preco,
            imagem: product.imagens?.[0] ?? "",
            categoria: product.categoria,
            cor,
            tamanho,
            quantidade: qty,
          },
        ];
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (key) => setItems((prev) => prev.filter((i) => i._key !== key)),
    [setItems]
  );

  const updateQty = useCallback(
    (key, qty) => {
      if (qty < 1) return;
      setItems((prev) =>
        prev.map((i) => (i._key === key ? { ...i, quantidade: qty } : i))
      );
    },
    [setItems]
  );

  const updateVariant = useCallback(
    (key, newCor, newTamanho) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i._key !== key) return i;
          const newKey = itemKey(i.id, newCor, newTamanho);
          return { ...i, _key: newKey, cor: newCor, tamanho: newTamanho };
        })
      );
    },
    [setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const total = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const totalItens = items.reduce((s, i) => s + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQty,
        updateVariant,
        clearCart,
        total,
        totalItens,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
