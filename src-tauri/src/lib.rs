use log::info;
use regex::Regex;
use std::f32::MAX;
#[cfg(unix)]
use std::os::unix::process::CommandExt;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::process::{Child, Command, Stdio};
use std::sync::RwLock;
use std::{
    fs::File,
    io::{BufRead, BufReader},
    net::{TcpListener, TcpStream},
    path::PathBuf,
    thread::sleep,
    time::Duration,
};
use tauri::{Emitter, Manager, State};
use tauri_plugin_shell::ShellExt;

pub struct BackendPort(pub RwLock<u16>);
pub struct BackendLog(pub RwLock<Option<String>>);

const MAX_RETRIES: u32 = 100;

fn find_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .expect("Failed to bind to port 0")
        .local_addr()
        .unwrap()
        .port()
}

fn find_backend_pid(backend_log: PathBuf) -> u32 {
    let pid_regex = Regex::new(r"pid:\s*(\d+)").unwrap();
    loop {
        if let Ok(file) = File::open(&backend_log) {
            let reader = BufReader::new(file);
            for line_result in reader.lines().flatten() {
                if let Some(captures) = pid_regex.captures(&line_result) {
                    if let Some(matched_pid) = captures.get(1) {
                        if let Ok(pid) = matched_pid.as_str().parse::<u32>() {
                            println!("backend pid:{}", pid);
                            return pid;
                        }
                    }
                }
            }
        }

        // Wait a bit before retrying (to prevent busy-looping)
        sleep(Duration::from_millis(500));
    }
}

#[tauri::command]
fn get_backend_port(state: State<BackendPort>) -> u16 {
    *state.0.read().unwrap()
}

#[tauri::command]
fn get_backend_log(state: State<BackendLog>) -> String {
    state
        .0
        .read()
        .unwrap()
        .clone()
        .unwrap_or("unknown".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_devtools::init())
        .manage(BackendPort(RwLock::new(0)))
        .manage(BackendLog(RwLock::new(None)))
        .invoke_handler(tauri::generate_handler![get_backend_port, get_backend_log,])
        .setup(|app| {
            /*
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            */

            let window = app.get_window("main").unwrap();
            #[cfg(debug_assertions)]{
            app.get_webview_window("main").unwrap().open_devtools();
            } 
            window.hide().unwrap();

            let backend_log = app.path().app_log_dir().unwrap().join("backend.log");
            let data_dir = app.path().app_data_dir().unwrap();
            let bp = find_free_port();
            let backend_port: State<BackendPort> = app.state();
            *backend_port.0.write().unwrap() = bp;

            let blog: State<BackendLog> = app.state();
            *blog.0.write().unwrap() = Some(backend_log.to_str().unwrap().to_string());

            let backend_path = if cfg!(debug_assertions) {
                if cfg!(target_os="macos"){
                PathBuf::from("/Users/ziyuanliu/Code/stripe/matching/TechRecruiterAIForChinaBusinessFront/src-tauri/sidecar/backend-sidecar-aarch64-apple-darwin")}
                else if cfg!(target_os="windows"){
                    PathBuf::from("C:\\Users\\chili\\Downloads\\matching\\TechRecruiterAIForChinaBusinessFront\\src-tauri\\sidecar\\backend-windows.exe")
                }else {
                    return Err("not supported platform".into());
                }

            } else {
                if cfg!(target_os = "macos") {
                    app.path()
                        .resource_dir()
                        .unwrap()
                        .join("sidecar/backend-sidecar-aarch64-apple-darwin")
                } else if cfg!(target_os = "windows") {
                    app.path()
                        .resource_dir()
                        .unwrap()
                        .join("sidecar\\backend-windows.exe")
                } else {
                    return Err("not supported platform".into());
                }
            };
            /*
            let sidecar_command = app
                .shell()
                .sidecar("backend-sidecar")
                .unwrap()
                .arg(backend_log.clone())
                .arg(format!("{bp}"));
            let (mut rx, mut child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
            */
            info!("log dir:{:?}", data_dir.join("backend.log"));
            info!("backend port:{}", bp);
            info!("backend path:{:?}", backend_path);
            info!("data path:{:?}", data_dir);
            let mut cmd = Command::new(backend_path);
            cmd.arg(backend_log.clone())
                .arg(format!("{bp}"))
                .arg(data_dir.clone());

            // Redirect stdout/stderr if needed
            cmd.stdout(Stdio::piped()).stderr(Stdio::piped());
            // Set process group
            #[cfg(unix)]
            {
                unsafe {
                    cmd.pre_exec(|| {
                        libc::setpgid(0, 0); // new process group
                        Ok(())
                    });
                }
            }

            #[cfg(windows)]
            {
                const CREATE_NEW_PROCESS_GROUP: u32 = 0x00000200;
                cmd.creation_flags(CREATE_NEW_PROCESS_GROUP);
            }

            let mut child = cmd.spawn().unwrap();
            let pid = child.id();

            let stdout = child.stdout.take().unwrap();
            let stderr = child.stderr.take().unwrap();
            tauri::async_runtime::spawn(async move {
                let reader = BufReader::new(stdout);
                for line in reader.lines().flatten() {
                    info!("[backend stdout] {}", line);
                }
            });
            tauri::async_runtime::spawn(async move {
                let reader = BufReader::new(stderr);
                for line in reader.lines().flatten() {
                    info!("[backend stderr] {}", line);
                }
            });
            let _ = window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();

                    #[cfg(unix)]
                    {
                        use nix::sys::signal::{killpg, Signal};
                        use nix::unistd::Pid;
                        let _ = killpg(Pid::from_raw(pid as i32), Signal::SIGKILL);
                    }

                    #[cfg(windows)]
                    {
                        let _ = std::process::Command::new("taskkill")
                            .args(["/PID", &pid.to_string(), "/T", "/F"])
                            .output();
                    }
                    std::process::exit(0);
                }
            });

            window.show().unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
