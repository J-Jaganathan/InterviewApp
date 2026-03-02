import os
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    
    # MySQL Database Configuration
    # URL-encode password to handle special characters like @
    mysql_user = os.getenv('MYSQL_USER', 'root')
    mysql_password = quote(os.getenv('MYSQL_PASSWORD', 'SQL@123PPa'), safe='')
    mysql_host = os.getenv('MYSQL_HOST', '127.0.0.1')
    mysql_port = os.getenv('MYSQL_PORT', '3306')
    mysql_db = os.getenv('MYSQL_DATABASE', 'interview_app_database')
    
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"
    )
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    JWT_ALGORITHM = "HS256"

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
