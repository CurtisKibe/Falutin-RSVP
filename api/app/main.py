import asyncio
import requests
import re 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import supabase
from app.mpesa import trigger_stk_push
from app.email_service import send_ticket_email
from app.chat_service import get_ai_response, get_admin_ai_response 

app = FastAPI(title="Falutin Fam API", version="1.0.1")

# --- CONFIGURATION ---
SANITY_PROJECT_ID = "xet7dw4q" 
SANITY_DATASET = "production"

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class PaymentRequest(BaseModel):
    name: str      
    phone: str
    email: str 
    tickets: int    
    amount: int    
    screening_id: str

# --- CHAT MODELS ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel): 
    history: list[Message] 

# --- HELPER FUNCTIONS ---

def fetch_movies_for_context():
    """Fetches active screenings from Sanity to feed the AI."""
    query = '*[_type == "screening"]{date, price, movie->{title, description}}'
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/{SANITY_DATASET}?query={query}"
    
    try:
        response = requests.get(url).json()
        screenings = response.get('result', [])
        
        context_text = ""
        for s in screenings:
            context_text += f"- MOVIE: {s['movie']['title']} | DATE: {s['date']} | PRICE: {s['price']} KES\n"
        
        return context_text
    except Exception as e:
        print(f"SANITY ERROR: {str(e)}")
        return "No movies currently scheduled."

def sanitize_email(email: str) -> str:
    """Attempts to fix common email typos automatically."""
    if not email: return ""
    email = email.strip()
    if "gmailcom" in email:
        email = email.replace("gmailcom", "gmail.com")
    return email

# --- ENDPOINTS ---

@app.get("/")
async def health_check():
    return {"status": "active", "message": "Falutin Reservation System Online"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    context = fetch_movies_for_context()
    reply = get_ai_response(request.history, context)
    return {"reply": reply}

# --- ADMIN CHAT ENDPOINT ---
@app.post("/admin-chat")
async def admin_chat_endpoint(request: ChatRequest):
    """
    Dedicated endpoint for the Admin Aide (The Curator).
    Helps with Dashboard navigation and Event Planning.
    """
    reply = get_admin_ai_response(request.history)
    return {"reply": reply}

@app.post("/pay")
async def initiate_payment(request: PaymentRequest):
    try:
        print(f"DEBUG: Starting payment for {request.name}...")

        # 1. CALCULATES TOTAL
        total_cost = request.amount * request.tickets

        # 2. Triggers M-Pesa
        mpesa_res = trigger_stk_push(
            phone_number=request.phone, 
            amount=total_cost, 
            reference=request.screening_id
        )
        
        # 3. Extracts Tracking ID
        checkout_id = mpesa_res.get("CheckoutRequestID")
        
        if not checkout_id:
            raise HTTPException(status_code=500, detail="M-Pesa failed to return a tracking ID")

        # 4. Saves to Supabase 
        data = {
            "name": request.name,       
            "phone": request.phone,
            "email": request.email,
            "tickets": request.tickets, 
            "amount": total_cost,      
            "screening_id": request.screening_id,
            "checkout_request_id": checkout_id,
            "status": "pending"
        }
        
        supabase.table("reservations").insert(data).execute()
        print(f"DEBUG: Database record created for ID: {checkout_id}")
        
        return {"status": "success", "checkout_id": checkout_id}
        
    except Exception as e:
        print(f"PAYMENT ERROR: {str(e)}")
        return {"status": "error", "details": str(e)}

@app.post("/callback")
async def mpesa_callback(data: dict):
    """
    Robust Callback Handler:
    Ensures payment is recorded even if email notification fails.
    """
    try:
        print("----- PAYMENT CALLBACK RECEIVED -----")
        
        # 1. Parses M-Pesa Data
        body = data.get("Body", {}).get("stkCallback", {})
        checkout_id = body.get("CheckoutRequestID")
        result_code = body.get("ResultCode") 
        
        if result_code == 0:
            # --- CRITICAL PATH: MARKS PAYMENT AS SUCCESS ---
            print(f"PAYMENT CONFIRMED for {checkout_id}")
            
            # Extracts Receipt
            meta = body.get("CallbackMetadata", {}).get("Item", [])
            receipt = next((item.get("Value") for item in meta if item.get("Name") == "MpesaReceiptNumber"), None)
            
            # Updates DB IMMEDIATELY
            supabase.table("reservations").update({
                "status": "paid",
                "mpesa_receipt": receipt
            }).eq("checkout_request_id", checkout_id).execute()
            
            print("DEBUG: DB Status updated to PAID.")
            
            # --- NON-CRITICAL PATH: SENDS EMAIL --
            try:
                booking_response = supabase.table("reservations").select("*").eq("checkout_request_id", checkout_id).single().execute()
                booking_data = booking_response.data
                
                if booking_data and booking_data.get("email"):
                    raw_email = booking_data['email']
                    safe_email = sanitize_email(raw_email) 
                    
                    print(f"DEBUG: Sending ticket to {safe_email}...")
                    
                    send_ticket_email(
                        to_email=safe_email,
                        movie_title="Falutin Screening", 
                        date="Upcoming",
                        ticket_id=checkout_id,
                        poster_url=""
                    )
                    print("DEBUG: Email sent successfully.")
                else:
                    print("DEBUG: No email found for this booking.")
                    
            except Exception as email_error:
                print(f"NOTIFICATION ERROR: Failed to send email, but payment is safe. Error: {email_error}")

        else:
            # Payment Failed (User cancelled or insufficient funds)
            print(f"PAYMENT FAILED for {checkout_id}")
            supabase.table("reservations").update({
                "status": "failed"
            }).eq("checkout_request_id", checkout_id).execute()
            
    except Exception as e:
        print(f"FATAL CALLBACK ERROR: {str(e)}")
        
    return {"result": "received"}

@app.get("/check-status/{checkout_id}")
async def check_status(checkout_id: str):
    try:
        response = supabase.table("reservations").select("status").eq("checkout_request_id", checkout_id).single().execute()
        
        if response.data:
            return {"status": response.data["status"]}
        else:
            return {"status": "not_found"}
            
    except Exception as e:
        print(f"POLLING ERROR: {e}")
        return {"status": "pending"}