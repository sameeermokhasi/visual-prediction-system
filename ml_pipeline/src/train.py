# In ml_pipeline/src/train.py

from ultralytics import YOLO
import os

def main():
    print("--- Starting Model Training ---")

    # 1. Load a pre-trained model
    # yolov8n.pt is the "nano" model: small, fast, and good for starting.
    # You can also use yolov8s.pt (small) or yolov8m.pt (medium) for better accuracy.
    model = YOLO('yolov8n.pt')

    # 2. Find our data.yaml file
    # This code finds the file, going up one directory from 'src' to 'data'
    data_config_path = os.path.join(
        os.path.dirname(__file__),  # This is the 'src' directory
        '..',                       # Go up one level (to 'ml_pipeline')
        'data',                     # Go into 'data'
        'data.yaml'                 # The file
    )
    
    print(f"Using data config: {data_config_path}")

    # 3. Train the model!
    # This is the single most important line.
    results = model.train(
        data=data_config_path,    # Path to our data map
        epochs=100,               # 100 "rounds" of training (a good start)
        imgsz=640,                # Image size (must match Roboflow export)
        batch=8,                  # How many images to process at once
        name='casting_defect_model_v1' # A name for this training run
    )

    print("--- Training Complete ---")
    print(f"Model saved to: {results.save_dir}")

if __name__ == '__main__':
    main()