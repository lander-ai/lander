use objc_id::ShareId;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, Window, Wry};

mod ns_panel;

#[derive(Default)]
pub struct Store {
    panel: Option<ShareId<ns_panel::NSPanel>>,
}

#[derive(Default)]
pub struct State(pub Mutex<Store>);

pub fn get_panel(app_handle: AppHandle<Wry>) -> ShareId<ns_panel::NSPanel> {
    app_handle
        .state::<State>()
        .0
        .lock()
        .unwrap()
        .panel
        .clone()
        .unwrap()
}

pub fn init_panel(app_handle: AppHandle<Wry>, window: Window<Wry>) {
    app_handle.state::<State>().0.lock().unwrap().panel = Some(ns_panel::create_panel(&window));
}

pub fn show_panel(app_handle: AppHandle<Wry>) {
    get_panel(app_handle).show();
}

pub fn hide_panel(app_handle: AppHandle<Wry>) {
    get_panel(app_handle).hide();
}

pub fn toggle_panel(app_handle: AppHandle<Wry>) {
    let panel = get_panel(app_handle.clone());

    if panel.is_visible() {
        hide_panel(app_handle);
    } else {
        show_panel(app_handle);
    }
}
