#should be in app/
import os

class Settings:
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE", 100))  # 100MB default
    ALLOWED_MIME_TYPES = {
        "image/png", "image/jpeg", 
        "image/tiff", "image/x-tiff"
    }

settings = Settings()
