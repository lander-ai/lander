extern crate clipboard;

use clipboard::{ClipboardContext, ClipboardProvider};
use rdev::{simulate, EventType, Key};
use serde::{Deserialize, Serialize};
use std::{thread, time};

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
use macos as application;

#[cfg(target_os = "windows")]
pub mod windows;
#[cfg(target_os = "windows")]
use self::windows as application;

pub use application::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Application {
    id: String,
    name: String,
    icon: String,
    path: String,
    selected_text: Option<String>,
    focused_text: Option<String>,
}

pub async fn get_installed_applications(app_handle: tauri::AppHandle) -> Vec<Application> {
    #[cfg(target_os = "macos")]
    return application::get_installed_applications(app_handle);

    #[cfg(target_os = "windows")]
    application::get_installed_applications(app_handle).await
}

pub fn launch_application(id: &str, app_handle: tauri::AppHandle) {
    application::launch_application(id, app_handle);
}

pub fn setup(app_handle: tauri::AppHandle) {
    application::setup(app_handle);
}

pub fn get_focused_application(app_handle: tauri::AppHandle) -> Option<Application> {
    application::get_focused_application(app_handle)
}

fn send_key(event_type: &EventType) {
    simulate(event_type).unwrap_or_default();
    thread::sleep(time::Duration::from_millis(20));
}

pub fn copy_text_to_clipboard(text: &str) {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    ctx.set_contents(text.to_owned()).unwrap();
}

fn paste_text() {
    #[cfg(target_os = "macos")]
    send_key(&EventType::KeyPress(Key::MetaLeft));
    #[cfg(not(target_os = "macos"))]
    send_key(&EventType::KeyPress(Key::ControlLeft));

    send_key(&EventType::KeyPress(Key::KeyV));
    send_key(&EventType::KeyRelease(Key::KeyV));

    #[cfg(target_os = "macos")]
    send_key(&EventType::KeyRelease(Key::MetaLeft));
    #[cfg(not(target_os = "macos"))]
    send_key(&EventType::KeyRelease(Key::ControlLeft));
}

pub fn replace_text(app_handle: tauri::AppHandle, text_ptr: &str) {
    crate::panel::hide_panel(app_handle);

    thread::sleep(time::Duration::from_millis(20));

    let text = text_ptr.to_owned();

    std::thread::spawn(|| {
        thread::sleep(time::Duration::from_millis(20));

        let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
        let prev_clipboard_contents = match ctx.get_contents() {
            Ok(val) => val,
            Err(_) => "".to_string(),
        };

        ctx.set_contents(text).unwrap();

        paste_text();

        thread::sleep(time::Duration::from_millis(400));

        ctx.set_contents(prev_clipboard_contents).unwrap();
    });
}

pub fn insert_text(app_handle: tauri::AppHandle, text_ptr: &str) {
    crate::panel::hide_panel(app_handle);

    thread::sleep(time::Duration::from_millis(20));

    let text = text_ptr.to_owned();

    std::thread::spawn(|| {
        thread::sleep(time::Duration::from_millis(20));

        let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
        let prev_clipboard_contents = match ctx.get_contents() {
            Ok(val) => val,
            Err(_) => "".to_string(),
        };

        ctx.set_contents(text).unwrap();

        send_key(&EventType::KeyPress(Key::RightArrow));
        send_key(&EventType::KeyPress(Key::Return));
        send_key(&EventType::KeyPress(Key::Return));

        paste_text();

        thread::sleep(time::Duration::from_millis(400));

        ctx.set_contents(prev_clipboard_contents).unwrap();
    });
}

pub fn get_text_from_clipboard() -> String {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();

    match ctx.get_contents() {
        Ok(val) => val,
        Err(_) => "".to_string(),
    }
}
