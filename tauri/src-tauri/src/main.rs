#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn Python desktop shell: the Tauri webview renders the local
// static export (../web/out) only — no remote URL is ever loaded.
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
