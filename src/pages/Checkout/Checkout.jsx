import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { STORE_CONFIG } from "../../config/storeConfig";
import { formatCurrency } from "../../utils/helpers";
import styles from "./Checkout.module.css";

const INITIAL = {
  nome: "", telefone: "", entrega: "entrega",
  cep: "", rua: "", numero: "", bairro: "",
  cidade: "", estado: "", complemento: "",
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim())      e.nome = "Informe seu nome.";
    if (!form.telefone.trim())  e.telefone = "Informe seu telefone.";
    if (form.entrega === "entrega") {
      if (!form.cep.trim())    e.cep    = "Informe o CEP.";
      if (!form.rua.trim())    e.rua    = "Informe a rua.";
      if (!form.numero.trim()) e.numero = "Informe o número.";
      if (!form.bairro.trim()) e.bairro = "Informe o bairro.";
      if (!form.cidade.trim()) e.cidade = "Informe a cidade.";
      if (!form.estado.trim()) e.estado = "Informe o estado.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = () => {
    const linhas = [
      `🛒 *NOVO PEDIDO — ${STORE_CONFIG.nomeLoja.toUpperCase()}*`,
      ``,
      `👤 *Cliente:* ${form.nome}`,
      `📱 *Telefone:* ${form.telefone}`,
      ``,
      form.entrega === "entrega"
        ? `📦 *Entrega:*\n${form.rua}, ${form.numero}${form.complemento ? ` — ${form.complemento}` : ""}\n${form.bairro}, ${form.cidade}/${form.estado}\nCEP: ${form.cep}`
        : `🏪 *Retirada na loja:*\n${STORE_CONFIG.endereco}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━`,
      `🛍️ *ITENS DO PEDIDO*`,
      `━━━━━━━━━━━━━━━━━━━`,
    ];

    items.forEach((item, i) => {
      linhas.push(
        ``,
        `*${i + 1}. ${item.nome}*`,
        `   • Cor: ${item.cor ?? "—"}`,
        `   • Tamanho: ${item.tamanho ?? "—"}`,
        `   • Quantidade: ${item.quantidade}`,
        `   • Valor unit.: ${formatCurrency(item.preco)}`,
        `   • Subtotal: ${formatCurrency(item.preco * item.quantidade)}`,
      );
    });

    linhas.push(
      ``,
      `━━━━━━━━━━━━━━━━━━━`,
      `💰 *TOTAL: ${formatCurrency(total)}*`,
      `━━━━━━━━━━━━━━━━━━━`,
    );

    return linhas.join("\n");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!validate()) return;

    setSending(true);
    const msg = encodeURIComponent(buildMessage());
    const url = `https://wa.me/${STORE_CONFIG.whatsapp}?text=${msg}`;

    setTimeout(() => {
      clearCart();
      window.open(url, "_blank");
      navigate("/");
    }, 800);
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className={`container ${styles.empty}`}>
          <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity=".3">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <h2>Seu carrinho está vazio</h2>
          <Link to="/" className="btn btn-primary">Explorar produtos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link> <span>›</span> <span>Checkout</span>
        </nav>

        <h1 className={styles.pageTitle}>Finalizar Pedido</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.layout}>
            {/* Left — Form */}
            <div className={styles.formCol}>

              {/* Dados pessoais */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.step}>1</span>
                  Dados Pessoais
                </h2>
                <div className={styles.fields}>
                  <Field label="Nome Completo *" error={errors.nome}>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={form.nome}
                      onChange={(e) => set("nome", e.target.value)}
                      className={errors.nome ? styles.inputError : ""}
                    />
                  </Field>
                  <Field label="Telefone / WhatsApp *" error={errors.telefone}>
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={form.telefone}
                      onChange={(e) => set("telefone", e.target.value)}
                      className={errors.telefone ? styles.inputError : ""}
                    />
                  </Field>
                </div>
              </div>

              {/* Entrega */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.step}>2</span>
                  Forma de Recebimento
                </h2>

                <div className={styles.entregaOpts}>
                  <label className={`${styles.entregaOpt} ${form.entrega === "entrega" ? styles.selected : ""}`}>
                    <input type="radio" name="entrega" value="entrega" checked={form.entrega === "entrega"} onChange={() => set("entrega", "entrega")} />
                    <div className={styles.optIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </div>
                    <div>
                      <strong>Entrega</strong>
                      <p>{STORE_CONFIG.prazoEntrega}</p>
                    </div>
                  </label>

                  <label className={`${styles.entregaOpt} ${form.entrega === "retirada" ? styles.selected : ""}`}>
                    <input type="radio" name="entrega" value="retirada" checked={form.entrega === "retirada"} onChange={() => set("entrega", "retirada")} />
                    <div className={styles.optIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div>
                      <strong>Retirada na Loja</strong>
                      <p>Grátis · {STORE_CONFIG.endereco}</p>
                    </div>
                  </label>
                </div>

                {/* Endereço de entrega */}
                {form.entrega === "entrega" && (
                  <div className={styles.fields} style={{ marginTop: 20 }}>
                    <div className={styles.row2}>
                      <Field label="CEP *" error={errors.cep}>
                        <input type="text" placeholder="00000-000" value={form.cep} onChange={(e) => set("cep", e.target.value)} className={errors.cep ? styles.inputError : ""} />
                      </Field>
                      <Field label="Estado *" error={errors.estado}>
                        <input type="text" placeholder="SP" maxLength={2} value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} className={errors.estado ? styles.inputError : ""} />
                      </Field>
                    </div>
                    <Field label="Cidade *" error={errors.cidade}>
                      <input type="text" placeholder="Sua cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={errors.cidade ? styles.inputError : ""} />
                    </Field>
                    <Field label="Bairro *" error={errors.bairro}>
                      <input type="text" placeholder="Seu bairro" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} className={errors.bairro ? styles.inputError : ""} />
                    </Field>
                    <div className={styles.row2}>
                      <Field label="Rua / Avenida *" error={errors.rua}>
                        <input type="text" placeholder="Nome da rua" value={form.rua} onChange={(e) => set("rua", e.target.value)} className={errors.rua ? styles.inputError : ""} />
                      </Field>
                      <Field label="Número *" error={errors.numero}>
                        <input type="text" placeholder="123" value={form.numero} onChange={(e) => set("numero", e.target.value)} className={errors.numero ? styles.inputError : ""} />
                      </Field>
                    </div>
                    <Field label="Complemento">
                      <input type="text" placeholder="Apto, bloco... (opcional)" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
                    </Field>
                  </div>
                )}

                {form.entrega === "retirada" && (
                  <div className={styles.retiradaInfo}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {STORE_CONFIG.endereco}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Summary */}
            <div className={styles.summaryCol}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.step}>3</span>
                  Resumo do Pedido
                </h2>

                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <div key={item._key} className={styles.summaryItem}>
                      <img src={item.imagem} alt={item.nome} className={styles.summaryImg} />
                      <div className={styles.summaryInfo}>
                        <p className={styles.summaryName}>{item.nome}</p>
                        <div className={styles.summaryTags}>
                          {item.cor && <span className={styles.summaryTag}>{item.cor}</span>}
                          {item.tamanho && <span className={styles.summaryTag}>{item.tamanho}</span>}
                          <span className={styles.summaryTag}>x{item.quantidade}</span>
                        </div>
                      </div>
                      <span className={styles.summaryPrice}>{formatCurrency(item.preco * item.quantidade)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.totalBlock}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Frete</span>
                    <span className={total >= STORE_CONFIG.freteGratisAcima ? styles.freeShip : ""}>
                      {total >= STORE_CONFIG.freteGratisAcima || form.entrega === "retirada"
                        ? "Grátis"
                        : "A combinar"}
                    </span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-full btn-lg ${styles.submitBtn}`}
                  disabled={sending}
                >
                  {sending ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.551 4.118 1.512 5.848L.057 23.857a.562.562 0 00.686.686l5.965-1.464A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                      </svg>
                      Finalizar no WhatsApp
                    </>
                  )}
                </button>
                <p className={styles.whatsappNote}>
                  Você será redirecionado ao WhatsApp com o pedido completo já preenchido.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Field wrapper helper */
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--texto-secundario)" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: "0.75rem", color: "var(--erro)" }}>{error}</span>}
    </div>
  );
}
