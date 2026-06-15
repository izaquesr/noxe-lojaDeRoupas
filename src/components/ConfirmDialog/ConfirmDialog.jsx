import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icon}>{danger ? '🗑️' : '❓'}</span>
          <h3 className={styles.title}>{title || 'Confirmar'}</h3>
        </div>
        <p className={styles.message}>{message || 'Tem certeza?'}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancelar</button>
          <button className={`${styles.confirm} ${danger ? styles.danger : ''}`} onClick={onConfirm}>
            {danger ? 'Excluir' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
