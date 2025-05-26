

#should be app/rooutes/
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.detection_service import process_image  # Fixed import path
from app.schemas.ddetection import DetectionResult  # Fixed typo in "detection"
from app.config import settings  # Import configuration

router = APIRouter(tags=["Detection"])

@router.post("/detect", response_model=DetectionResult)
async def detect_forgery(
    image: UploadFile = File(..., description="Satellite image to analyze")
):
    # Validate file type using config
    if image.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_MIME_TYPES}"
        )

    # Validate file size
    if image.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    try:
        result = await process_image(image)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Processing error: {str(e)}" )
        