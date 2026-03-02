"""
Database setup script
This script creates a fresh database or recreates tables if they have schema issues
"""

import os
import sys
from dotenv import load_dotenv
import pymysql

load_dotenv()

# Database credentials
MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'SQL@123PPa')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'interview_app_database')

def setup_database():
    """Create or reset the database"""
    try:
        # Connect to MySQL without database
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()
        
        # Drop existing database
        print(f"Dropping existing database: {MYSQL_DATABASE}")
        cursor.execute(f"DROP DATABASE IF EXISTS {MYSQL_DATABASE}")
        
        # Create new database
        print(f"Creating new database: {MYSQL_DATABASE}")
        cursor.execute(f"CREATE DATABASE {MYSQL_DATABASE}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("✅ Database setup completed successfully!")
        print(f"Database '{MYSQL_DATABASE}' is ready.")
        print("\nNow run: python app.py")
        
    except pymysql.Error as e:
        print(f"❌ MySQL Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 50)
    print("Interview App - Database Setup")
    print("=" * 50)
    setup_database()
