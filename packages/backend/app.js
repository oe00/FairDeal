'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').load();
const {
  auth,
  account,
  common,
  listing,
  offer,
  category
} = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', [
  auth,
  account,
  common,
  listing,
  offer,
  category
]);

module.exports = app;
