import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";
import { STORE_CONFIG } from "../../config/storeConfig";
import { formatCurrency } from "../../utils/helpers";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState("entrega");
  const [form, setForm] = useState({
    name: "", phone: "", zipcode: "", address: "", number: "", complement: ""
  });
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function fetchZip(cep) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({ ...f, address: `${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}` }));
      }
    } catch {}
    setZipLoading(false);
  }

  async function handleFinish() {
    if (!form.name || !form.phone) return alert("Preencha nome e telefone.");
    if (delivery === "entrega" && (!form.zipcode || !form.address || !form.number)) {
      return alert("Preencha todos os campos de entrega.");
    }
    if (items.length === 0) return alert("Carrinho vazio.");

    setLoading(true);

    // Save to Supabase
    try {
      // Upsert customer
      const { data: custData } = await supabase
        .from("customers")
        .upsert({ name: form.name, phone: form.phone }, { onConflict: "phone", ignoreDuplicates: false })
        .select()
        .single();

      // Create order
      await supabase.from("orders").insert({
        customer_name: form.name,
        phone: form.phone,
        zipcode: delivery === "entrega" ? form.zipcode : null,
        address: delivery === "entrega" ? form.address : null,
        number: delivery === "entrega" ? form.number : null,
        complement: form.complement,
        delivery_type: delivery,
        items: items.map(i => ({
          id: i.id, name: i.name || i.nome, price: i.price || i.preco,
          qty: i.qty, size: i.size, color: i.color
        })),
        total,
        status: "pendente",
        customer_id: custData?.id || null,
      });

      // Update customer stats
      if (custData?.id) {
        await supabase.from("customers").update({
          total_orders: (custData.total_orders || 0) + 1,
          total_spent: (Number(custData.total_spent) || 0) + total,
          last_order: new Date().toISOString(),
        }).eq("id", custData.id);
      }
    } catch (err) {
      console.error("Supabase error:", err);
    }

    // Generate WhatsApp message
    const addr = delivery === "entrega"
      ? `\n📍 *Endereço:* ${form.address}, ${form.number} ${form.complement}\n🔢 *CEP:* ${form.zipcode}`
      : "\n🏪 *Retirada na loja*";

    const itemsText = items.map(i =>
      `• ${i.name || i.nome} x${i.qty}${i.size ? ` | Tam: ${i.size}` : ""}${i.color ? ` | Cor: ${i.color}` : ""} — ${formatCurrency((i.price || i.preco) * i.qty)}`
    ).join("\n");

    const msg = `🛍️ *Novo Pedido*\n\n👤 *Nome:* ${form.name}\n📱 *Telefone:* ${form.phone}${addr}\n\n*Itens:*\n${itemsText}\n\n💰 *Total: ${formatCurrency(total)}*`;

    clearCart();
    setLoading(false);

    const waUrl = `https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    navigate("/");
  }

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className={`container ${styles.empty}`}>
          <h2>Carrinho vazio</h2>
          <a href="/" className="btn btn-primary">Continuar comprando</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.layout}`}>
        <div className={styles.form}>
          <h1 className={styles.title}>Finalizar pedido</h1>

          {/* Delivery type */}
          <div className={styles.deliveryToggle}>
            <button
              className={`${styles.toggleBtn} ${delivery === "entrega" ? styles.active : ""}`}
              onClick={() => setDelivery("entrega")}
            >🚚 Entrega</button>
            <button
              className={`${styles.toggleBtn} ${delivery === "retirada" ? styles.active : ""}`}
              onClick={() => setDelivery("retirada")}
            >🏪 Retirada na loja</button>
          </div>

          <div className={styles.fields}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Nome completo *</label>
                <input className={styles.input} value={form.name} onChange={set("name")} placeholder="Seu nome" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Telefone / WhatsApp *</label>
                <input className={styles.input} value={form.phone} onChange={set("phone")} placeholder="(11) 99999-9999" />
              </div>
            </div>

            {delivery === "entrega" && (
              <>
                <div className={styles.row}>
                  <div className={styles.field} style={{ maxWidth: 180 }}>
                    <label className={styles.label}>CEP *</label>
                    <input
                      className={styles.input}
                      value={form.zipcode}
                      onChange={e => { set("zipcode")(e); fetchZip(e.target.value); }}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Endereço {zipLoading && "🔄"}</label>
                    <input className={styles.input} value={form.address} onChange={set("address")} placeholder="Rua, Bairro — Cidade/UF" />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field} style={{ maxWidth: 120 }}>
                    <label className={styles.label}>Número *</label>
                    <input className={styles.input} value={form.number} onChange={set("number")} />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Complemento</label>
                    <input className={styles.input} value={form.complement} onChange={set("complement")} placeholder="Apto, bloco..." />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumo</h2>
          <div className={styles.items}>
            {items.map((item, i) => (
              <div key={i} className={styles.item}>
                <div>
                  <div className={styles.itemName}>{item.name || item.nome}</div>
                  <div className={styles.itemMeta}>
                    Qtd: {item.qty}
                    {item.size && ` · ${item.size}`}
                    {item.color && ` · ${item.color}`}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  {formatCurrency((item.price || item.preco) * item.qty)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button
            className={`btn btn-primary ${styles.finishBtn}`}
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? "Processando..." : "📲 Finalizar via WhatsApp"}
          </button>
          <p className={styles.waNote}>Você será redirecionado para o WhatsApp para confirmar o pedido.</p>
        </div>
      </div>
    </div>
  );
}
