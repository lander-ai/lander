use std::{cmp, path::PathBuf};
use tauri::{
    AppHandle, GlobalShortcutManager, Manager, PhysicalPosition, PhysicalSize, Position, Size,
    State, WindowEvent, Wry,
};
use tauri_plugin_store::{with_store, StoreCollection};

#[cfg(target_os = "macos")]
use cocoa::appkit::NSApplicationActivationPolicy;

pub fn handle_open_settings_window(app_handle: AppHandle<Wry>, view: Option<String>) {
    #[cfg(target_os = "macos")]
    crate::util::set_activation_policy(
        NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular,
    );

    if let Some(settings_window) = app_handle.get_window("settings") {
        app_handle.get_window("main").unwrap().hide().unwrap();
        settings_window.show().unwrap();
        settings_window.set_focus().unwrap();
    } else {
        app_handle.get_window("main").unwrap().hide().unwrap();

        let mut window_name = String::from("settings.html");

        if let Some(view) = view {
            window_name.push_str(&format!("?view={}", view));
        }

        let mut settings_window_builder = tauri::WindowBuilder::new(
            &app_handle,
            "settings",
            tauri::WindowUrl::App(window_name.into()),
        );

        settings_window_builder = settings_window_builder
            .visible(false)
            .title("Lander")
            .transparent(true);

        #[cfg(target_os = "macos")]
        {
            settings_window_builder =
                settings_window_builder.title_bar_style(tauri::TitleBarStyle::Visible);
        }

        let settings_window = settings_window_builder.build().unwrap();

        if let Some(monitor) = settings_window.current_monitor().unwrap() {
            let monitor_size = monitor.size();

            let window_width = cmp::min((monitor_size.width as f64 * 0.8).round() as u32, 2500);
            let window_height = cmp::min((monitor_size.height as f64 * 0.7).round() as u32, 1400);

            settings_window
                .set_size(Size::Physical(PhysicalSize {
                    width: window_width,
                    height: window_height,
                }))
                .unwrap();

            #[cfg(target_os = "macos")]
            settings_window
                .set_position(Position::Physical(PhysicalPosition {
                    x: ((monitor_size.width / 2) - (window_width / 2)) as i32,
                    y: ((monitor_size.height / 2) - (window_height / 2)) as i32,
                }))
                .unwrap();

            #[cfg(target_os = "windows")]
            settings_window
                .set_position(Position::Physical(PhysicalPosition {
                    x: ((monitor_size.width / 2) - (window_width / 2)) as i32,
                    y: ((monitor_size.height / 2) - (window_height / 2) - 32) as i32,
                }))
                .unwrap();
        }

        settings_window.on_window_event(move |event| match event {
            WindowEvent::Destroyed { .. } => {
                #[cfg(target_os = "macos")]
                crate::util::set_activation_policy(
                    NSApplicationActivationPolicy::NSApplicationActivationPolicyAccessory,
                );
            }
            _ => (),
        });
    }
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn open_settings_window(app_handle: AppHandle<Wry>, view: Option<String>) {
    handle_open_settings_window(app_handle, view);
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub async fn open_settings_window(app_handle: AppHandle<Wry>, view: Option<String>) {
    handle_open_settings_window(app_handle, view);
}

#[tauri::command]
pub fn register_main_window_hotkey(
    app_handle: AppHandle<Wry>,
    stores: State<StoreCollection<Wry>>,
    hotkey: String,
) {
    with_store(
        app_handle.clone(),
        stores,
        PathBuf::from("settings.json"),
        |store| {
            let prev_hotkey = match store.get("main_window_hotkey") {
                Some(value) => Some(value.as_str().unwrap()),
                None => None,
            };

            if let Some(prev_hotkey) = prev_hotkey {
                app_handle
                    .global_shortcut_manager()
                    .unregister(&prev_hotkey)
                    .unwrap_or_default();
            }

            app_handle
                .global_shortcut_manager()
                .register(&hotkey, move || {
                    crate::panel::toggle_panel(app_handle.clone());
                })
                .unwrap_or_default();

            Ok(())
        },
    )
    .unwrap();
}

#[tauri::command]
pub fn fetch_user(app_handle: AppHandle<Wry>) {
    app_handle.emit_all("fetch_user_response", "").unwrap();
}
