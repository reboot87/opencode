/**
 * 模型提供方界面 — OpencodeLogo。
 * provider 的配置与展示界面中负责 OpencodeLogo 部分，提供该部分所需的实现与类型定义。
 */
export function OpenCodeLogo(props: { class?: string }) {
  return (
    <svg
      data-component="opencode-logo"
      aria-hidden="true"
      class={props.class}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(1.2 1.2) scale(0.85)">
        <path opacity="0.2" d="M11.1999 12.8H4.79993V6.40002H11.1999V12.8Z" fill="currentColor" />
        <path d="M11.2 3.2H4.79998V12.8H11.2V3.2ZM14.4 16H1.59998V0H14.4V16Z" fill="currentColor" />
      </g>
    </svg>
  )
}
