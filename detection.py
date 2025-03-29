#should be app/rooutes/
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.detection_service import process_image
from app.schemas.detection import DetectionResult

router = APIRouter(tags=["Detection"])

@router.post("/detect", response_model=DetectionResult)
async def detect_forgery(
    image: UploadFile = File(..., description="Satellite image to analyze")
):
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "Invalid image format")
    
    try:
        # Process and get results
        result = await process_image(image)
        return result
    except Exception as e:
        raise HTTPException(500, f"Processing error: {str(e)}")
