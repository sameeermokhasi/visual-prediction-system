# In backend/app/models.py
from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid
import enum
from datetime import datetime

Base = declarative_base()

class ReviewStatusEnum(str, enum.Enum):
    accepted = "accepted"
    rejected = "rejected"
    review = "review"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))

    company = relationship("Company", back_populates="users")

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    established_date = Column(Date, nullable=False)

    users = relationship("User", back_populates="company")

class Operator(Base):
    __tablename__ = "operators"
    
    operator_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    role = Column(String(50))
    
    # This creates the relationship
    logs = relationship("InspectionLog", back_populates="operator")

class InspectionLog(Base):
    __tablename__ = "inspection_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_path = Column(String(255), nullable=False)
    defect_type = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    review_status = Column(Enum(ReviewStatusEnum), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # This is the foreign key
    operator_id = Column(UUID(as_uuid=True), ForeignKey("operators.operator_id"))
    
    # This creates the relationship
    operator = relationship("Operator", back_populates="logs")