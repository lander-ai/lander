use std::{cmp, path::PathBuf};
use tauri::{
    AppHandle, GlobalShortcutManager, Manager, PhysicalPosition, PhysicalSize, Position, Size,
    State, WindowEvent, Wry,
};
use tauri_plugin_store::{with_store, StoreCollection};

#[cfg(target_os = "macos")]
use cocoa::appkit::NSApplicationActivationPolicy;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[tauri::command]
pub fn open_settings_window(app_handle: AppHandle<Wry>) {
    #[cfg(target_os = "macos")]
    crate::util::set_activation_policy(
        NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular,
    );

    if let Some(settings_window) = app_handle.get_window("settings") {
        settings_window.set_focus().unwrap();
    } else {
        let settings_window = tauri::WindowBuilder::new(
            &app_handle,
            "settings",
            tauri::WindowUrl::App("settings.html".into()),
        )
        .visible(false)
        .title("Lander")
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .resizable(false)
        .transparent(true)
        .build()
        .unwrap();

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

            settings_window
                .set_position(Position::Physical(PhysicalPosition {
                    x: ((monitor_size.width / 2) - (window_width / 2)) as i32,
                    y: ((monitor_size.height / 2) - (window_height / 2)) as i32,
                }))
                .unwrap();
        }

        #[cfg(target_os = "macos")]
        apply_vibrancy(
            &settings_window,
            NSVisualEffectMaterial::UnderWindowBackground,
            None,
            Some(12.0),
        )
        .expect("error applying vibrancy");

        #[cfg(target_os = "windows")]
        apply_blur(&window, Some((18, 18, 18, 125))).expect("error applying vibrancy");

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

#[tauri::command]
pub fn register_main_window_hotkey(
    app_handle: AppHandle<Wry>,
    stores: State<StoreCollection<Wry>>,
    hotkey: String,
) {
    with_store(
        app_handle.clone(),
        stores,
        PathBuf::from("store.dat"),
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
                    crate::panel::toggle_panel(app_handle.app_handle());
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
