use fantoccini::ClientBuilder;
use std::{
    io::{BufRead, BufReader},
    path::PathBuf,
    process::{Child, Command, Stdio},
};

#[derive(Debug, PartialEq)]
enum Webdriver {
    Chrome,
    Firefox,
}

async fn start_webdriver(webdriver_dir: &PathBuf, driver: Webdriver, port: u16) -> Child {
    let mut server = match driver {
        Webdriver::Chrome => Command::new(webdriver_dir.join("chromedriver"))
            .args([&format!("--port={}", port)])
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to spawn chromedriver"),
        Webdriver::Firefox => Command::new(webdriver_dir.join("geckodriver"))
            .args(["--port", &port.to_string()])
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to spawn geckodriver"),
    };

    if let Some(ref mut stdout) = server.stdout {
        let stdout = BufReader::new(stdout);
        for line in stdout.lines() {
            let line = line.expect("error reading line from stdout");

            if driver == Webdriver::Chrome && line.contains("was started successfully") {
                break;
            }

            if driver == Webdriver::Firefox && line.contains("Listening on") {
                break;
            }
        }
    }

    server
}

#[tauri::command]
pub async fn google_search(
    app_handle: tauri::AppHandle,
    driver_name: String,
    query: String,
) -> Result<String, String> {
    let port = portpicker::pick_unused_port().unwrap();

    let driver = match driver_name.as_str() {
        "chrome" => Webdriver::Chrome,
        "firefox" => Webdriver::Firefox,
        _ => Webdriver::Firefox,
    };

    let app_cache_dir = app_handle.path_resolver().app_cache_dir().unwrap();
    let webdriver_dir = app_cache_dir.join("webdrivers");
    let mut webdriver_server = start_webdriver(&webdriver_dir, driver, port).await;

    let webdriver_server_url = format!("http://localhost:{}", port);

    let mut caps = serde_json::map::Map::new();

    let chrome_opts = serde_json::json!({ "args": ["--headless", "--disable-gpu"] });
    caps.insert("goog:chromeOptions".to_string(), chrome_opts.clone());

    let firefox_opts = serde_json::json!({ "args": ["--headless"] });
    caps.insert("moz:firefoxOptions".to_string(), firefox_opts.clone());

    let client = ClientBuilder::native()
        .capabilities(caps)
        .connect(&webdriver_server_url)
        .await
        .unwrap();

    let url = format!(
        "https://www.google.com/search?q={}",
        query.replace(" ", "%20")
    );

    client.goto(&url).await.unwrap();

    let mut result = "".to_string();

    client
        .wait()
        .for_element(fantoccini::Locator::Id("rso"))
        .await
        .unwrap();
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    let mut element = client
        .find(fantoccini::Locator::Css(
            "[data-attrid=\"wa:/description\"]",
        ))
        .await;

    if element.is_err() {
        // places
        element = client.find(fantoccini::Locator::Css(".zIGF1d")).await;
    }

    if element.is_err() {
        // places
        element = client.find(fantoccini::Locator::Css(".VT5Tde")).await;
    }

    if element.is_err() {
        // graph
        element = client.find(fantoccini::Locator::Css(".xpdopen")).await;
    }

    if element.is_err() {
        // featured
        element = client
            .find(fantoccini::Locator::Css("#rso > div:nth-child(1)"))
            .await;
    }

    if element.is_err() {
        // sports standings & weather
        element = client.find(fantoccini::Locator::Css(".wDYxhc")).await;
    }

    if element.is_err() {
        // first query result
        element = client
            .find(fantoccini::Locator::Css(".kvH3mc .Z26q7c:nth-child(2)"))
            .await;
    }

    if element.is_err() {
        element = client.find(fantoccini::Locator::Css(".wxSJCb")).await;
    }

    if let Ok(element) = element {
        result = element.text().await.unwrap();
    }

    client.close().await.unwrap();
    webdriver_server.kill().unwrap();

    if !result.is_empty() {
        Ok(result)
    } else {
        Err("No featured snippet".into())
    }
}
