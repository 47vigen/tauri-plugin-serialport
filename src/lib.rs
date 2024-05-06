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

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod err;
mod models;
mod state;

#[cfg(desktop)]
use desktop::Serialport;
#[cfg(mobile)]
use mobile::Serialport;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the serialport APIs.
pub trait SerialportExt<R: Runtime> {
    fn serialport(&self) -> &Serialport<R>;
}

impl<R: Runtime, T: Manager<R>> crate::SerialportExt<R> for T {
    fn serialport(&self) -> &Serialport<R> {
        self.state::<Serialport<R>>().inner()
    }
}

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
        .setup(|app, api| {
            #[cfg(mobile)]
            let serialport = mobile::init(app, api)?;
            #[cfg(desktop)]
            let serialport: Serialport<R> = desktop::init(app, api)?;
            app.manage(serialport);

            // manage state so it is accessible by the commands
            app.manage(SerialPortState {
                serialports: Arc::new(Mutex::new(HashMap::new())),
            });
            Ok(())
        })
        .build()
}
