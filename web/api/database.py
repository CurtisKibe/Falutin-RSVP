import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Gets the path of the current file 
current_file_path = Path(__file__).resolve()

# 2. Gets the parent directory
app_directory = current_file_path.parent

# 3. Gets the api directory
api_directory = app_directory.parent

# 4. Constructs the full path to .env 
env_path = api_directory / ".env"

# 5. Loads it
load_dotenv(dotenv_path=env_path)

# 6. Fetches Credentials
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# 7. Safety Check
if not url or not key:
    print(f"DEBUG: Looking for .env at: {env_path}")
    raise ValueError("Supabase credentials missing from .env file. Please check path and values.")

# Initializes the client
supabase: Client = create_client(url, key)

def get_db():
    """Dependency to get the database client in other files"""
    return supabase