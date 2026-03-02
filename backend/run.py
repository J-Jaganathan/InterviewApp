#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

if __name__ == '__main__':
    app = create_app('development')
    # Use WSGIRequestHandler with proper threading
    from werkzeug.serving import make_server
    server = make_server('0.0.0.0', 5000, app, threaded=True)
    print(" * Running on http://localhost:5000 and http://127.0.0.1:5000")
    print("Press CTRL+C to quit")
    server.serve_forever()

