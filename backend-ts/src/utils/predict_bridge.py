import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # Silence TF logs
import sys
import json

# Add the original backend path to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
# src/utils/predict_bridge.py -> src/ -> backend-ts/ -> root/ -> backend original/
original_backend_path = os.path.abspath(os.path.join(current_dir, '../../../backend original'))
sys.path.append(original_backend_path)

# Change working directory so relative paths in image_predict.py work
os.chdir(original_backend_path)

import contextlib
import io

try:
    # Suppress printed messages during import/load
    with contextlib.redirect_stdout(io.StringIO()):
        from services.image_predict import predict_issue
    
    if len(sys.argv) < 2:
        sys.stderr.write("Error: No image path provided\n")
        sys.exit(1)

    image_path = sys.argv[1]
    
    # Ensure the image path is absolute before we change directory or use it
    if not os.path.isabs(image_path):
        # image_path is relative to where the TS process started it (backend-ts root)
        # but we are now in 'backend original'. So we should have used the absolute path.
        pass 

    with open(image_path, 'rb') as f:
        issue, confidence = predict_issue(f)
        print(json.dumps({"issue": issue, "confidence": float(confidence)}))

except Exception as e:
    import traceback
    sys.stderr.write(f"Python Bridge Exception: {str(e)}\n")
    sys.stderr.write(traceback.format_exc())
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
