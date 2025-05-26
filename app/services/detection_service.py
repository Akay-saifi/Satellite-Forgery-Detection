# should be in app/services/
from PIL import Image
import numpy as np
import time
import tensorflow as tf
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load model at startup
try:
    # Dynamically build the correct model path
    current_dir = os.path.dirname(os.path.abspath(__file__))
   
   # model_path = os.path.join('/content/satellite_forgery/Copy of my_trained_models.h5')


    model_path = os.path.join('app/Copy of my_trained_model.h5')



    model_path = os.path.normpath(model_path)  # Normalize path for Windows

    model = tf.keras.models.load_model(model_path)
    logger.info("Model loaded successfully")
    logger.info(f"Model input shape: {model.input_shape}")
    logger.info(f"Model output shape: {model.output_shape}")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    raise


def predict_with_model(image):
    """Make prediction using the AI model"""
    try:
        # Reshape for model input (add batch dimension)
        input_array = np.expand_dims(image, axis=0)
        
        # Make prediction
        prediction = model.predict(input_array, verbose=0)
        
        # For binary classification (single output neuron)
        confidence = float(prediction[0][0])  # Assuming sigmoid activation
        is_authentic = confidence < 0.5  # Adjust threshold if needed
        
        return {
            "authentic": is_authentic,
            "confidence": confidence if is_authentic else 1 - confidence,
            "anomalies": []  # Placeholder for future multi-class
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise

async def process_image(upload_file):
    start_time = time.time()
    try:
        # Convert to PIL Image
        image = Image.open(upload_file.file)
        
        # Preprocessing
        processed_image = preprocess_image(image)
        
        # Make prediction
        ai_result = predict_with_model(processed_image)
        
        return {
            "is_authentic": ai_result["authentic"],
            "confidence": ai_result["confidence"],
            "anomalies": ai_result["anomalies"],
            "processing_time": time.time() - start_time
        }
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        raise

def preprocess_image(image):
    """Preprocess image for model input"""
    try:
        # Resize to match model's expected input
        image = image.resize((256, 256))  # Make sure 256x256 is correct for your model
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Normalize pixel values
        return np.array(image) / 255.0
    
    except Exception as e:
        logger.error(f"Preprocessing error: {str(e)}")
        raise
