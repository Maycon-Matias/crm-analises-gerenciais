"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/test?retryWrites=true&w=majority&appName=PoraCred";
var options = {};
var client;
var clientPromise;
if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI não definida. Usando string padrão (NÃO USE EM PRODUÇÃO)");
}
if (!global._mongoClientPromise) {
    client = new mongodb_1.MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;
exports.default = clientPromise;
