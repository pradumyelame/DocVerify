import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from ..core.custom_vgg import build_custom_vgg

def train_model(data_dir, model_save_path, epochs=10, batch_size=32):
    """
    Example training script for the custom VGG model.
    """
    # 1. Prepare Data
    # In a real scenario, you'd use a real dataset directory.
    # Here we assume a directory structure like: data_dir/train/class1, data_dir/train/class2, etc.
    
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )

    # Check if directory exists
    if not os.path.exists(data_dir):
        print(f"Error: Data directory {data_dir} not found.")
        print("Falling back to dummy data for demonstration purposes...")
        # Create dummy data if needed or just skip
        return

    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = len(train_generator.class_indices)

    # 2. Build Model
    model = build_custom_vgg(input_shape=(224, 224, 3), num_classes=num_classes, include_top=True)
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # 3. Train
    print("Starting training...")
    model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // batch_size
    )

    # 4. Save Weights
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    model.save_weights(model_save_path)
    print(f"Model weights saved to {model_save_path}")

if __name__ == "__main__":
    # Example usage
    # data_path = "path/to/your/dataset"
    # output_weights = "backend/models/custom_vgg_weights.h5"
    # train_model(data_path, output_weights)
    print("To train the model, ensure you have a dataset directory and run:")
    print("python -m backend.scripts.train_model")
