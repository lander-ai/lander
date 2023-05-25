use futures::StreamExt;
use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Client,
};
use serde_json::{json, Value};
use std::{collections::HashMap, sync::Mutex};
use tauri::{AppHandle, Manager, Wry};

#[derive(Default)]
pub struct Store {
    is_canceled: bool,
}

#[derive(Default)]
pub struct State(pub Mutex<Store>);

#[tauri::command]
pub async fn stream(
    app_handle: AppHandle<Wry>,
    url: String,
    body: Option<String>,
    headers: Option<String>,
) -> Option<String> {
    app_handle.state::<State>().0.lock().unwrap().is_canceled = false;

    let window = app_handle.get_window("main").unwrap();

    let client = Client::new();
    let mut request = client.post(url);

    if let Some(body) = body {
        request = request.body(body);
    }

    if let Some(headers) = headers {
        let headers_json: Value = serde_json::from_str(&headers).unwrap();

        let mut header_map = HeaderMap::new();
        if let Value::Object(map) = headers_json {
            for (key, value) in map {
                if let Value::String(s) = value {
                    header_map.insert(
                        HeaderName::from_bytes(key.as_bytes()).unwrap(),
                        HeaderValue::from_str(&s).unwrap(),
                    );
                }
            }
        }

        request = request.headers(header_map);
    }

    let response = match request.send().await {
        Ok(res) => res,
        Err(_) => {
            window.emit("stream", "[LANDER_STREAM_ERROR]").unwrap();
            return None;
        }
    };

    let headers = response.headers().clone();
    let mut header_map = HashMap::new();
    for (key, value) in headers.iter() {
        header_map.insert(key.to_string(), value.to_str().unwrap_or("").to_string());
    }

    let response_json = json!({
        "headers": header_map,
    });

    if !response.status().is_success() {
        window.emit("stream", "[LANDER_STREAM_ERROR]").unwrap();
        return Some(response_json.to_string());
    }

    tokio::task::spawn(async move {
        let mut stream = response.bytes_stream();

        while let Some(item) = stream.next().await {
            if app_handle.state::<State>().0.lock().unwrap().is_canceled {
                break;
            }

            match item {
                Ok(bytes) => {
                    let data = std::str::from_utf8(&bytes).unwrap();
                    window.emit("stream", data).unwrap();
                }
                Err(_) => {
                    window.emit("stream", "[LANDER_STREAM_ERROR]").unwrap();
                }
            }
        }

        window.emit("stream", "[END]").unwrap();
    });

    return Some(response_json.to_string());
}

#[tauri::command]
pub async fn cancel_stream(app_handle: AppHandle<Wry>) {
    app_handle.state::<State>().0.lock().unwrap().is_canceled = true;
}
