mod application;

pub fn setup(app_handle: tauri::AppHandle) {
    application::setup(app_handle);
}

#[tauri::command]
pub fn get_installed_applications() -> String {
    let applications = application::get_installed_applications();
    let serialized_result = serde_json::to_string(&applications).expect("error deserializing json");
    serialized_result
}

#[tauri::command]
pub fn get_focused_application() -> String {
    let application = application::get_focused_application();
    let serialized_result = serde_json::to_string(&application).expect("error deserializing json");
    serialized_result
}

#[tauri::command]
pub fn launch_application(app_handle: tauri::AppHandle, id: &str) {
    crate::panel::hide_panel(app_handle);
    application::launch_application(id);
}

#[tauri::command]
pub fn copy_text_to_clipboard(text: &str) {
    application::copy_text_to_clipboard(text);
}

#[tauri::command]
pub fn get_text_from_clipboard() -> String {
    application::get_text_from_clipboard()
}

#[tauri::command]
pub fn insert_text(app_handle: tauri::AppHandle, text: &str) {
    application::insert_text(app_handle, text);
}

#[tauri::command]
pub fn replace_text(app_handle: tauri::AppHandle, text: &str) {
    application::replace_text(app_handle, text);
}
