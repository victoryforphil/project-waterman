use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DataType {
    Float32,
    Float64,
    Int32,
    Array,
    NestedObject,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SignalPattern {
    SineWave,
    RandomNoise,
    StepFunction,
    ImpulseResponse,
    Mixed,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TestDuration {
    Short,      // 10s
    Medium,     // 100s
    Long,       // 1000s
    Hour,       // 3600s
    OpenEnded,  // Runs until stopped
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DataVolumeParams {
    pub num_channels: usize,            // 1, 10, 100, 1000
    pub float_precision: f64,           // 1e4, 1e8, 1e16, 1e32
    pub data_rate_hz: f64,              // 50Hz, 500Hz, 50kHz
    pub test_duration: TestDuration,    // 10s, 100s, 1000s, 3600s, open-ended
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DataCharacteristicsParams {
    pub data_type: DataType,
    pub include_missing_data: bool,
    pub include_data_gaps: bool,
    pub signal_pattern: SignalPattern,
    pub include_outliers: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WebSocketParams {
    pub batch_size: usize,                  // points per message
    pub message_size: usize,                // bytes (0 = auto)
    pub message_frequency: f64,             // may differ from data_rate
    pub simulate_disconnects: bool,
    pub simulate_latency: bool,
    pub latency_ms: u64,                    // when simulating latency
    pub disconnection_probability: f64,     // 0.0-1.0
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Parameters {
    pub data_volume: DataVolumeParams,
    pub data_characteristics: DataCharacteristicsParams,
    pub websocket: WebSocketParams,
}

pub type ParametersHandle = Arc<Mutex<Parameters>>;

impl Default for DataVolumeParams {
    fn default() -> Self {
        Self {
            num_channels: 10,
            float_precision: 1e8,
            data_rate_hz: 100.0,
            test_duration: TestDuration::Medium,
        }
    }
}

impl Default for DataCharacteristicsParams {
    fn default() -> Self {
        Self {
            data_type: DataType::Float64,
            include_missing_data: false,
            include_data_gaps: false,
            signal_pattern: SignalPattern::SineWave,
            include_outliers: false,
        }
    }
}

impl Default for WebSocketParams {
    fn default() -> Self {
        Self {
            batch_size: 10,
            message_size: 0,  // Auto
            message_frequency: 100.0,
            simulate_disconnects: false,
            simulate_latency: false,
            latency_ms: 0,
            disconnection_probability: 0.0,
        }
    }
}

impl Default for Parameters {
    fn default() -> Self {
        Self {
            data_volume: DataVolumeParams::default(),
            data_characteristics: DataCharacteristicsParams::default(),
            websocket: WebSocketParams::default(),
        }
    }
}

impl Parameters {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn as_handle(self) -> ParametersHandle {
        Arc::new(Mutex::new(self))
    }
    
    // Utility methods to help update parameters
    pub fn get_data_rate_hz(&self) -> f64 {
        self.data_volume.data_rate_hz
    }
    
    pub fn get_test_duration_seconds(&self) -> Option<u64> {
        match self.data_volume.test_duration {
            TestDuration::Short => Some(10),
            TestDuration::Medium => Some(100),
            TestDuration::Long => Some(1000),
            TestDuration::Hour => Some(3600),
            TestDuration::OpenEnded => None,
        }
    }
    
    pub fn should_simulate_network_issues(&self) -> bool {
        self.websocket.simulate_disconnects || self.websocket.simulate_latency
    }
}    