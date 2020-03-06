'use strict';

const randomstring = require('randomstring');
const moment = require('moment');
const md5 = require('md5');
const {MySQL} = require('../db');
const {
    BadRequestError,
    InvalidModelArgumentsError,
    NoRecordFoundError,
} = require('../exceptions');
require('dotenv').load();

const {dbHost, dbUser, dbPassword, dbName} = process.env;
const db = new MySQL(dbHost, dbUser, dbPassword, dbName);

function Account(
    code,
    name,
    city,
    picture,
    email,
    password,
    salt,
    joinedOn,
    dbConn
) {
    // If a field is optional then provide default empty value
    this.code = code;
    this.name = name;
    this.city = city;
    this.picture = picture;
    this.email = email;
    this.password = password;
    this.salt = salt;
    this.joinedOn = joinedOn || moment.utc().format('YYYY-MM-DD HH:mm:ss');
    if (dbConn !== undefined) {
        this.db = dbConn;
    }
}

Account.prototype.get = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select code, name, city, picture, email, joinedOn
       from user
       where code='${code}'`,
            (error, results) => {
                if (error || results.length == 0) {
                    reject(new NoRecordFoundError('No account found.'));
                } else {
                    const {
                        code,
                        name,
                        city,
                        picture,
                        email,
                        joinedOn
                    } = results[0];
                    resolve(
                        new Account(
                            code,
                            name,
                            city,
                            picture,
                            email,
                            null,
                            null,
                            moment(joinedOn).format('MMMM YYYY'),
                        )
                    );
                }
            }
        );
    });
};

Account.prototype.getSummary = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select code, name, city, joinedOn
       from user
       where code='${code}'`,
            (error, results) => {
                if (error || results.length == 0) {
                    reject(new NoRecordFoundError('No account found.'));
                } else {
                    const {
                        code,
                        name,
                        city,
                        picture,
                        email,
                        joinedOn
                    } = results[0];
                    resolve(
                        new Account(
                            code,
                            name,
                            city,
                            picture,
                            email,
                            null,
                            null,
                            moment(joinedOn).format('MMMM YYYY'),
                        )
                    );
                }
            }
        );
    });
};

Account.prototype.add = function (account) {
    return new Promise((resolve, reject) => {
        let proceed = true;

        if (account instanceof Account) {
            Object.keys(account).forEach(function (key, index) {
                if (account[key] === undefined) {
                    reject(
                        new InvalidModelArgumentsError(
                            'Not all required fields have a value.'
                        )
                    );
                    proceed = false;
                }
            });

            if (!proceed) {
                return;
            }

            const {
                code,
                name,
                city,
                picture,
                email,
                password,
                salt,
                joinedOn,
            } = account;

            (this.db || db).query(
                `insert into user(code, name, city, picture, email, password, salt, joinedOn) 
         values('${code}', '${name}', '${city}', '${picture}', '${email}','${md5(
                    password + salt
                )}', '${salt}', '${joinedOn}')`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid account data.'));
                    } else {
                        resolve("Account added.");
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid account data.'));
        }
    });
};

Account.prototype.update = function (account) {
    return new Promise((resolve, reject) => {
        if (account instanceof Account) {
            const {code, city, picture, name, email, password} = account;

            let queryString = "update user set";

            if (city) {
                queryString += ` city='${city}',`;
            }
            if (password) {
                const salt = randomstring.generate(32);
                queryString += ` password='${md5(password + salt)}', salt='${salt}',`;
            }
            if (name) {
                queryString += ` name='${name}',`;
            }
            if (email) {
                queryString += ` email='${email}',`;
            }

            if (picture) {
                queryString += ` picture='${picture}',`;
            }

            queryString = queryString.substring(0, queryString.length - 1);

            queryString += ` where code='${code}'`;


            (this.db || db).query(
                queryString,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Wrong Email'));
                    } else {
                        resolve("Account update successful.");
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid account data.'));
        }
    });
};

Account.prototype.delete = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update user set status=0 where code='${code}'`,
            (error, results) => {
                if (error || results.affectedRows == 0) {
                    reject(new BadRequestError('Deactivating account failed.'));
                } else {
                    resolve('Account deactivated.');
                }
            }
        );
    });
};

Account.prototype.activate = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update user set status=1 where code='${code}'`,
            (error, results) => {
                if (error || results.affectedRows == 0) {
                    reject(new BadRequestError('Activating account failed.'));
                } else {
                    resolve('Account activated.');
                }
            }
        );
    });
};

module.exports = Account;
