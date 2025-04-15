use arrow::array::{Array, Float32Array, Float64Array, Int32Array, UInt64Array, BooleanArray, ListArray, StructArray};
use arrow::datatypes::{Field, Schema, DataType, Fields};
use arrow::record_batch::RecordBatch;
use crate::parameters::{DataType as WsDataType, SignalPattern, Parameters};
use std::sync::Arc;
use std::f64::consts::PI;
use std::collections::HashMap;
use rand::Rng;
use log::{debug, error, info};
use arrow::array::ArrayRef;
use arrow::array::builder::ListBuilder;
use arrow::array::builder::Float64Builder;

pub struct DataGenerator {
    fields: Vec<Field>,
    pub parameters: Option<Parameters>,
    time_counter: f64,
}

impl DataGenerator {
    pub fn new() -> Self {
        Self {
            fields: Self::default_fields(),
            parameters: None,
            time_counter: 0.0,
        }
    }

    pub fn with_parameters(parameters: Parameters) -> Self {
        let mut generator = Self {
            fields: Vec::new(),
            parameters: Some(parameters.clone()),
            time_counter: 0.0,
        };
        
        // Configure fields based on parameters
        generator.configure_fields(&parameters);
        
        generator
    }
    
    fn configure_fields(&mut self, parameters: &Parameters) {
        self.fields.clear();
        
        // Always add timestamp field
        self.fields.push(Field::new("timestamp", DataType::UInt64, false));
        
        // Add the specified number of data channels
        let data_type = match parameters.data_characteristics.data_type {
            WsDataType::Float32 => DataType::Float32,
            WsDataType::Float64 => DataType::Float64,
            WsDataType::Int32 => DataType::Int32,
            WsDataType::Array => DataType::List(Arc::new(Field::new("item", DataType::Float64, true))),
            WsDataType::NestedObject => {
                // Create a struct field with several member fields
                let struct_fields = vec![
                    Field::new("value", DataType::Float64, false),
                    Field::new("quality", DataType::UInt64, false),
                    Field::new("timestamp", DataType::UInt64, false),
                    Field::new("valid", DataType::Boolean, false),
                ];
                DataType::Struct(Fields::from(struct_fields))
            },
        };
        
        for i in 0..parameters.data_volume.num_channels {
            let field_name = format!("channel_{}", i);
            self.fields.push(Field::new(&field_name, data_type.clone(), false));
        }
    }
    
    pub fn default_fields() -> Vec<Field> {
        vec![
            Field::new("timestamp", DataType::UInt64, false),
            Field::new("float_value", DataType::Float64, false),
            Field::new("int_value", DataType::Int32, false),
        ]
    }

    pub fn clear_fields(&mut self) {
        self.fields.clear();
    }

    pub fn add_field(&mut self, name: &str, data_type: DataType) {
        self.fields.push(Field::new(name, data_type, false));
    }

    pub fn generate_record_batch(&mut self, num_rows: usize) -> Result<RecordBatch, arrow::error::ArrowError> {
        // If parameters are available, use them to configure fields
        if let Some(params) = &self.parameters {
            let params_clone = params.clone();
            self.configure_fields(&params_clone);
        }
        
        let schema = Schema::new(self.fields.clone());
        
        // Create arrays for each field
        let mut arrays: Vec<Arc<dyn Array>> = Vec::new();
        
        // Special handling for timestamp field
        let timestamp_values: Vec<u64> = (0..num_rows)
            .map(|i| self.get_timestamp(i))
            .collect();
        arrays.push(Arc::new(UInt64Array::from(timestamp_values)));
        
        // Generate other arrays based on field types
        for i in 1..self.fields.len() {
            let field = &self.fields[i];
            match self.generate_array_for_field(field, num_rows) {
                Ok(array) => arrays.push(array),
                Err(e) => {
                    let field_info = format!(
                        "field: {}, type: {:?}, position: {}",
                        field.name(),
                        field.data_type(),
                        i
                    );
                    error!("Failed to generate array. {}", field_info);
                    error!("Error details: {}", e);
                    return Err(arrow::error::ArrowError::InvalidArgumentError(
                        format!("Failed to generate array for {}. {}", field_info, e)
                    ));
                }
            }
        }
        
        // Increment time counter for next batch
        self.time_counter += num_rows as f64;
        
        // Create record batch with schema and arrays
        let result = RecordBatch::try_new(Arc::new(schema), arrays);
        
        match &result {
            Ok(_) => info!("Successfully generated record batch with {} rows", num_rows),
            Err(e) => error!("Failed to create record batch: {}", e),
        }
        
        result
    }
    
    fn get_timestamp(&self, row_index: usize) -> u64 {
        // Generate timestamp based on row index
        let base_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        
        // If we have parameters, use data rate to compute appropriate time increments
        if let Some(params) = &self.parameters {
            let time_increment = (1000.0 / params.data_volume.data_rate_hz) as u64;
            base_time + row_index as u64 * time_increment
        } else {
            // Default 10ms increments
            base_time + row_index as u64 * 10
        }
    }
    
