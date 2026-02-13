import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

try:
    from chat_service import get_ai_response, get_admin_ai_response
    from email_service import send_ticket_email
    from mpesa import initiate_stk_push 
except ImportError as e:
    print(f"❌ Import Error: {e}")

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FalutinAPI")

# --- ROUTE 1: HEALTH ---
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Falutin Python Engine is Online 🟢"}), 200

# --- ROUTE 2: CHAT ---
@app.route('/api/chat', methods=['POST'])
def chat_route():
    try:
        data = request.json
        if data.get('isAdmin'):
            return jsonify({"response": get_admin_ai_response(data.get('history', []))})
        return jsonify({"response": get_ai_response(data.get('history', []), data.get('context', ''))})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTE 3: EMAIL ---
@app.route('/api/email', methods=['POST'])
def email_route():
    try:
        data = request.json
        success = send_ticket_email(data.get('email'), data.get('movie'), data.get('date'), data.get('ticketId'), data.get('poster'))
        return jsonify({"status": "sent" if success else "failed"}), 200 if success else 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTE 4: INITIATE PAYMENT ---
@app.route('/api/pay', methods=['POST'])
def pay_route():
    try:
        data = request.json
        phone = data.get('phone')
        amount = data.get('amount')
        
        if not phone or not amount:
            return jsonify({"error": "Phone and Amount required"}), 400

        # Calls the M-Pesa function
        payment_response = initiate_stk_push(phone, amount)
        
        return jsonify(payment_response)

    except Exception as e:
        logger.error(f"Payment Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- ROUTE 5: MPESA CALLBACK ---
@app.route('/api/mpesa/callback', methods=['POST'])
def mpesa_callback():
    try:
        data = request.json
        logger.info(f"💰 M-Pesa Callback Received: {data}")
        
        # HERE you usually save to database (Supabase)
        # For now, we just log it to confirm it works
        
        return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5328)