// Table.types.ts
import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'

/* ------------------------------------------------------------------ */
/* Column（セル定義）                                                 */
/* ------------------------------------------------------------------ */
export type CellProps<T> = {
  /** 行データ上のキー。未指定の場合 Component の cellValue は null */
  id?: keyof T
  /** ヘッダラベル。未指定時は空セル */
  label?: ReactNode
  /**
   * 行レンダリング用カスタムコンポーネント
   * デフォルトは「文字列・数値・React 要素のみ表示するプレーン <span>」
   */
  Component?: (props: { row: T; cellValue: T[keyof T] | null; rowIndex: number }) => ReactNode
} & TdHTMLAttributes<HTMLTableCellElement> &
  ThHTMLAttributes<HTMLTableHeaderCellElement> // <th> / <td> どちらでも使える属性を許容

/* ------------------------------------------------------------------ */
/* 全体の Table Props                                                 */
/* ------------------------------------------------------------------ */
export type TableProps<T> = {
  rows: T[]
  columns: CellProps<T>[]
  uniqueKey: keyof T

  /**
   * 行 (<tr>) に渡す任意の属性
   * click/dblclick はコールバックの引数に行データを渡したいので独自定義
   */
  rowProps?: Omit<HTMLAttributes<HTMLTableRowElement>, 'onClick' | 'onDoubleClick'> & {
    onClick?: (row: T) => void
    onDoubleClick?: (row: T) => void
  }

  /* ---------- レイアウト関連 ---------- */
  maxRows?: number
  maxHeight?: CSSProperties['maxHeight']
  columnWiseMaxWidth?: CSSProperties['maxWidth']
  rowWiseMaxHeight?: CSSProperties['maxHeight']
  rowWiseFixedHeight?: CSSProperties['height']

  /* ---------- 表示オプション ---------- */
  showEmptyRow?: boolean // 空行で高さを揃える
  footer?: ReactNode // <tfoot> の内容
  noRowsMessage?: ReactNode // 行が 0 件時のメッセージ
  size?: 'small' | 'medium' // 行高計算用（互換のため残置）

  /* ---------- DOM 属性継承 ---------- */
} & TableHTMLAttributes<HTMLTableElement> // className, style などを透過
