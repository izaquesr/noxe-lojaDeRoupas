import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

export function Toast({ toasts, removeToast }) {
  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className={styles.msg}>{t.message}</span>
          <button className={styles.close} onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}

let _addToast = null
export function setToastHandler(fn) { _addToast = fn }
export function toast(message, type = 'success') {
  if (_addToast) _addToast(message, type)
  else console.log(`[toast/${type}]`, message)
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  useEffect(() => {
    setToastHandler(addToast)
    return () => setToastHandler(null)
  }, [])

  return { toasts, addToast, removeToast }
}

// Componente global montado uma única vez no main.jsx
export function ToastWrapper() {
  const { toasts, removeToast } = useToast()
  return <Toast toasts={toasts} removeToast={removeToast} />
}
