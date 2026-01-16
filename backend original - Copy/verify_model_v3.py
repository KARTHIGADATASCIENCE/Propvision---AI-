import numpy as np
import os
import sys

# Attempt to use tf_keras
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

# Fix Keras 3 compatibility issue
class UpdatedDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        if 'groups' in kwargs:
            kwargs.pop('groups')
        super().__init__(*args, **kwargs)

try:
    if USING_TF_KERAS:
        model = load_model(
            MODEL_PATH,
            custom_objects={'DepthwiseConv2D': UpdatedDepthwiseConv2D},
            compile=False
        )
    else:
        model = load_model(
            MODEL_PATH, 
            custom_objects={'DepthwiseConv2D': UpdatedDepthwiseConv2D},
            compile=False,
            safe_mode=False
        )
    print("SUCCESS: Model loaded")
    
    # Test a dummy prediction to ensure Sequential.call works
    dummy_input = np.zeros((1, 224, 224, 3))
    # We need to check the actual input shape of the model
    input_shape = model.input_shape
    print(f"Model input shape: {input_shape}")
    
    # Adjust dummy input if needed
    if len(input_shape) == 4:
         dummy_input = np.zeros((1, input_shape[1], input_shape[2], input_shape[3]))
    
    pred = model.predict(dummy_input)
    print("SUCCESS: Prediction works")
    
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
