# coding=utf-8
# Shunda Lin 
# json-rpc api for seed selection
# 2018.4.20
from flask import Flask
from flask_jsonrpc import JSONRPC
from flask_cors import CORS
from math import *
from random import *

# Flask application
app = Flask(__name__)
CORS(app)

# Flask-JSONRPC
jsonrpc = JSONRPC(app, '/api/algorithm', enable_web_browsable_api=True)

# 以up的概率生成1
def random_index(low, up):
    start = 0
    rate = [low, up]
    randnum = uniform(0, sum(rate))
    for index, item in enumerate(rate):  # 以up概率生成1
        start += item
        if randnum <= start:
            break
    return index

@jsonrpc.method('App.index')
def index():
    return 'Welcome to Flask JSON-RPC'

# 按度数大小选择种子
@jsonrpc.method('algorithm_1(network=dict, n=int, threshold=int, estimation=float) -> object')
def algorithm_1(network, n, threshold, estimation):
    degree = dict()
    for i in network:
        degree[i] = len(network[i])
    # 按出度大小排序
    degree = sorted(degree, key=degree.__getitem__, reverse=True)
    seeds = []
    for i in range(min(n, len(degree))):
        seeds.append(degree[i])
    return seeds

# 基于略图的影响力最大化算法
@jsonrpc.method('algorithm_2(network=dict, n=int, threshold=int, estimation=float) -> object')
def algorithm_2(network, n, threshold, estimation):
    seeds = []
    reverse_N = dict() # 反向的网络
    # 随机去除一些边
    for i in network:
        for j in network[i]:
            if random_index(1 - estimation, estimation) == 1:
                if j in reverse_N:
                    reverse_N[j].append(i)
                else:
                    reverse_N[j] = [j, i]
    cc = reverse_N.keys()
    temp_al = dict() 
    n_v = []
    for i in range(len(cc)): 
        v = cc[randint(0, len(cc) - 1)]  # 随机挑个节点v
        if v not in n_v:
            n_v.append(v)  # 将节点v加入n_v
            if v in reverse_N:
                for j in reverse_N[v]:
                    if j in temp_al:
                        temp_al[j].append(v)
                    else:
                        temp_al[j] = [v]
                for j in reverse_N[v]:
                    if j in temp_al:
                        if len(temp_al[j]) >= threshold: # 判断点的度是否到达要求
                            # 把指向某点的点全删掉
                            for pp in temp_al[j]:
                                reverse_N[pp] = []
                                for kk in reverse_N:
                                    if pp in reverse_N[kk]:
                                        reverse_N[kk].remove(pp)
                                for kk in temp_al:
                                    if pp in temp_al[kk]:
                                        temp_al[kk].remove(pp)
                            temp_al[j] = []
                            seeds.append(j)
                            if len(seeds) == n:
                                return seeds
    # 补上不足的种子
    if len(seeds) < n:
        degree = dict()
        for i in temp_al:
            degree[i] = len(temp_al[i])
        sort = sorted(degree, key=degree.__getitem__, reverse = True)
        for i in range(n - len(seeds)):
            seeds.append(sort[i])
    return seeds

# 手动选取种子模式，所以返回空数组
@jsonrpc.method('manual(network=dict, n=int, threshold=int, estimation=float) -> object')
def manual(network, n, threshold, estimation):
    return []

if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=True)
