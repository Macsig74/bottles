#[tauri::command]
fn greet(name: &str) -> String {
    format!("✅ Pont natif OK — bonjour {} depuis Rust !", name)
}

#[tauri::command]
fn platform_info() -> String {
    format!("natif · {}", std::env::consts::OS)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, platform_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
