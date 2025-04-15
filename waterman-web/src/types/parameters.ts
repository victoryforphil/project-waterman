export enum DataType {
  Float32 = "Float32",
  Float64 = "Float64",
  Int32 = "Int32",
  Array = "Array",
  NestedObject = "NestedObject"
}

export enum SignalPattern {
  SineWave = "SineWave",
  RandomNoise = "RandomNoise",
  StepFunction = "StepFunction",
  ImpulseResponse = "ImpulseResponse",
  Mixed = "Mixed"
}

export enum TestDuration {
  Short = "Short",      // 10s
  Medium = "Medium",    // 100s
  Long = "Long",        // 1000s
  Hour = "Hour",        // 3600s
  OpenEnded = "OpenEnded" // Runs until stopped
}

export interface DataVolumeParams {
  num_channels: number;           // 1, 10, 100, 1000
  float_precision: number;        // 1e4, 1e8, 1e16, 1e32
  data_rate_hz: number;           // 50Hz, 500Hz, 50kHz
  test_duration: TestDuration;    // 10s, 100s, 1000s, 3600s, open-ended
}

export interface DataCharacteristicsParams {
  data_type: DataType;
  include_missing_data: boolean;
  include_data_gaps: boolean;
  signal_pattern: SignalPattern;
  include_outliers: boolean;
}

export interface WebSocketParams {
  batch_size: number;              // points per message
  message_size: number;            // bytes (0 = auto)
  message_frequency: number;       // may differ from data_rate
  simulate_disconnects: boolean;
  simulate_latency: boolean;
  latency_ms: number;              // when simulating latency
  disconnection_probability: number; // 0.0-1.0
}

export interface Parameters {
  data_volume: DataVolumeParams;
  data_characteristics: DataCharacteristicsParams;
  websocket: WebSocketParams;
}

export interface ServerStatus {
  time_ms: number;
  last_update_ms: number | null;
  data_rate_hz: number;
} 