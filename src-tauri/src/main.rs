use std::path::PathBuf;
use tauri::{Manager, PhysicalSize, Size, Theme, Wry};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::{with_store, StoreCollection};

#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

mod command;
mod panel;
mod settings;
mod stream;
mod util;

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(panel::State::default())
        .manage(stream::State::default())
        .invoke_handler(tauri::generate_handler![
            panel::init_panel,
            panel::show_panel,
            panel::hide_panel,
            panel::toggle_panel,
            settings::open_settings_window,
            settings::register_main_window_hotkey,
            settings::fetch_user,
            stream::stream,
            stream::cancel_stream,
            command::get_installed_applications,
            command::get_focused_application,
            command::launch_application,
            command::copy_text_to_clipboard,
            command::get_text_from_clipboard,
            command::insert_text,
            command::replace_text,
        ])
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            command::setup(app.app_handle());

            with_store(
                app.app_handle(),
                app.state::<StoreCollection<Wry>>(),
                PathBuf::from("store.dat"),
                |store| {
                    let theme = match store.get("theme") {
                        Some(theme) => {
                            let value = theme.as_str().unwrap();

                            if value == "Dark" {
                                Some(Theme::Dark)
                            } else if value == "Light" {
                                Some(Theme::Light)
                            } else {
                                None
                            }
                        }
                        None => None,
                    };

                    let main_window = tauri::WindowBuilder::new(
                        app,
                        "main",
                        tauri::WindowUrl::App("index.html".into()),
                    )
                    .accept_first_mouse(true)
                    .decorations(false)
                    .fullscreen(false)
                    .focused(false)
                    .visible(false)
                    .resizable(false)
                    .transparent(true)
                    .skip_taskbar(true)
                    .theme(theme)
                    .build()
                    .unwrap();

                    if let Some(monitor) = main_window.current_monitor().unwrap() {
                        let monitor_size = monitor.size();

                        // TODO: Add max and min sizes
                        main_window
                            .set_size(Size::Physical(PhysicalSize {
                                width: (monitor_size.width as f64 * 0.5).round() as u32,
                                height: (monitor_size.height as f64 * 0.45).round() as u32,
                            }))
                            .unwrap();
                    }

                    main_window.center().unwrap();

                    #[cfg(target_os = "macos")]
                    apply_vibrancy(
                        &main_window,
                        NSVisualEffectMaterial::UnderWindowBackground,
                        None,
                        Some(12.0),
                    )
                    .expect("error applying vibrancy");

                    #[cfg(target_os = "windows")]
                    apply_blur(&window, Some((18, 18, 18, 125))).expect("error applying vibrancy");

                    let get_installed_applications_request_window_listener = main_window.clone();
                    main_window.listen("get_installed_applications_request", move |_event| {
                        let payload = command::get_installed_applications();
                        get_installed_applications_request_window_listener
                            .emit("get_installed_applications_response", payload)
                            .unwrap();
                    });

                    Ok(())
                },
            )
            .unwrap();

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}