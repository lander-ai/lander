use cocoa::{
    appkit::{NSMainMenuWindowLevel, NSWindowCollectionBehavior},
    base::{id, nil, BOOL, YES},
};
use objc::{
    class,
    declare::ClassDecl,
    msg_send,
    runtime::{self, Class, Object, Protocol, Sel},
    sel, sel_impl, Message,
};
use objc_foundation::INSObject;
use objc_id::{Id, ShareId};
use tauri::{Window, Wry};

extern "C" {
    pub fn object_setClass(obj: id, cls: id) -> id;
}

#[allow(non_upper_case_globals)]
const NSWindowStyleMaskNonActivatingPanel: i32 = 1 << 7;

const CLS_NAME: &str = "Panel";

pub struct NSPanel;

impl NSPanel {
    fn get_class() -> &'static Class {
        Class::get(CLS_NAME).unwrap_or_else(Self::define_class)
    }

    fn define_class() -> &'static Class {
        let mut cls = ClassDecl::new(CLS_NAME, class!(NSPanel))
            .unwrap_or_else(|| panic!("Unable to register {} class", CLS_NAME));

        unsafe {
            cls.add_method(
                sel!(canBecomeKeyWindow),
                Self::can_become_key_window as extern "C" fn(&Object, Sel) -> BOOL,
            );
        }

        cls.register()
    }

    extern "C" fn can_become_key_window(_: &Object, _: Sel) -> BOOL {
        YES
    }
}
unsafe impl Message for NSPanel {}

impl NSPanel {
    pub fn show(&self) {
        self.make_first_responder(Some(self.content_view()));
        self.order_front_regardless();
        self.make_key_window();
    }

    pub fn hide(&self) {
        let _: () = unsafe { msg_send![self, close] };
    }

    pub fn is_visible(&self) -> bool {
        let flag: BOOL = unsafe { msg_send![self, isVisible] };
        flag == YES
    }

    fn make_key_window(&self) {
        let _: () = unsafe { msg_send![self, makeKeyWindow] };
    }

    fn order_front_regardless(&self) {
        let _: () = unsafe { msg_send![self, orderFrontRegardless] };
    }

    fn content_view(&self) -> id {
        unsafe { msg_send![self, contentView] }
    }

    fn make_first_responder(&self, sender: Option<id>) {
        if let Some(responder) = sender {
            let _: () = unsafe { msg_send![self, makeFirstResponder: responder] };
        } else {
            let _: () = unsafe { msg_send![self, makeFirstResponder: self] };
        }
    }

    fn set_level(&self, level: i32) {
        let _: () = unsafe { msg_send![self, setLevel: level] };
    }

    fn set_style_mask(&self, style_mask: i32) {
        let _: () = unsafe { msg_send![self, setStyleMask: style_mask] };
    }

    fn set_collection_behaviour(&self, behaviour: NSWindowCollectionBehavior) {
        let _: () = unsafe { msg_send![self, setCollectionBehavior: behaviour] };
    }

    fn set_delegate(&self, delegate: Option<Id<NSPanelDelegate>>) {
        if let Some(del) = delegate {
            let _: () = unsafe { msg_send![self, setDelegate: del] };
        } else {
            let _: () = unsafe { msg_send![self, setDelegate: self] };
        }
    }

    fn from(ns_window: id) -> Id<Self> {
        let ns_panel: id = unsafe { msg_send![Self::class(), class] };
        unsafe {
            object_setClass(ns_window, ns_panel);
            Id::from_retained_ptr(ns_window as *mut Self)
        }
    }
}

impl INSObject for NSPanel {
    fn class() -> &'static runtime::Class {
        NSPanel::get_class()
    }
}

const DELEGATE_CLS_NAME: &str = "PanelDelegate";

pub struct NSPanelDelegate {}

impl NSPanelDelegate {
    #[allow(dead_code)]
    fn get_class() -> &'static Class {
        Class::get(DELEGATE_CLS_NAME).unwrap_or_else(Self::define_class)
    }

    #[allow(dead_code)]
    fn define_class() -> &'static Class {
        let mut cls = ClassDecl::new(DELEGATE_CLS_NAME, class!(NSObject))
            .unwrap_or_else(|| panic!("Unable to register {} class", DELEGATE_CLS_NAME));

        cls.add_protocol(
            Protocol::get("NSWindowDelegate").expect("Failed to get NSWindowDelegate protocol"),
        );

        unsafe {
            cls.add_ivar::<id>("panel");

            cls.add_method(
                sel!(setPanel:),
                Self::set_panel as extern "C" fn(&mut Object, Sel, id),
            );

            cls.add_method(
                sel!(windowDidBecomeKey:),
                Self::window_did_become_key as extern "C" fn(&Object, Sel, id),
            );

            cls.add_method(
                sel!(windowDidResignKey:),
                Self::window_did_resign_key as extern "C" fn(&Object, Sel, id),
            );
        }

        cls.register()
    }

    extern "C" fn set_panel(this: &mut Object, _: Sel, panel: id) {
        unsafe { this.set_ivar("panel", panel) };
    }

    extern "C" fn window_did_become_key(_: &Object, _: Sel, _: id) {}

    extern "C" fn window_did_resign_key(this: &Object, _: Sel, _: id) {
        let panel: id = unsafe { *this.get_ivar("panel") };
        let _: () = unsafe { msg_send![panel, orderOut: nil] };
    }
}

unsafe impl Message for NSPanelDelegate {}

impl INSObject for NSPanelDelegate {
    fn class() -> &'static runtime::Class {
        Self::get_class()
    }
}

impl NSPanelDelegate {
    pub fn set_panel_(&self, panel: ShareId<NSPanel>) {
        let _: () = unsafe { msg_send![self, setPanel: panel] };
    }
}

pub fn create_panel(window: &Window<Wry>) -> ShareId<NSPanel> {
    let handle: id = window.ns_window().unwrap() as _;
    let panel = NSPanel::from(handle);
    let panel = panel.share();

    panel.set_level(NSMainMenuWindowLevel + 1);

    panel.set_collection_behaviour(
        NSWindowCollectionBehavior::NSWindowCollectionBehaviorTransient
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorMoveToActiveSpace
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary,
    );

    panel.set_style_mask(NSWindowStyleMaskNonActivatingPanel);

    let delegate = NSPanelDelegate::new();
    delegate.set_panel_(panel.clone());
    panel.set_delegate(Some(delegate));

    panel
}
