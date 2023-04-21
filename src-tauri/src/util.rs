use cocoa::appkit::{NSApplication, NSApplicationActivationPolicy};
use cocoa::base::{nil, NO};
use objc::{msg_send, sel, sel_impl};

#[cfg(target_os = "macos")]
pub fn set_activation_policy(policy: NSApplicationActivationPolicy) {
    let app = unsafe { NSApplication::sharedApplication(nil) };

    let success: bool = unsafe {
        let _: () = msg_send![app, setActivationPolicy: policy];
        app.activateIgnoringOtherApps_(NO);
        true
    };

    if !success {
        eprintln!("Failed to set activation policy");
    }
}
