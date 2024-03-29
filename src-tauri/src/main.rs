#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;
use std::sync::Arc;
use std::{cmp, fs};
use tauri::{Manager, PhysicalPosition, PhysicalSize, Position, Size, Theme, Wry};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::{with_store, StoreCollection};
use webdriver_install::Driver;

mod command;
mod cortex;
mod panel;
mod settings;
mod stream;
mod util;

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::AppleScript,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(panel::State::default())
        .manage(stream::State::default())
        .manage(command::application::State::default())
        .invoke_handler(tauri::generate_handler![
            panel::init_panel,
            panel::show_panel,
            panel::hide_panel,
            panel::toggle_panel,
            util::print,
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
            cortex::google_search
        ])
        .setup(move |app| {
            #[cfg(not(debug_assertions))]
            {
                let updater_app_handle = app.app_handle().clone();

                tauri::async_runtime::spawn(async move {
                    let check_for_updates = async move {
                        loop {
                            let builder = tauri::updater::builder(updater_app_handle.clone())
                                .target(if cfg!(target_os = "macos") {
                                    "darwin-universal".to_string()
                                } else {
                                    tauri::updater::target().unwrap()
                                });

                            if let Ok(update) = builder.check().await {
                                if update.is_update_available() {
                                    update.download_and_install().await.unwrap();
                                    updater_app_handle.restart();
                                }
                            }

                            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
                        }
                    };

                    tokio::spawn(check_for_updates);
                });
            }

            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            command::setup(app.app_handle());

            with_store(
                app.app_handle(),
                app.state::<StoreCollection<Wry>>(),
                PathBuf::from("settings.json"),
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

                        let window_width =
                            cmp::min((monitor_size.width as f64 * 0.6).round() as u32, 1800);
                        let window_height =
                            cmp::min((monitor_size.height as f64 * 0.5).round() as u32, 1000);

                        main_window
                            .set_size(Size::Physical(PhysicalSize {
                                width: window_width,
                                height: window_height,
                            }))
                            .unwrap();

                        main_window
                            .set_position(Position::Physical(PhysicalPosition {
                                x: ((monitor_size.width / 2) - (window_width / 2)) as i32,
                                y: (((monitor_size.height as f32) * 0.4)
                                    - ((window_height / 2) as f32))
                                    as i32,
                            }))
                            .unwrap();
                    }

                    #[cfg(target_os = "windows")]
                    {
                        let window_blur_app_handle = app.app_handle().clone();
                        main_window.on_window_event(move |event| {
                            if matches!(event, tauri::WindowEvent::Focused(false)) {
                                panel::hide_panel(window_blur_app_handle.clone());
                            }
                        });
                    }

                    #[cfg(target_os = "windows")]
                    {
                        let focused_application_app_handle = app.app_handle().clone();
                        let focused_application_main_window = main_window.clone();

                        tauri::async_runtime::spawn(async move {
                            let set_focused_window = async move {
                                loop {
                                    if let Ok(is_window_visible) =
                                        focused_application_main_window.is_visible()
                                    {
                                        if !is_window_visible {
                                            command::application::windows::set_focused_application(
                                                focused_application_app_handle.clone(),
                                            )
                                            .await;
                                        } else {
                                            tokio::time::sleep(tokio::time::Duration::from_millis(
                                                100,
                                            ))
                                            .await;
                                        }
                                    }
                                }
                            };

                            tokio::spawn(set_focused_window);
                        });
                    }

                    let app_cache_dir = app.path_resolver().app_cache_dir().unwrap();
                    let webdriver_dir = app_cache_dir.join("webdrivers");
                    fs::create_dir_all(&webdriver_dir).unwrap();

                    if !webdriver_dir.join("chromedriver").exists() {
                        Driver::Chrome.install_into(webdriver_dir.clone()).unwrap();
                    }

                    if !webdriver_dir.join("geckodriver").exists() {
                        Driver::Gecko.install_into(webdriver_dir.clone()).unwrap();
                    }

                    Ok(())
                },
            )
            .unwrap();

            let get_installed_applications_request_app_handle = Arc::new(app.app_handle().clone());
            app.listen_global("get_installed_applications_request", move |_event| {
                let app_handle = Arc::clone(&get_installed_applications_request_app_handle);

                tauri::async_runtime::spawn(async move {
                    let payload =
                        command::get_installed_applications(app_handle.as_ref().clone()).await;

                    app_handle
                        .as_ref()
                        .emit_all("get_installed_applications_response", payload)
                        .unwrap();
                });
            });

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
