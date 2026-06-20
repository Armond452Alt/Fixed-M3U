const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Enable CORS so Video.js can read the response from your domain
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Mock Database of your custom working M3U sources
const M3U_DATABASE = {
    "nicktoons": "https://fl1.moveonjoy-fixed-mirror.com/NICKTOONS/tracks-v1a1/mono.m3u8", // Example source
    "cn_as": "https://raw.githubusercontent.com/Armond452Alt/fixed-m3u/main/cn_as.m3u8"
};
