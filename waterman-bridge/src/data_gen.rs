use arrow::array::{Array, Float64Array, Int32Array};
use arrow::datatypes::{Field, Schema, DataType};
use arrow::record_batch::RecordBatch;

pub struct DataGenerator{
    fields: Vec<Field>,
}

impl DataGenerator{
    pub fn new() -> Self{
        Self{
            fields: Self::default_fields(),
        }
    }
    pub fn default_fields() -> Vec<Field> {
        vec![
            Field::new("timestamp", DataType::Int64, false),
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

    pub fn generate_record_batch(&self, num_rows: usize) -> RecordBatch {
        let schema = Schema::new(self.fields.clone());
        
        // Create arrays for each field
        let mut arrays: Vec<Box<dyn Array>> = Vec::new();
        
        for field in &self.fields {
            match field.data_type() {
                DataType::Int32 => {
                    let values = (0..num_rows).map(|i| i as i32).collect::<Vec<_>>();
                    arrays.push(Box::new(Int32Array::from(values)));
                },
                DataType::Int64 => {
                    let values = (0..num_rows).map(|i| i as i64).collect::<Vec<_>>();
                    arrays.push(Box::new(arrow::array::Int64Array::from(values)));
                },
                DataType::Float64 => {
                    let values = (0..num_rows).map(|i| i as f64).collect::<Vec<_>>();
                    arrays.push(Box::new(Float64Array::from(values)));
                },
                // Add support for other data types as needed
                _ => {
                    // Default to Int32 for unsupported types
                    let values = (0..num_rows).map(|i| i as i32).collect::<Vec<_>>();
                    arrays.push(Box::new(Int32Array::from(values)));
                }
            }
        }
        
        // Create record batch with schema and arrays
        RecordBatch::try_new(
            std::sync::Arc::new(schema),
            arrays.into_iter().map(|array| array.into()).collect(),
        ).unwrap()
    }

}