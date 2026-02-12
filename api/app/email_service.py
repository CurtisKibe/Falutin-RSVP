import resend
import os
from dotenv import load_dotenv

# 1. Loads environment variables from .env file
load_dotenv()

# 2. Fetches the key safely
api_key = os.getenv("RESEND_API_KEY")

# 3. Safety Check: Stops execution if key is missing
if not api_key:
    raise ValueError("CRITICAL ERROR: RESEND_API_KEY is missing from environment variables.")

resend.api_key = api_key

def send_ticket_email(to_email: str, movie_title: str, date: str, ticket_id: str, poster_url: str):
    try:
        print(f"DEBUG: Sending email to {to_email}...")
        
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #EAB308; margin: 0;">FALUTIN FILM CLUB</h1>
            </div>
            
            <div style="padding: 20px; border: 1px solid #ddd;">
                <h2>Your Ticket is Confirmed!</h2>
                <p>You are going to see <strong>{movie_title}</strong>.</p>
                <p><strong>Date:</strong> {date}</p>
                <p><strong>Ticket ID:</strong> {ticket_id}</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={ticket_id}" alt="Ticket QR" />
                    <p style="font-size: 12px; color: #666;">Show this QR code at the entrance</p>
                </div>
                
                <p>See you at the movies!</p>
            </div>
        </div>
        """

        r = resend.Emails.send({
            "from": "onboarding@resend.dev", # For Testing
            "to": to_email,
            "subject": f"Ticket: {movie_title}",
            "html": html_content
        })
        
        print(f"DEBUG: Email sent! ID: {r.get('id')}")
        return True
        
    except Exception as e:
        print(f"EMAIL ERROR: {str(e)}")
        return False