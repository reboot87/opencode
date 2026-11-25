//! The store's integration tests, one module per area, linked into one binary. Select an area with
//! `cargo test -p opencode-store --test all <module>::`.
//!
//! 存储层测试入口。

mod common;

mod compaction;
mod data;
mod eviction;
mod fold_oracle;
mod inbox_race;
mod jobs;
mod live;
mod live_rest;
mod location;
mod model;
mod pending_status;
mod reconnect;
mod refresh;
mod review_fixes;
mod target_oracle;
