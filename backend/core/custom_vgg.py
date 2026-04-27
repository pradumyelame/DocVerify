import tensorflow as tf
from tensorflow.keras import layers, models

def build_custom_vgg(input_shape=(224, 224, 3), num_classes=1000, include_top=True):
    """
    Builds a custom CNN architecture similar to VGG16.
    """
    model = models.Sequential(name="custom_vgg")

    # Block 1
    model.add(layers.Conv2D(64, (3, 3), activation='relu', padding='same', input_shape=input_shape, name='block1_conv1'))
    model.add(layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='block1_conv2'))
    model.add(layers.MaxPooling2D((2, 2), strides=(2, 2), name='block1_pool'))

    # Block 2
    model.add(layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='block2_conv1'))
    model.add(layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='block2_conv2'))
    model.add(layers.MaxPooling2D((2, 2), strides=(2, 2), name='block2_pool'))

    # Block 3
    model.add(layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv1'))
    model.add(layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv2'))
    model.add(layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv3'))
    model.add(layers.MaxPooling2D((2, 2), strides=(2, 2), name='block3_pool'))

    # Block 4
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv1'))
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv2'))
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv3'))
    model.add(layers.MaxPooling2D((2, 2), strides=(2, 2), name='block4_pool'))

    # Block 5
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv1'))
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv2'))
    model.add(layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv3'))
    model.add(layers.MaxPooling2D((2, 2), strides=(2, 2), name='block5_pool'))

    if include_top:
        # Classification head
        model.add(layers.Flatten(name='flatten'))
        model.add(layers.Dense(4096, activation='relu', name='fc1'))
        model.add(layers.Dense(4096, activation='relu', name='fc2'))
        model.add(layers.Dense(num_classes, activation='softmax', name='predictions'))

    return model

if __name__ == "__main__":
    vgg = build_custom_vgg()
    vgg.summary()
