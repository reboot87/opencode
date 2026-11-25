/**
 * 数据站组件 — ChartDataTable。
 * 数据站点的界面组件中负责 ChartDataTable 部分，提供该部分所需的实现与类型定义。
 */
import { For } from "solid-js"

// Text equivalent of a chart for screen readers and text-only clients. The wrapper hides it because tables
// treat height as a minimum and would grow to fit their rows.
export function ChartDataTable(props: { caption: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <div data-slot="visually-hidden">
      <table>
        <caption>{props.caption}</caption>
        <thead>
          <tr>
            <For each={props.headers}>{(header) => <th scope="col">{header}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <th scope="row">{row[0]}</th>
                <For each={row.slice(1)}>{(cell) => <td>{cell}</td>}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
