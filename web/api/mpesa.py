import os
import requests
import base64
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# CONFIGURATION
CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET")
PASSKEY = os.environ.get("MPESA_PASSKEY")
BUSINESS_SHORTCODE = "174379" # Safaricom Test Paybill

# URLs
AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

def get_mpesa_token():
    """Generates a temporary access token from Safaricom"""
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        raise ValueError("M-Pesa Keys missing in .env")
        
    auth_string = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
    encoded_auth = base64.b64encode(auth_string.encode()).decode()
    
    headers = {"Authorization": f"Basic {encoded_auth}"}
    response = requests.get(AUTH_URL, headers=headers)
    return response.json().get("access_token")

def trigger_stk_push(phone_number: str, amount: int, reference: str):
    """Triggers the PIN prompt on the user's phone"""
    token = get_mpesa_token()
    
    # 1. Formats Timestamp (YYYYMMDDHHmmss)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # 2. Generates Password (Shortcode + Passkey + Timestamp)
    password_str = f"{BUSINESS_SHORTCODE}{PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()
    
    # 3. Formats Phone Number (Must be 254...)
    if phone_number.startswith("0"):
        phone_number = "254" + phone_number[1:]
    
    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,     # Customer Phone
        "PartyB": BUSINESS_SHORTCODE, # Your Paybill
        "PhoneNumber": phone_number,
        "CallBackURL": "https://waylon-semierect-royal.ngrok-free.dev/callback", # Callback URL
        "AccountReference": reference,
        "TransactionDesc": "Screening Reservation"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(STK_PUSH_URL, json=payload, headers=headers)
    return response.json()