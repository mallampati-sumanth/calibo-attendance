# WSGI entry point for deployment (Render, Gunicorn, etc.)
import os
from app import app as application

# For local development, load environment variables
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

if __name__ == "__main__":
    application.run()
