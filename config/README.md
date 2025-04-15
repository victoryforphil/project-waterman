# Waterman Bridge Configuration

This directory contains configuration files for the Waterman Bridge application.

## parameters.yaml

The `parameters.yaml` file contains the configuration parameters that control the behavior of the data stream generator. These parameters are organized into three main sections:

### Data Volume Parameters

Controls the volume and rate of data generation:

- `num_channels`: Number of data channels to generate (1, 10, 100, 1000)
- `float_precision`: Precision of floating point values (e.g., 1e8 = 100,000,000.0)
- `data_rate_hz`: Rate at which data points are generated in Hz (e.g., 100.0 = 100 points per second)
- `test_duration`: Duration of the test run (Short = 10s, Medium = 100s, Long = 1000s, Hour = 3600s, OpenEnded = runs until stopped)

### Data Characteristics Parameters

Controls the characteristics of the generated data:

- `data_type`: Type of data to generate (Float32, Float64, Int32, Array, NestedObject)
- `include_missing_data`: Whether to simulate missing data points
- `include_data_gaps`: Whether to simulate gaps in the data stream
- `signal_pattern`: Pattern of the generated signal (SineWave, RandomNoise, StepFunction, ImpulseResponse, Mixed)
- `include_outliers`: Whether to include outlier values in the data

### WebSocket Parameters

Controls the WebSocket server behavior:

- `batch_size`: Number of data points to include in each WebSocket message
- `message_size`: Size of WebSocket messages in bytes (0 = automatic)
- `message_frequency`: Frequency of WebSocket messages in Hz
- `simulate_disconnects`: Whether to simulate random disconnections
- `simulate_latency`: Whether to simulate network latency
- `latency_ms`: Amount of simulated latency in milliseconds
- `disconnection_probability`: Probability of disconnection (0.0-1.0)

