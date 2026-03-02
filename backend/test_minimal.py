from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting minimal Flask app on http://127.0.0.1:5001...")
    app.run(host='127.0.0.1', port=5001, debug=False)
