#should be in app/
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.detection import router as detection_router

app = FastAPI(title="Satellite Forgery Detection API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(detection_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
