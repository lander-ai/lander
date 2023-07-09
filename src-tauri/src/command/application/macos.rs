use accessibility::{AXAttribute, AXUIElement};
use accessibility_sys::{
    kAXChildrenAttribute, kAXComboBoxRole, kAXFocusedAttribute, kAXFocusedUIElementAttribute,
    kAXRoleAttribute, kAXSelectedTextAttribute, kAXTextAreaRole, kAXTextFieldRole,
    kAXValueAttribute,
};
use block::ConcreteBlock;
use cocoa::appkit::NSApplicationActivationPolicy;
use cocoa::foundation::NSInteger;
use cocoa::{base::nil, foundation::NSUInteger};

use core_foundation::{
    array::CFArray,
    base::{FromVoid, TCFType, ToVoid},
    boolean::CFBoolean,
    string::CFString,
};
use directories::ProjectDirs;
use objc::{
    msg_send,
    runtime::{Class, Object},
    sel, sel_impl,
};
use plist::{Dictionary, Value};
use std::sync::Mutex;
use std::{
    ffi::c_void,
    process::{Command, Stdio},
};
use std::{fs, path::Path, path::PathBuf};

use crate::command::application::Application;

#[derive(Default)]
pub struct State(pub Mutex<Option<()>>);

fn search_for_applications(path: &Path) -> Vec<PathBuf> {
    use regex::Regex;

    if path.display().to_string().ends_with(".app") {
        vec![path.to_path_buf()]
    } else {
        fs::read_dir(path)
            .unwrap()
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.path())
            .flat_map(
                |subpath| match (subpath.is_dir(), subpath.display().to_string()) {
                    (true, path_str) if path_str.ends_with(".app") => vec![subpath],
                    (true, path_str) if !Regex::new(r"\.[a-z]*$").unwrap().is_match(&path_str) => {
                        search_for_applications(&subpath)
                    }
                    _ => vec![],
                },
            )
            .collect()
    }
}

fn get_key_from_plist(plist: &Dictionary, key: &str) -> Option<String> {
    plist
        .get(key)
        .and_then(|property| property.as_string())
        .and_then(|property| Some(property.to_string()))
}

fn get_plist(path: &Path) -> Dictionary {
    Value::from_file(path.to_str().unwrap().to_owned() + "/Contents/Info.plist")
        .unwrap()
        .as_dictionary()
        .unwrap()
        .clone()
}

fn get_application_from_path(path: &Path) -> Application {
    let plist = get_plist(path);

    let bundle_id = get_key_from_plist(&plist, "CFBundleIdentifier").unwrap_or("".to_string());

    let name = path
        .to_str()
        .unwrap()
        .split("/")
        .last()
        .unwrap()
        .replace(".app", "")
        .to_string();

    let icon = get_icon_path(path).unwrap().display().to_string();

    let path = path.to_str().unwrap().to_string();

    Application {
        id: bundle_id,
        name,
        icon,
        path,
        selected_text: None,
        focused_text: None,
    }
}

pub fn get_application_paths() -> Vec<PathBuf> {
    vec![
        Path::new("/System/Library/CoreServices/Finder.app"),
        Path::new("/Applications/"),
        Path::new("/System/Applications/"),
    ]
    .iter()
    .flat_map(|path| search_for_applications(path))
    .collect::<Vec<_>>()
}

fn get_icon_path(application_path: &Path) -> Option<PathBuf> {
    if let Some(project_dir) = ProjectDirs::from("com", "lander", "Lander") {
        let project_data_path = project_dir.data_local_dir();
        let project_icons_path = project_data_path.join("application-data/icons");

        let plist = get_plist(&application_path);
        let bundle_id = get_key_from_plist(&plist, "CFBundleIdentifier").unwrap();

        let icon_path = &project_icons_path.join(bundle_id + &".png");

        Some(icon_path.to_path_buf())
    } else {
        None
    }
}

fn get_icon_icns_path(application_path: &Path) -> Option<PathBuf> {
    let plist = get_plist(&application_path);

    let path = application_path.to_str().unwrap();

    if let Some(icon_file) = get_key_from_plist(&plist, "CFBundleIconFile") {
        let icon_path =
            path.to_owned() + &"/Contents/Resources/" + &icon_file.replace(".icns", "") + &".icns";

        Some(Path::new(&icon_path).to_path_buf())
    } else {
        None
    }
}

fn save_icon_as_png(icns_path: &Path, output_path: &Path) {
    Command::new("sips")
        .arg("-s")
        .arg("format")
        .arg("png")
        .arg(icns_path)
        .arg("--out")
        .arg(output_path.join("icon.png"))
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("failed to execute process");
}

