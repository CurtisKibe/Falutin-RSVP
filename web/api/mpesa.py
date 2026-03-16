import os
import base64
import requests
from datetime import datetime

CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET")
PASSKEY = os.environ.get("MPESA_PASSKEY")
BUSINESS_SHORTCODE = "174379" # Safaricom Test Paybill

AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

def get_mpesa_token():
    """Generates a temporary access token from Safaricom"""
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        print("CRITICAL: M-Pesa Keys missing in Vercel Environment Variables.")
        return None
        
    try:
        auth_string = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        headers = {"Authorization": f"Basic {encoded_auth}"}
        response = requests.get(AUTH_URL, headers=headers, timeout=8) 
        
        if not response.ok:
            print(f"Safaricom Auth Failed: {response.text}")
            return None
            
        return response.json().get("access_token")
    except Exception as e:
        print(f"Error getting M-Pesa Token: {e}")
        return None

def initiate_stk_push(phone_number: str, amount: int, reference: str = "FalutinTicket"):
    """Triggers the PIN prompt on the user's phone"""
    try:
        token = get_mpesa_token()
        if not token:
            return {"error": "Authentication failed. Check M-Pesa API Keys in Vercel."}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        if not PASSKEY:
             return {"error": "M-Pesa Passkey missing in Vercel."}
             
        password_str = f"{BUSINESS_SHORTCODE}{PASSKEY}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()
        
        phone_number = str(phone_number).strip()
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("+254"):
            phone_number = phone_number[1:]
        
        payload = {
            "BusinessShortCode": BUSINESS_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,     
            "PartyB": BUSINESS_SHORTCODE, 
            "PhoneNumber": phone_number,
            "CallBackURL": "https://falutin-rsvp.vercel.app/api/mpesa/callback",
            "AccountReference": reference,
            "TransactionDesc": "Screening Reservation"
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(STK_PUSH_URL, json=payload, headers=headers, timeout=8)
        
        if not response.ok:
            error_msg = response.text
            print(f"Safaricom STK Error: {error_msg}")
            return {"error": f"Safaricom rejected the request: {error_msg}"}
            
        return response.json()
        
    except requests.exceptions.Timeout:
        return {"error": "Safaricom Sandbox took too long to respond. Please try again."}
    except Exception as e:
        return {"error": f"Server Error: {str(e)}"}