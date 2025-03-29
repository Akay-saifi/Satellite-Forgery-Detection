#should be in app/schemas
from pydantic import BaseModel

class DetectionResult(BaseModel):
    is_authentic: bool
    confidence: float
    anomalies: list[str] = []
    processing_time: float
    
    class Config:
        schema_extra = {
            "example": {
                "is_authentic": False,
                "confidence": 0.92,
                "anomalies": ["clone_stamping", "metadata_mismatch"],
                "processing_time": 1.45
            }
        }
        
