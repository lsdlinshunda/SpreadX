# coding=utf-8
# Shunda Lin 
# json-rpc api for seed selection
# 2018.4.20
from flask import Flask
from flask_jsonrpc import JSONRPC
from flask_cors import CORS

# Flask application
app = Flask(__name__)
CORS(app)

# Flask-JSONRPC
jsonrpc = JSONRPC(app, '/api/algorithm', enable_web_browsable_api=True)

@jsonrpc.method('App.index')
def index():
    return 'Welcome to Flask JSON-RPC'

@jsonrpc.method('getSeeds(network=dict, n=int) -> object')
def getSeeds(network, n):
    degree = dict()
    for i in network:
        degree[i] = len(network[i])
    # 按出度大小排序
    degree = sorted(degree, key=degree.__getitem__, reverse=True)
    seeds = []
    for i in range(min(n, len(degree))):
        seeds.append(degree[i])
    return seeds

if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=True)
    