use cocoa::appkit::{NSApplication, NSApplicationActivationPolicy};
use cocoa::base::{nil, NO};
use objc::{msg_send, sel, sel_impl};

#[cfg(target_os = "macos")]
pub fn set_activation_policy(policy: NSApplicationActivationPolicy) {
    unsafe {
        let app = NSApplication::sharedApplication(nil);
        let _: () = msg_send![app, setActivationPolicy: policy];
        app.activateIgnoringOtherApps_(NO);
    }
}
