"""
Database models and initialization for ether.fi data storage
Supports both SQLite (development) and PostgreSQL (production)
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, BigInteger, DateTime, Text, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL - defaults to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./etherfi_data.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ========= Models =========

class PriceHistory(Base):
    """Historical price data for ether.fi products"""
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(10), nullable=False, index=True)  # 'eETH', 'weETH', 'ETHFI', 'eBTC'
    price = Column(Float, nullable=False)
    timestamp = Column(BigInteger, nullable=False, index=True)  # Unix timestamp
    source = Column(String(50), nullable=False)  # 'defillama', 'coingecko', etc.
    confidence = Column(Float, nullable=True)  # Confidence score from API
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('product', 'timestamp', 'source', name='_product_timestamp_source_uc'),)


class APYHistory(Base):
    """Historical APY data for ether.fi products"""
    __tablename__ = "apy_history"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(10), nullable=False, index=True)
    apy_base = Column(Float, nullable=True)  # Base APY from staking
    apy_reward = Column(Float, nullable=True)  # Reward APY
    apy_total = Column(Float, nullable=True)  # Total APY
    tvl_usd = Column(Float, nullable=True)  # Total Value Locked in USD
    timestamp = Column(BigInteger, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('product', 'timestamp', name='_product_timestamp_uc'),)


class PriceForecast(Base):
    """AI-generated price forecasts"""
    __tablename__ = "price_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(10), nullable=False, index=True)
    forecast_timestamp = Column(BigInteger, nullable=False)  # When prediction is for
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    reasoning = Column(Text, nullable=True)  # AI reasoning
    model_version = Column(String(50), nullable=True)  # Claude model used
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # When prediction was made


class MarketMetrics(Base):
    """General market metrics and metadata"""
    __tablename__ = "market_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(50), nullable=False, index=True)  # 'eth_price', 'total_tvl', etc.
    value = Column(Float, nullable=False)
    extra_data = Column(Text, nullable=True)  # JSON string for additional data (renamed from 'metadata')
    timestamp = Column(BigInteger, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ========= Database Functions =========

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DATABASE_URL}")


def get_db():
    """Get database session - use with dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def reset_db():
    """Drop all tables and recreate - USE WITH CAUTION!"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete")


if __name__ == "__main__":
    # Initialize database when run directly
    init_db()
    print("Database tables created successfully!")