fn store_icons(app_handle: tauri::AppHandle) {
    if let Some(project_dir) = ProjectDirs::from("com", "lander", "Lander") {
        let project_data_path = project_dir.data_local_dir();
        let project_icons_path = project_data_path.join("application-data/icons");

        if fs::create_dir_all(&project_icons_path).is_ok() {
            let application_paths = get_application_paths();

            for application_path in application_paths {
                if let Some(application_icon_path) = get_icon_icns_path(&application_path) {
                    if let Some(project_icon_path) = get_icon_path(&application_path) {
                        save_icon_as_png(&application_icon_path, &project_icon_path);
                    }
                }
            }

            let bundled_icons_path = app_handle
                .path_resolver()
                .resolve_resource("assets/application-data/icons")
                .expect("failed to resolve resource");

            fs::read_dir(bundled_icons_path)
                .unwrap()
                .filter_map(|entry| entry.ok())
                .map(|entry| entry.path())
                .for_each(|application_icon_path| {
                    if let Some(icon_file) = application_icon_path.file_name() {
                        fs::copy(
                            &application_icon_path,
                            project_icons_path.to_str().unwrap().to_owned()
                                + &"/"
                                + icon_file.to_str().unwrap(),
                        )
                        .unwrap();
                    }
                })
        }
    }
}

pub fn get_installed_applications(_app_handle: tauri::AppHandle) -> Vec<Application> {
    let application_paths = get_application_paths();

    let mut applications: Vec<Application> = application_paths
        .iter()
        .map(|path| get_application_from_path(&path))
        .filter(|application| application.id != "com.lander.Lander")
        .collect::<Vec<_>>();

    applications.sort_unstable_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    applications
}

pub fn launch_application(id: &str, _app_handle: tauri::AppHandle) {
    Command::new("open")
        .arg("-b")
        .arg(id)
        .spawn()
        .expect("failed to execute process");
}

pub fn get_focused_ns_application() -> Option<*mut Object> {
    unsafe {
        let workspace_class = Class::get("NSWorkspace").unwrap();
        let shared_workspace: *mut Object = msg_send![workspace_class, sharedWorkspace];
        let frontmost_application: *mut Object = msg_send![shared_workspace, frontmostApplication];

        if frontmost_application.is_null() {
            None
        } else {
            Some(frontmost_application)
        }
    }
}

pub fn get_path_from_ns_application(ns_application: *mut Object) -> Option<String> {
    unsafe {
        let executable_url: *mut Object = msg_send![ns_application, executableURL];
        let path: *mut Object = msg_send![executable_url, path];
        let utf8_string_ptr: *const std::os::raw::c_char =
            msg_send![path, fileSystemRepresentation];

        if utf8_string_ptr.is_null() {
            None
        } else {
            let executable_path_string = std::ffi::CStr::from_ptr(utf8_string_ptr)
                .to_string_lossy()
                .into_owned();

            let extension_index = executable_path_string.find(".app")?;

            Some(executable_path_string[0..=extension_index + 3].to_string())
        }
    }
}

fn search_for_focused_element(element: &AXUIElement) -> Option<AXUIElement> {
    let children: CFArray =
        match element.attribute(&AXAttribute::new(&CFString::new(kAXChildrenAttribute))) {
            Ok(val) => val.downcast::<CFArray>().unwrap(),
            Err(_) => return None,
        };

    for child in children.get_all_values() {
        let ax_element =
            unsafe { AXUIElement::from_void(ToVoid::<*const c_void>::to_void(&child.clone())) };

        let is_focused =
            match ax_element.attribute(&AXAttribute::new(&CFString::new(kAXFocusedAttribute))) {
                Ok(val) => val.downcast::<CFBoolean>() == Some(CFBoolean::true_value()),
                Err(_) => false,
            };

        if is_focused {
            return Some(ax_element.to_owned());
        }

        if let Some(ax_element) = search_for_focused_element(&ax_element) {
            return Some(ax_element.to_owned());
        };
    }

    None
}

fn get_selected_text_from_ns_application(ns_application: *mut Object) -> Option<String> {
    let pid: i32 = unsafe { msg_send![ns_application, processIdentifier] };

    let focused_app = AXUIElement::application(pid);

    let focused_element = match focused_app.attribute(&AXAttribute::new(&CFString::new(
        kAXFocusedUIElementAttribute,
    ))) {
        Ok(val) => val.downcast::<AXUIElement>().unwrap(),
        Err(_) => {
            if let Some(focused_element) = search_for_focused_element(&focused_app) {
                focused_element
            } else {
                return None;
            }
        }
    };

    let selected_text = match focused_element
        .attribute(&AXAttribute::new(&CFString::new(kAXSelectedTextAttribute)))
    {
        Ok(val) => val.downcast::<CFString>().unwrap().to_string(),
        Err(_) => {
            return None;
        }
    };

    if selected_text.is_empty() {
        return None;
    }

    return Some(selected_text);
}

