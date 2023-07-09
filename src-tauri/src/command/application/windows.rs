use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Mutex;
use std::{fs, hash::Hasher, path::Path, path::PathBuf};
use tauri::api::process::CommandEvent;
use tauri::{api::process::Command, Manager};
use twox_hash::XxHash64;

use crate::command::application::Application;

#[derive(Clone, Debug, Deserialize)]
struct WindowsApplication {
    id: String,
    name: String,
    path: String,
    selected_text: Option<String>,
    uwp: bool,
}

#[derive(Default)]
pub struct Store {
    application_ids: HashMap<String, String>,
    pub focused_application: Option<Application>,
}

#[derive(Default)]
pub struct State(pub Mutex<Store>);

fn get_start_menu_app_id(application_path: &Path, app_handle: tauri::AppHandle) -> String {
    let mut hasher = XxHash64::with_seed(0);
    hasher.write(application_path.to_str().unwrap().as_bytes());
    let hash = hasher.finish();
    let id = hash.to_string();

    let state = app_handle.state::<State>();

    state
        .0
        .lock()
        .unwrap()
        .application_ids
        .insert(id, application_path.to_str().unwrap().to_string());

    hash.to_string()
}

fn get_application_data_icon_path(app_handle: tauri::AppHandle) -> Option<PathBuf> {
    if let Some(app_data_path) = app_handle.path_resolver().app_data_dir() {
        let application_data_icon_path = app_data_path.join(r"application-data\icons");
        return Some(application_data_icon_path);
    }

    None
}

fn get_application_from_windows_application(
    app_handle: tauri::AppHandle,
    windows_application: WindowsApplication,
) -> Application {
    let id = windows_application.id;

    let name = windows_application.name;

    let icon_id = if windows_application.uwp {
        id.clone()
    } else {
        get_start_menu_app_id(Path::new(&windows_application.path), app_handle.clone())
    };

    let icon = get_application_icon_path(app_handle, icon_id)
        .unwrap()
        .display()
        .to_string();

    let path = windows_application.path;

    let selected_text = windows_application.selected_text;

    Application {
        id,
        name,
        icon,
        path,
        selected_text,
        focused_text: None,
    }
}

fn get_application_icon_path(app_handle: tauri::AppHandle, app_id: String) -> Option<PathBuf> {
    if let Some(application_data_icon_path) = get_application_data_icon_path(app_handle.clone()) {
        let icon_path = &application_data_icon_path.join(app_id + &".png");

        Some(icon_path.to_path_buf())
    } else {
        None
    }
}

fn save_icon_as_png(input_path: &str, output_path: &Path) {
    Command::new_sidecar("applications")
        .expect("failed to create `applications` binary command")
        .args([
            "extract-icon",
            &format!("{}", input_path),
            &format!("{}", output_path.to_str().unwrap()),
        ])
        .spawn()
        .unwrap();
}

async fn store_icons(app_handle: tauri::AppHandle) {
    if let Some(application_data_icon_path) = get_application_data_icon_path(app_handle.clone()) {
        if fs::create_dir_all(&application_data_icon_path).is_ok() {
            let windows_applications = get_windows_applications().await;

            for windows_application in windows_applications {
                let target_icon_path = if windows_application.uwp {
                    windows_application.id.clone()
                } else {
                    windows_application.path.clone()
                };

                let icon_id = if windows_application.uwp {
                    windows_application.id
                } else {
                    get_start_menu_app_id(Path::new(&windows_application.path), app_handle.clone())
                };

                if let Some(project_icon_path) =
                    get_application_icon_path(app_handle.clone(), icon_id.clone())
                {
                    save_icon_as_png(&target_icon_path, &project_icon_path);
                }
            }
        }
    }
}

async fn get_windows_applications() -> Vec<WindowsApplication> {
    let (mut rx, _child) = Command::new_sidecar("applications")
        .expect("failed to create `applications` binary command")
        .args(vec!["list"])
        .spawn()
        .unwrap();

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(data) = event {
            let windows_applications: Vec<WindowsApplication> =
                serde_json::from_str(&data).unwrap();

            return windows_applications
                .iter()
                .filter(|application| {
                    application.name != "Lander" || application.name != "Lander (Preview)"
                })
                .cloned()
                .collect::<Vec<_>>();
        }
    }

    vec![]
}

pub async fn get_installed_applications(app_handle: tauri::AppHandle) -> Vec<Application> {
    let windows_application = get_windows_applications().await;

    return windows_application
        .iter()
        .map(|windows_application| {
            get_application_from_windows_application(
                app_handle.clone(),
                windows_application.clone(),
            )
        })
        .collect::<Vec<_>>();
}

pub fn launch_application(id: &str, app_handle: tauri::AppHandle) {
    let target = match id.parse::<f64>() {
        Ok(_) => {
            let state_binding = app_handle.state::<State>();
            let state = state_binding.0.lock().unwrap();
            state.application_ids.get(id).unwrap().to_string()
        }
        Err(_) => id.to_string(),
    };

    Command::new_sidecar("applications")
        .expect("failed to create `applications` binary command")
        .args(vec!["open", &target])
        .spawn()
        .unwrap();
}

pub fn setup(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async {
        store_icons(app_handle).await;
    });
}

pub async fn set_focused_application(app_handle: tauri::AppHandle) {
    let (mut rx, _child) = Command::new_sidecar("applications")
        .expect("failed to create `applications` binary command")
        .args(vec!["focused-application"])
        .spawn()
        .unwrap();

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(data) = event {
            if let Ok(windows_application) = serde_json::from_str::<WindowsApplication>(&data) {
                let focused_application = Some(get_application_from_windows_application(
                    app_handle.clone(),
                    windows_application,
                ));

                app_handle
                    .state::<State>()
                    .0
                    .lock()
                    .unwrap()
                    .focused_application = focused_application;
            }
        }
    }
}

pub fn get_focused_application(app_handle: tauri::AppHandle) -> Option<Application> {
    app_handle
        .clone()
        .state::<State>()
        .0
        .lock()
        .unwrap()
        .focused_application
        .clone()
}
