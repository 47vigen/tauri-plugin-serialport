use crate::err::Err;
use crate::models::*;
use serde::de::DeserializeOwned;
use tauri::plugin::PluginApi;
use tauri::{AppHandle, Runtime};

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> Result<Serialport<R>, Err> {
    Ok(Serialport(app.clone()))
}

/// Access to the serialport APIs.
pub struct Serialport<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Serialport<R> {
    pub fn ping(&self, payload: PingRequest) -> Result<PingResponse, Err> {
        Ok(PingResponse {
            value: payload.value,
        })
    }
}
