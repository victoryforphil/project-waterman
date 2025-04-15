use std::collections::BTreeMap;
use crate::parameters::{Parameters, ParametersHandle};

#[derive(Debug, Clone, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct WSBridgeState{
    pub t_ms: u64,
    pub last_t_ms: Option<u64>,
    pub parameters: Parameters,
}

pub type StateHandle = std::sync::Arc<std::sync::Mutex<WSBridgeState>>;

impl Default for WSBridgeState{
    fn default() -> Self{
        Self{
            t_ms: 0,
            last_t_ms: None,
            parameters: Parameters::default(),
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
    
    pub fn get_send_rate_hz(&self) -> f64 {
        self.parameters.get_data_rate_hz()
    }
    
    pub fn set_send_rate_hz(&mut self, rate: f64) {
        self.parameters.data_volume.data_rate_hz = rate;
    }
    
    pub fn get_parameters(&self) -> Parameters {
        self.parameters.clone()
    }
    
    pub fn update_parameters(&mut self, params: Parameters) {
        self.parameters = params;
    }
}