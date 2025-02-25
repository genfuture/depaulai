from flask import Flask, request, jsonify, send_from_directory
import os
import subprocess
from backend.hack import find_event
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/backend/*": {"origins": "http://192.168.1.176:3000"}})


@app.route('/backend/hack', methods=['GET'])
def aiUser():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400
    result = find_event(request.args.get('query'))
    return jsonify(result)

@app.route('/backend/hack', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'message': 'Preflight successful'})
    response.headers.add('Access-Control-Allow-Origin', 'http://192.168.1.176:3000')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

if __name__ == '__main__':
    app.run(port=5328)