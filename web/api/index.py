import os
import logging
import traceback 
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# --- GLOBAL ERROR TRACKER ---
startup_error = None

try:
    from chat_service import get_ai_response, get_admin_ai_response
    from email_service import send_ticket_email
    from mpesa import initiate_stk_push 
except Exception as e:
    startup_error = f"CRITICAL STARTUP ERROR: {str(e)}\n\n{traceback.format_exc()}"
    print(f"❌ {startup_error}")

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FalutinAPI")

# --- ROUTE 1: HEALTH (DIAGNOSTICS) ---
@app.route('/api/health', methods=['GET'])
def health():
    if startup_error:
        return jsonify({"status": "critical_error", "details": startup_error}), 500
    return jsonify({"status": "ok", "message": "Falutin Python Engine is Online 🟢"}), 200

# --- ROUTE 2: CHAT ---
@app.route('/api/chat', methods=['POST', 'OPTIONS']) 
def chat_route():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    # 1. Safety Check: Did imports fail?
    if startup_error:
        return jsonify({"error": "Server Startup Failed", "details": startup_error}), 500

    # 2. Runs Chat Logic
    try:
        data = request.json
        # Checks if functions exist before calling them
        if 'get_admin_ai_response' not in globals() or 'get_ai_response' not in globals():
             return jsonify({"error": "Chat functions not loaded due to import errors"}), 500

        if data.get('isAdmin'):
            return jsonify({"response": get_admin_ai_response(data.get('history', []))})
            
        # Ensures context is passed safely
        context = data.get('context', '')
        return jsonify({"response": get_ai_response(data.get('history', []), context)})
        
    except Exception as e:
        logger.error(f"Chat Error: {traceback.format_exc()}")
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# --- ROUTE 3: EMAIL ---
@app.route('/api/email', methods=['POST'])
def email_route():
    if startup_error:
        return jsonify({"error": "Server Startup Failed", "details": startup_error}), 500
        
    try:
        data = request.json
        success = send_ticket_email(data.get('email'), data.get('movie'), data.get('date'), data.get('ticketId'), data.get('poster'))
        return jsonify({"status": "sent" if success else "failed"}), 200 if success else 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTE 4: INITIATE PAYMENT ---
@app.route('/api/pay', methods=['POST'])
def pay_route():
    if startup_error:
        return jsonify({"error": "Server Startup Failed", "details": startup_error}), 500

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
        
        return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5328)