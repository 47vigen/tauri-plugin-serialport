use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use state::SerialPortState;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

pub use models::*;

mod commands;
mod err;
mod models;
mod state;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("serialport")
        .invoke_handler(tauri::generate_handler![
            commands::available_ports,
            commands::cancel_read,
            commands::close,
            commands::close_all,
            commands::force_close,
            commands::open,
            commands::read,
            commands::write,
            commands::write_binary,
        ])
        .setup(move |app, _webview| {
            app.manage(SerialPortState {
                serialports: Arc::new(Mutex::new(HashMap::new())),
            });
            Ok(())
        })
        .build()
}
