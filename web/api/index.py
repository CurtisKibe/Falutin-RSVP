import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

try:
    from chat_service import get_ai_response, get_admin_ai_response
    from email_service import send_ticket_email
except ImportError as e:
    print(f"Import Error: {e}")

load_dotenv()

app = Flask(__name__)
# Allows Vercel Frontend to talk to Python Backend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- ROUTE 1: HEALTH CHECK ---
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Falutin Python Engine is Online 🟢"}), 200

# --- ROUTE 2: AI CHAT ---
@app.route('/api/chat', methods=['POST'])
def chat_route():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        history = data.get('history', [])
        context = data.get('context', '')
        is_admin = data.get('isAdmin', False)

        if is_admin:
            response_text = get_admin_ai_response(history)
        else:
            response_text = get_ai_response(history, context)

        return jsonify({"response": response_text})

    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# --- ROUTE 3: EMAIL ---
@app.route('/api/email', methods=['POST'])
def email_route():
    try:
        data = request.json
        success = send_ticket_email(
            data.get('email'),
            data.get('movie'),
            data.get('date'),
            data.get('ticketId'),
            data.get('poster')
        )
        return jsonify({"status": "sent" if success else "failed"}), 200 if success else 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- VERCEL ENTRY POINT ---
if __name__ == '__main__':
    app.run(debug=True, port=5328)