# In backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, date
from .models import ReviewStatusEnum # Import from our models

# --- Company Schemas ---

class CompanyBase(BaseModel):
    name: str
    established_date: date

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: UUID
    users: list['User'] = []

    class Config:
        from_attributes = True

# --- User Schemas ---

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    company: CompanyCreate

class User(UserBase):
    id: UUID
    company_id: UUID

    class Config:
        from_attributes = True

# --- Token Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

# --- Operator Schemas ---

class OperatorBase(BaseModel):
    name: str
    role: str

class OperatorCreate(OperatorBase):
    pass # No extra fields on creation

class Operator(OperatorBase):
    operator_id: UUID
    
    class Config:
        from_attributes = True # Tells Pydantic to read data from ORM models

# --- Inspection Log Schemas ---

class InspectionLogBase(BaseModel):
    image_path: str
    defect_type: str
    confidence: float
    review_status: ReviewStatusEnum
    operator_id: UUID | None = None

class InspectionLogCreate(InspectionLogBase):
    pass # No extra fields on creation

class InspectionLog(InspectionLogBase):
    id: UUID
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Schema for the full operator view with their logs
class OperatorWithLogs(Operator):
    logs: list[InspectionLog] = []

# Rebuild the models to resolve the forward reference
Company.model_rebuild()

# --- Inspection Schemas ---

class Detection(BaseModel):
    prediction: str
    confidence: float
    box: list[float]

class InspectionResult(BaseModel):
    status: str
    detections: list[Detection]

class ScheduleBody(BaseModel):
    email: EmailStr
    date: str
    timeSlot: str