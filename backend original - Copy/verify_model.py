import os
import sys
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import DepthwiseConv2D

class UpdatedDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        if 'groups' in kwargs:
            kwargs.pop('groups')
        super().__init__(*args, **kwargs)

MODEL_PATH = "model/keras_model.h5"

try:
    model = load_model(
        MODEL_PATH, 
        custom_objects={'DepthwiseConv2D': UpdatedDepthwiseConv2D},
        compile=False,
        safe_mode=False
    )
    print("SUCCESS: Model loaded")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
