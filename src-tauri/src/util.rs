#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
use macos as util;

#[cfg(target_os = "macos")]
use cocoa::appkit::NSApplicationActivationPolicy;

#[cfg(target_os = "macos")]
pub fn set_activation_policy(policy: NSApplicationActivationPolicy) {
    util::set_activation_policy(policy)
}

#[tauri::command]
pub fn print(data: String) {
    println!("{data}");
}