    fn generate_array_for_field(&self, field: &Field, num_rows: usize) -> Result<Arc<dyn Array>, arrow::error::ArrowError> {
        match field.data_type() {
            DataType::Int32 => {
                Ok(Arc::new(Int32Array::from(self.generate_int32_values(num_rows))))
            },
            DataType::UInt64 => {
                Ok(Arc::new(UInt64Array::from(self.generate_uint64_values(num_rows))))
            },
            DataType::Float32 => {
                Ok(Arc::new(Float32Array::from(self.generate_float32_values(num_rows))))
            },
            DataType::Float64 => {
                Ok(Arc::new(Float64Array::from(self.generate_float64_values(num_rows))))
            },
            DataType::List(field) => {
                self.generate_list_array(num_rows, field)
            },
            DataType::Struct(fields) => {
                self.generate_struct_array(num_rows, fields)
            },
            _ => {
                // Default to Int32 for unsupported types
                Ok(Arc::new(Int32Array::from(self.generate_int32_values(num_rows))))
            }
        }
    }
    
    fn generate_float64_values(&self, num_rows: usize) -> Vec<f64> {
        if let Some(params) = &self.parameters {
            let float_precision = params.data_volume.float_precision;
            
            // Generate pattern-based values
            match params.data_characteristics.signal_pattern {
                SignalPattern::SineWave => {
                    (0..num_rows)
                        .map(|i| self.sine_wave_value(i, float_precision))
                        .collect()
                },
                SignalPattern::RandomNoise => {
                    (0..num_rows)
                        .map(|_| self.random_noise_value(float_precision))
                        .collect()
                },
                SignalPattern::StepFunction => {
                    (0..num_rows)
                        .map(|i| self.step_function_value(i, float_precision))
                        .collect()
                },
                SignalPattern::ImpulseResponse => {
                    (0..num_rows)
                        .map(|i| self.impulse_response_value(i, float_precision))
                        .collect()
                },
                SignalPattern::Mixed => {
                    (0..num_rows)
                        .map(|i| self.mixed_pattern_value(i, float_precision))
                        .collect()
                }
            }
        } else {
            // Default to simple counter
            (0..num_rows).map(|i| i as f64).collect()
        }
    }
    
    fn generate_float32_values(&self, num_rows: usize) -> Vec<f32> {
        // Convert float64 values to float32
        self.generate_float64_values(num_rows)
            .into_iter()
            .map(|v| v as f32)
            .collect()
    }
    
    fn generate_int32_values(&self, num_rows: usize) -> Vec<i32> {
        if let Some(params) = &self.parameters {
            // Generate pattern-based values
            match params.data_characteristics.signal_pattern {
                SignalPattern::SineWave => {
                    (0..num_rows)
                        .map(|i| self.sine_wave_value(i, 100.0) as i32)
                        .collect()
                },
                SignalPattern::RandomNoise => {
                    (0..num_rows)
                        .map(|_| rand::thread_rng().gen_range(-100..100))
                        .collect()
                },
                SignalPattern::StepFunction => {
                    (0..num_rows)
                        .map(|i| self.step_function_value(i, 100.0) as i32)
                        .collect()
                },
                SignalPattern::ImpulseResponse => {
                    (0..num_rows)
                        .map(|i| self.impulse_response_value(i, 100.0) as i32)
                        .collect()
                },
                SignalPattern::Mixed => {
                    (0..num_rows)
                        .map(|i| self.mixed_pattern_value(i, 100.0) as i32)
                        .collect()
                }
            }
        } else {
            // Default to simple counter
            (0..num_rows).map(|i| i as i32).collect()
        }
    }
    
    fn generate_uint64_values(&self, num_rows: usize) -> Vec<u64> {
        (0..num_rows).map(|i| i as u64).collect()
    }
    
