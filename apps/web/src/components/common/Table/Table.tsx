'use client'

import classNames from 'classnames'
import React from 'react'
import { FlexBox } from '../FlexBox'
import styles from './Table.module.css'
import type { TableProps } from './Table.types'

const TABLE_MAX_ROW = 10

const Table = <T,>({
  rows,
  columns,
  uniqueKey,
  rowProps,
  maxRows = TABLE_MAX_ROW,
  maxHeight,
  columnWiseMaxWidth,
  rowWiseMaxHeight,
  rowWiseFixedHeight,
  showEmptyRow,
  footer,
  noRowsMessage,
  ...tableProps /* ここには className, style などの DOM 属性のみが渡る想定 */
}: TableProps<T>) => {
  const numEmptyRows = maxRows - rows.length

  return (
    <div style={{ maxHeight, overflow: 'auto' }} className={classNames(styles.container, tableProps.className)}>
      <table {...tableProps} className={classNames(styles.table, tableProps.className)}>
        {/* ----------------------------- ヘッダー ------------------------------ */}
        <thead className={styles.thead}>
          <tr {...rowProps} onClick={undefined} onDoubleClick={undefined}>
            {columns.map(({ Component: _ignore, ...cell }, index) => (
              <th key={cell.id || index} {...cell}>
                {cell.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ----------------------------- 本体 ------------------------------ */}
        <tbody className={styles.tbody}>
          {rows.map((row, rowIndex) => (
            <tr
              key={String(row[uniqueKey])}
              {...rowProps}
              className={classNames(
                rowProps?.className,
                (rowProps?.onClick || rowProps?.onDoubleClick) && styles['clickable-row'],
              )}
              onClick={() => rowProps?.onClick?.(row)}
              onDoubleClick={() => rowProps?.onDoubleClick?.(row)}
            >
              {columns.map(
                (
                  {
                    id,
                    Component = ({ cellValue }) => (
                      <span className={styles['tbody-cell-content']}>
                        {typeof cellValue === 'string' ||
                        typeof cellValue === 'number' ||
                        React.isValidElement(cellValue)
                          ? cellValue
                          : ''}
                      </span>
                    ),
                    ...cell
                  },
                  colIndex,
                ) => (
                  <td
                    key={id || colIndex}
                    {...cell}
                    style={{
                      maxWidth: columnWiseMaxWidth,
                      maxHeight: rowWiseMaxHeight,
                      height: rowWiseFixedHeight,
                      ...cell.style,
                    }}
                    className={classNames(cell.className, styles['width-restricted-cell'])}
                  >
                    <Component rowIndex={rowIndex} row={row} cellValue={id ? row[id] : null} />
                  </td>
                ),
              )}
            </tr>
          ))}

          {/* ---------------------- 空行パディング ---------------------- */}
          {showEmptyRow && numEmptyRows > 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  height: (tableProps.size === 'small' ? 42 : 48) * numEmptyRows,
                }}
              />
            </tr>
          )}

          {/* ------------------- データ無しメッセージ ------------------- */}
          {rows.length === 0 && noRowsMessage && (
            <tr>
              <td colSpan={columns.length} style={{ height: tableProps.size === 'small' ? 42 : 48 }}>
                <FlexBox justifyContent='center'>{noRowsMessage}</FlexBox>
              </td>
            </tr>
          )}
        </tbody>

        {/* ----------------------------- フッター ----------------------------- */}
        {footer && (
          <tfoot className={styles.tfoot}>
            <tr>{footer}</tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default Table