fn get_focused_element_text_value_from_ns_application(
    ns_application: *mut Object,
) -> Option<String> {
    let pid: i32 = unsafe { msg_send![ns_application, processIdentifier] };

    let focused_app = AXUIElement::application(pid);

    let focused_element = match focused_app.attribute(&AXAttribute::new(&CFString::new(
        kAXFocusedUIElementAttribute,
    ))) {
        Ok(val) => val.downcast::<AXUIElement>().unwrap(),
        Err(_) => {
            if let Some(focused_element) = search_for_focused_element(&focused_app) {
                focused_element
            } else {
                return None;
            }
        }
    };

    let element_role =
        match focused_element.attribute(&AXAttribute::new(&CFString::new(kAXRoleAttribute))) {
            Ok(val) => val.downcast::<CFString>().unwrap().to_string(),
            Err(_) => {
                return None;
            }
        };

    if element_role != kAXTextFieldRole
        && element_role != kAXTextAreaRole
        && element_role != kAXComboBoxRole
    {
        return None;
    }

    let text = match focused_element.attribute(&AXAttribute::new(&CFString::new(kAXValueAttribute)))
    {
        Ok(val) => val.downcast::<CFString>().unwrap().to_string(),
        Err(_) => {
            return None;
        }
    };

    return Some(text);
}

pub fn get_focused_application(_app_handle: tauri::AppHandle) -> Option<Application> {
    let ns_application = get_focused_ns_application()?;
    let application_path = get_path_from_ns_application(ns_application)?;

    let mut application = get_application_from_path(Path::new(&application_path));

    if application.id == "com.lander.Lander" {
        return None;
    }

    application.selected_text = get_selected_text_from_ns_application(ns_application);
    application.focused_text = get_focused_element_text_value_from_ns_application(ns_application);

    Some(application)
}

fn inject_accessibility_permissions(pid: i32) {
    let focused_app = AXUIElement::application(pid);

    focused_app
        .set_attribute(
            &AXAttribute::new(&CFString::new("AXEnhancedUserInterface")),
            CFBoolean::true_value().into_CFType(),
        )
        .unwrap_or_default();

    focused_app
        .set_attribute(
            &AXAttribute::new(&CFString::new("AXManualAccessibility")),
            CFBoolean::true_value().into_CFType(),
        )
        .unwrap_or_default();
}

fn register_application_accessibility_listener() {
    unsafe {
        let workspace_class = Class::get("NSWorkspace").unwrap();
        let shared_workspace: *mut Object = msg_send![workspace_class, sharedWorkspace];

        let running_applications: *mut Object = msg_send![shared_workspace, runningApplications];
        let count: NSUInteger = msg_send![running_applications, count];

        for index in 0..count {
            let app: *mut Object = msg_send![running_applications, objectAtIndex: index];
            let pid: i32 = msg_send![app, processIdentifier];
            let activation_policy: NSInteger = msg_send![app, activationPolicy];

            if activation_policy
                == NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular as NSInteger
            {
                inject_accessibility_permissions(pid);
            }
        }

        let notification_center: *mut Object = msg_send![shared_workspace, notificationCenter];

        let nsstring_class = Class::get("NSString").unwrap();

        let did_launch_application_notification: *mut Object = msg_send![
            nsstring_class,
            stringWithUTF8String: b"NSWorkspaceDidLaunchApplicationNotification\0".as_ptr() as *const _
        ];

        let nsworkspace_application_user_info_key: *mut Object = msg_send![
            nsstring_class,
            stringWithUTF8String: b"NSWorkspaceApplicationKey\0".as_ptr() as *const _
        ];

        let block = ConcreteBlock::new(move |notification: *mut Object| {
            let user_info: *mut Object = msg_send![notification, userInfo];
            let app: *mut Object = msg_send![
                user_info,
                objectForKey: nsworkspace_application_user_info_key
            ];
            let pid: i32 = msg_send![app, processIdentifier];

            inject_accessibility_permissions(pid);
        });

        let block = block.copy();

        let _: () = msg_send![
            notification_center,
            addObserverForName: did_launch_application_notification
            object: nil
            queue: nil
            usingBlock: block
        ];
    }
}

pub fn setup(app_handle: tauri::AppHandle) {
    store_icons(app_handle);
    register_application_accessibility_listener();
}
