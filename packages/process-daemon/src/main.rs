//! 进程守护服务实现入口。

fn main() {
    if let Err(error) = opencode_pty::client::run_cli() {
        eprintln!("error: {error:#}");
        std::process::exit(1);
    }
}
