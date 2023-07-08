use std::sync::Mutex;
use tauri::{AppHandle, Manager, Window, Wry};

#[derive(Default)]
pub struct Store {
    panel: Option<tauri::Window>,
}

#[derive(Default)]
pub struct State(pub Mutex<Store>);

pub fn get_panel(app_handle: AppHandle<Wry>) -> Window {
    app_handle.get_window("main").unwrap()
}

pub fn init_panel(app_handle: AppHandle<Wry>, _window: Window<Wry>) {
    app_handle.state::<State>().0.lock().unwrap().panel =
        Some(app_handle.get_window("main").unwrap());
}

pub async fn show_panel(app_handle: AppHandle<Wry>) {
    let panel = get_panel(app_handle.clone());

    crate::command::application::windows::set_focused_application(app_handle.clone()).await;

    panel.show().unwrap();
    panel.set_focus().unwrap();
}

pub fn hide_panel(app_handle: AppHandle<Wry>) {
    get_panel(app_handle).hide().unwrap();
}

pub async fn toggle_panel(app_handle: AppHandle<Wry>) {
    let panel = get_panel(app_handle.clone());

    if panel.is_visible().unwrap() {
        hide_panel(app_handle);
    } else {
        show_panel(app_handle).await;
    }
}
