import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', fullPage = false }) {
  const spinner = <div className={`${styles.spinner} ${styles[size]}`} />
  if (fullPage) return <div className={styles.fullPage}>{spinner}</div>
  return spinner
}