    fn generate_list_array(&self, num_rows: usize, inner_field: &Arc<Field>) -> Result<Arc<dyn Array>, arrow::error::ArrowError> {
        // Define constant for list size
        const LIST_SIZE: usize = 10;
        
        // Create a builder for the list values (Float64)
        let mut values_builder = Float64Builder::with_capacity(num_rows * LIST_SIZE);
        
        // Create a builder for the list offsets
        let mut list_builder = ListBuilder::new(values_builder);
        
        if let Some(params) = &self.parameters {
            match params.data_characteristics.signal_pattern {
                SignalPattern::SineWave => {
                    for i in 0..num_rows {
                        for j in 0..LIST_SIZE {
                            let value = self.sine_wave_value(i * LIST_SIZE + j, params.data_volume.float_precision);
                            list_builder.values().append_value(value);
                        }
                        list_builder.append(true);
                    }
                },
                SignalPattern::RandomNoise => {
                    for _ in 0..num_rows {
                        for _ in 0..LIST_SIZE {
                            let value = self.random_noise_value(params.data_volume.float_precision);
                            list_builder.values().append_value(value);
                        }
                        list_builder.append(true);
                    }
                },
                SignalPattern::StepFunction => {
                    for i in 0..num_rows {
                        for j in 0..LIST_SIZE {
                            let value = self.step_function_value(i * LIST_SIZE + j, params.data_volume.float_precision);
                            list_builder.values().append_value(value);
                        }
                        list_builder.append(true);
                    }
                },
                SignalPattern::ImpulseResponse => {
                    for i in 0..num_rows {
                        for j in 0..LIST_SIZE {
                            let value = self.impulse_response_value(i * LIST_SIZE + j, params.data_volume.float_precision);
                            list_builder.values().append_value(value);
                        }
                        list_builder.append(true);
                    }
                },
                SignalPattern::Mixed => {
                    for i in 0..num_rows {
                        for j in 0..LIST_SIZE {
                            let value = self.mixed_pattern_value(i * LIST_SIZE + j, params.data_volume.float_precision);
                            list_builder.values().append_value(value);
                        }
                        list_builder.append(true);
                    }
                }
            }
        } else {
            // Default pattern if no parameters set
            for i in 0..num_rows {
                for j in 0..LIST_SIZE {
                    let value = (i * LIST_SIZE + j) as f64;
                    list_builder.values().append_value(value);
                }
                list_builder.append(true);
            }
        }
        
        // Finish building the array
        Ok(Arc::new(list_builder.finish()))
    }
    
    fn generate_struct_array(&self, num_rows: usize, fields: &Fields) -> Result<Arc<dyn Array>, arrow::error::ArrowError> {
        // Create arrays for each field in the struct
        let mut child_arrays: Vec<Arc<dyn Array>> = Vec::new();
        let mut field_names: Vec<String> = Vec::new();
        let mut field_types: Vec<DataType> = Vec::new();
        
        // Generate data for each field in the struct
        for field in fields.iter() {
            field_names.push(field.name().clone());
            field_types.push(field.data_type().clone());
            
            let array = match field.data_type() {
                DataType::Float64 => {
                    // Generate value field
                    Arc::new(Float64Array::from(self.generate_float64_values(num_rows))) as Arc<dyn Array>
                },
                DataType::UInt64 => {
                    // For quality and timestamp
                    if field.name() == "quality" {
                        // Quality values (0-100)
                        let values: Vec<u64> = (0..num_rows)
                            .map(|_| rand::thread_rng().gen_range(0..100))
                            .collect();
                        Arc::new(UInt64Array::from(values)) as Arc<dyn Array>
                    } else {
                        // Timestamp field
                        let values: Vec<u64> = (0..num_rows)
                            .map(|i| self.get_timestamp(i))
                            .collect();
                        Arc::new(UInt64Array::from(values)) as Arc<dyn Array>
                    }
                },
                DataType::Boolean => {
                    // For valid field
                    let values: Vec<bool> = (0..num_rows)
                        .map(|_| rand::thread_rng().gen_bool(0.95)) // 95% valid data
                        .collect();
                    Arc::new(BooleanArray::from(values)) as Arc<dyn Array>
                },
                _ => {
                    // Default for any other fields
                    Arc::new(Int32Array::from(self.generate_int32_values(num_rows))) as Arc<dyn Array>
                }
            };
            
            child_arrays.push(array);
        }
        
        // Create struct field with children
        let struct_fields: Vec<Arc<Field>> = field_names.iter().zip(field_types.iter())
            .map(|(name, data_type)| Arc::new(Field::new(name, data_type.clone(), false)))
            .collect();
        
        // Create child data
        let child_data: Vec<(Arc<Field>, Arc<dyn Array>)> = struct_fields.into_iter()
            .zip(child_arrays.into_iter())
            .collect();
        
        // Create a struct array from the field arrays
        let struct_array = StructArray::from(child_data);
        Ok(Arc::new(struct_array))
    }
    
    // Signal pattern generators
    fn sine_wave_value(&self, index: usize, amplitude: f64) -> f64 {
        let adj_index = (self.time_counter + index as f64) as f64;
        amplitude * (adj_index * 0.1).sin()
    }
    
    fn random_noise_value(&self, amplitude: f64) -> f64 {
        let mut rng = rand::thread_rng();
        rng.gen_range(-amplitude..amplitude)
    }
    
    fn step_function_value(&self, index: usize, amplitude: f64) -> f64 {
        let adj_index = (self.time_counter + index as f64) as f64;
        if (adj_index / 10.0).floor() % 2.0 == 0.0 {
            amplitude
        } else {
            0.0
        }
    }
    
    fn impulse_response_value(&self, index: usize, amplitude: f64) -> f64 {
        let adj_index = (self.time_counter + index as f64) as f64;
        let x = adj_index % 100.0;
        if x < 1.0 {
            amplitude
        } else {
            amplitude * (-0.1 * x).exp()
        }
    }
    
    fn mixed_pattern_value(&self, index: usize, amplitude: f64) -> f64 {
        let adj_index = (self.time_counter + index as f64) as f64;
        let sine = (adj_index * 0.1).sin();
        let noise = rand::thread_rng().gen_range(-0.2..0.2);
        amplitude * (sine + noise)
    }
}