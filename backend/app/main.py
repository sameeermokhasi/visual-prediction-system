# In backend/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ultralytics import YOLO
from PIL import Image
from pydantic import BaseModel
import os
import io
from typing import List
from datetime import timedelta, datetime

# Database imports
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine

# Security imports
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- 0. CREATE DATABASE TABLES ---
models.Base.metadata.create_all(bind=engine)

# --- SECURITY CONFIGURATION ---
SECRET_KEY = "your-secret-key"  # Change this in a real application
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- 1. SET UP THE APP ---
app = FastAPI(title="Visual Inspection API")

# --- 2. ADD CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"], # Allow React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Password and Token Utilities ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- User Authentication Functions ---

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# --- Current User Dependency ---

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# --- 3. LOAD THE "BRAIN" ---
GOOD_CLASSES = ['polished_casting', 'unpolished_casting']

def load_model():
    try:
        model_path = os.path.join(os.path.dirname(__file__), "..", "..", "ml_pipeline", "models", "best.pt")
        if not os.path.exists(model_path):
            print(f"--- ERROR: Model file not found at {model_path} ---")
            print("--- RUNNING IN MOCK MODE (RANDOM RESULTS) ---")
            return None
        print(f"--- Loading model from: {model_path} ---")
        model = YOLO(model_path)
        print("--- Model loaded successfully ---")
        return model
    except Exception as e:
        print(f"--- ERROR loading model: {e} ---")
        return None

model = load_model()

# --- 4. DEFINE API ENDPOINTS ---

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_company = models.Company(**user.company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, company_id=db_company.id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "Welcome to the Visual Inspection API."}

@app.post("/inspect", response_model=schemas.InspectionResult)
async def inspect_image(file: UploadFile = File(...), current_user: schemas.User = Depends(get_current_user)):
    """
    Receives an image, runs detection, and returns the defect results.
    This endpoint is now PROTECTED.
    """
    if model is None:
        # MOCK MODE
        import random
        mock_defects = ['scratch', 'casting_with_burr', 'pit']
        if random.random() < 0.5:
            return {"status": "accepted", "detections": [{"prediction": "polished_casting", "confidence": random.uniform(0.9, 0.99), "box": [0.1, 0.1, 0.9, 0.9]}]}
        else:
            defect = random.choice(mock_defects)
            return {"status": "rejected", "detections": [{"prediction": defect, "confidence": random.uniform(0.7, 0.95), "box": [random.uniform(0.1, 0.4), random.uniform(0.1, 0.4), random.uniform(0.5, 0.9), random.uniform(0.5, 0.9)]}]}

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image.")
    
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        results = model(image)
        
        result = results[0]
        detections = []
        overall_status = "accepted"
        
        if len(result.boxes) == 0:
             detections.append({
                "prediction": "polished_casting", 
                "confidence": 1.0, 
                "box": [0.0, 0.0, 1.0, 1.0] # Full image
            })
        else:
            for box in result.boxes:
                class_name = result.names[int(box.cls)]
                confidence = float(box.conf)
                coords = box.xyxyn.tolist()[0]
                
                detections.append({
                    "prediction": class_name,
                    "confidence": confidence,
                    "box": coords
                })
                
                if class_name not in GOOD_CLASSES:
                    overall_status = "rejected"
        
        detections.sort(key=lambda x: x['confidence'], reverse=True)

        return {
            "status": overall_status,
            "detections": detections
        }

    except Exception as e:
        print(f"Error during inspection: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/schedule-demo")
async def schedule_demo(body: schemas.ScheduleBody):
    """
    Receives schedule data and SIMULATES sending an email.
    This endpoint is now PUBLIC.
    """
    email_to = body.email
    email_subject = "New Demo Request!"
    email_body = f"""
    You have a new demo request:
    
    Date: {body.date}
    Time Slot: {body.timeSlot}
    
    Please follow up to confirm.
    """
    
    print("--- SIMULATING EMAIL ---")
    print(f"To: {email_to}")
    print(f"Subject: {email_subject}")
    print(f"Body: {email_body}")
    print("--- END SIMULATION ---")
    
    return {"message": f"Demo scheduled for {body.date} at {body.timeSlot}. A confirmation (simulation) has been sent to {email_to}."}