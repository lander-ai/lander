use std::sync::Once;
use tauri::{AppHandle, Window, Wry};

#[cfg_attr(macos, path = "macos.rs")]
mod macos;
use macos as panel;

pub use panel::State;

static INIT: Once = Once::new();

#[tauri::command]
pub fn init_panel(app_handle: AppHandle<Wry>, window: Window<Wry>) {
    INIT.call_once(|| {
        panel::init_panel(app_handle.clone(), window);
    });
}

#[tauri::command]
pub fn show_panel(app_handle: AppHandle<Wry>) {
    panel::show_panel(app_handle);
}

#[tauri::command]
pub fn hide_panel(app_handle: AppHandle<Wry>) {
    panel::hide_panel(app_handle);
}

#[tauri::command]
pub fn toggle_panel(app_handle: AppHandle<Wry>) {
    panel::toggle_panel(app_handle);
}
