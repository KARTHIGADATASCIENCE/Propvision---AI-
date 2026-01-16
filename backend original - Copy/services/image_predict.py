import numpy as np
from utils.preprocess import preprocess_image

# Attempt to use tf_keras (legacy Keras 2) for loading older models in TF 2.16+
try:
    import tf_keras
    from tf_keras.models import load_model
    from tf_keras.layers import DepthwiseConv2D
    USING_TF_KERAS = True
    print("Using tf_keras for legacy model support.")
except ImportError:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.layers import DepthwiseConv2D
    USING_TF_KERAS = False
    print("tf_keras not found, using standard tensorflow.keras.")

MODEL_PATH = "model/keras_model.h5"
LABELS_PATH = "model/labels.txt"

# Fix Keras 3 compatibility issue with DepthwiseConv2D 'groups' argument
class UpdatedDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        if 'groups' in kwargs:
            kwargs.pop('groups')
        super().__init__(*args, **kwargs)

# Load model once
try:
    if USING_TF_KERAS:
        # tf_keras is Keras 2, usually doesn't need the patch but we provide custom_objects anyway for safety
        model = load_model(
            MODEL_PATH,
            custom_objects={'DepthwiseConv2D': UpdatedDepthwiseConv2D},
            compile=False
        )
    else:
        # Keras 3 requires safe_mode=False for older H5 models
        model = load_model(
            MODEL_PATH, 
            custom_objects={'DepthwiseConv2D': UpdatedDepthwiseConv2D},
            compile=False,
            safe_mode=False
        )
    print("Model loaded successfully.")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

# Load labels (ORDER IS CRITICAL)
with open(LABELS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]


def predict_issue(image_file):
    """
    Predict issue type and confidence from image
    """
    image_array = preprocess_image(image_file)
    predictions = model.predict(image_array)

    class_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][class_index])
    issue = class_names[class_index]

    return issue, confidence
