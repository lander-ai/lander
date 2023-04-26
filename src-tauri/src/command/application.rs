extern crate clipboard;

use clipboard::{ClipboardContext, ClipboardProvider};
use rdev::{simulate, EventType, Key};
use serde::Serialize;
use std::{thread, time};

#[cfg_attr(macos, path = "macos.rs")]
mod macos;
use macos as application;

#[derive(Debug, Serialize)]
pub struct Application {
    id: String,
    name: String,
    icon: String,
    path: String,
    selected_text: Option<String>,
    focused_text: Option<String>,
}

pub fn get_installed_applications() -> Vec<Application> {
    application::get_installed_applications()
}

pub fn launch_application(id: &str) {
    application::launch_application(id);
}

pub fn setup(app_handle: tauri::AppHandle) {
    application::setup(app_handle);
}

pub fn get_focused_application() -> Option<Application> {
    application::get_focused_application()
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
