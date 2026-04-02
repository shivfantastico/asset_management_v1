/* Reusable Table Component with pagination */
import styles from "../table/Table.module.css";



export default function Table({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
}) {

  // console.log(data) 
  if (loading) {
    return (
      <div className={styles.loadingRows}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            {columns.map((_, j) => (
              <div key={j} className={styles.skeletonCell} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className={styles.tr}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
