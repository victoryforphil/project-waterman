use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct WSBridgeState{
    pub t_ms: u64,
    pub last_t_ms: Option<u64>,
    pub send_rate_hz: f64,
}

pub type StateHandle = std::sync::Arc<std::sync::Mutex<WSBridgeState>>;

impl Default for WSBridgeState{
    fn default() -> Self{
        Self{
            t_ms: 0,
            last_t_ms: None,
            send_rate_hz: 1000.0,
        }
    }
}

impl WSBridgeState{
    pub fn new() -> Self{
        Default::default()
    }

    pub fn as_handle(self) -> StateHandle{
        std::sync::Arc::new(std::sync::Mutex::new(self))
    }

    pub fn tick(&mut self, dt_ms: u64){
        self.t_ms += dt_ms;
    }

    pub fn update_last_t(&mut self){
        self.last_t_ms = Some(self.t_ms);
    }
}