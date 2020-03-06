'use strict';

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const { MySQL } = require('../db');
const {
  BadRequestError,
  NoRecordFoundError,
} = require('../exceptions');
require('dotenv').load();

const { dbHost, dbUser, dbPassword, dbName } = process.env;
const db = new MySQL(dbHost, dbUser, dbPassword, dbName);

function Public(dbConn) {
  if (dbConn !== undefined) {
    this.db = dbConn;
  }
}

Public.prototype.generateEmailLink = function (email) {
  return new Promise((resolve, reject) => {
    const newId = uuidv1();
    (this.db || db).query(
      `insert into password_token(token, added_on, status) 
         values('${newId}', '${moment.utc().format('YYYY-MM-DD HH:mm:ss')}', 1)`,
      (error, results) => {
        if (error || results.affectedRows == 0) {
          reject(new BadRequestError('Invalid data.'));
        } else {
          resolve(newId);
        }
      }
    );
  });
};

module.exports = Public;
