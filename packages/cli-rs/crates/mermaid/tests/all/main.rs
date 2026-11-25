//! The Mermaid plugin's integration tests, one module per area, linked into one binary. Select an area with
//! `cargo test -p opencode-mermaid --test all <module>::`.
//!
//! Mermaid 图表渲染入口。

mod limits;
mod markdown;
mod oracle;
