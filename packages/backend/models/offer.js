'use strict';

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const {MySQL} = require('../db');
const {
    BadRequestError,
    InvalidModelArgumentsError,
    NoRecordFoundError,
} = require('../exceptions');
require('dotenv').load();


const {dbHost, dbUser, dbPassword, dbName} = process.env;
const db = new MySQL(dbHost, dbUser, dbPassword, dbName);

function Offer(
    code,
    toListing,
    toUser,
    fromUser,
    swapListing,
    amount,
    status,
    comment,
    addedOn,
    dbConn
) {

    this.code = code;
    this.toListing = toListing;
    this.toUser = toUser;
    this.fromUser = fromUser;
    this.swapListing = swapListing;
    this.amount = amount;
    this.comment = comment;
    this.status = status;
    this.addedOn = addedOn;
    if (dbConn !== undefined) {
        this.db = dbConn;
    }
}

Offer.prototype.addSwapOffer = function (offer) {
    return new Promise((resolve, reject) => {
        let proceed = true;

        if (offer instanceof Offer) {
            Object.keys(offer).forEach(function (key, index) {
                if (offer[key] === undefined) {
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
                toListing,
                toUser,
                fromUser,
                swapListing,
                amount,
                status,
                comment,
                addedOn,
            } = offer;

            (this.db || db).query(
                `insert into swap_offer (code, toListing, toUser, fromUser, swapListing, amount, status, comment, addedOn) 
         values('${code}', '${toListing}', '${toUser}', '${fromUser}', '${swapListing}', '${amount}', '${status}', '${comment}', '${addedOn}')`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid offer data.'));
                    } else {
                        if ([].length > 0) {
                            let sql = 'insert into order_product(product_id, purchasing_price, order_id, quantity) values';

                            products.forEach(product => {
                                sql += ` ('${product.code}', ${product.unitPrice}, '${code}', ${product.quantity}),`;
                            });

                            sql = sql.slice(0, -1);
                            sql += ';';

                            (this.db || db).query(sql, (error, results) => {
                                if (error || results.affectedRows == 0) {
                                    reject(new BadRequestError('Invalid offer data.'));
                                } else {
                                    resolve(
                                        "mock"
                                    );
                                }
                            });
                        } else {
                            resolve("Offer added.");
                        }
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid offer data.'));
        }
    });
};

Offer.prototype.addMoneyOffer = function (offer) {
    return new Promise((resolve, reject) => {
        let proceed = true;

        if (offer instanceof Offer) {
            Object.keys(offer).forEach(function (key, index) {
                if (offer[key] === undefined) {
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
                toListing,
                toUser,
                fromUser,
                amount,
                status,
                comment,
                addedOn,
            } = offer;

            (this.db || db).query(
                `insert into money_offer (code, toListing, toUser, fromUser, amount, status, comment, addedOn) 
         values('${code}', '${toListing}', '${toUser}', '${fromUser}', '${amount}', '${status}', '${comment}', '${addedOn}')`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid offer data.'));
                    } else {
                        if ([].length > 0) {
                            let sql = 'insert into order_product(product_id, purchasing_price, order_id, quantity) values';

                            products.forEach(product => {
                                sql += ` ('${product.code}', ${product.unitPrice}, '${code}', ${product.quantity}),`;
                            });

                            sql = sql.slice(0, -1);
                            sql += ';';

                            (this.db || db).query(sql, (error, results) => {
                                if (error || results.affectedRows == 0) {
                                    reject(new BadRequestError('Invalid offer data.'));
                                } else {
                                    resolve(
                                        "mock"
                                    );
                                }
                            });
                        } else {
                            resolve("Offer added.");
                        }
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid offer data.'));
        }
    });
};

Offer.prototype.getReceivedMoneyOffers = function (code, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select *
       from money_offer
       where toUser='${code}' order by addedOn desc limit ${(page - 1) *
            pageSize}, ${pageSize}`,
            (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const offers = results.map(offer => {
                        const {
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            amount,
                            status,
                            comment,
                            addedOn
                        } = offer;
                        return new Offer(
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            "",
                            amount,
                            status,
                            comment,
                            moment(addedOn).format('DD MMMM YYYY')
                        );
                    });
                    resolve(offers);
                }
            }
        );
    });
};

Offer.prototype.getReceivedSwapOffers = function (code, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select *
       from swap_offer
       where toUser='${code}' order by addedOn desc limit ${(page - 1) *
            pageSize}, ${pageSize}`,
            (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const offers = results.map(offer => {
                        const {
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            swapListing,
                            amount,
                            status,
                            comment,
                            addedOn
                        } = offer;
                        return new Offer(
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            swapListing,
                            amount,
                            status,
                            comment,
                            moment(addedOn).format('DD MMMM YYYY')
                        );
                    });
                    resolve(offers);
                }
            }
        );
    });
};

Offer.prototype.getSentMoneyOffers = function (code, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select *
       from money_offer
       where fromUser='${code}' order by addedOn desc limit ${(page - 1) *
            pageSize}, ${pageSize}`,
            (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const offers = results.map(offer => {
                        const {
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            amount,
                            status,
                            comment,
                            addedOn
                        } = offer;
                        return new Offer(
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            "",
                            amount,
                            status,
                            comment,
                            moment(addedOn).format('DD MMMM YYYY')
                        );
                    });
                    resolve(offers);
                }
            }
        );
    });
};

Offer.prototype.getSentSwapOffers = function (code, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select *
       from swap_offer
       where fromUser='${code}' order by addedOn desc limit ${(page - 1) *
            pageSize}, ${pageSize}`,
            (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const offers = results.map(offer => {
                        const {
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            swapListing,
                            amount,
                            status,
                            comment,
                            addedOn
                        } = offer;
                        return new Offer(
                            code,
                            toListing,
                            toUser,
                            fromUser,
                            swapListing,
                            amount,
                            status,
                            comment,
                            moment(addedOn).format('DD MMMM YYYY')
                        );
                    });
                    resolve(offers);
                }
            }
        );
    });
};

Offer.prototype.delete = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update offer set status=0 where code='${code}'`,
            (error, results) => {

                if (error || results.affectedRows == 0) {
                    reject(new BadRequestError('Deleting order failed.'));
                } else {
                    resolve('Offer deleted.');
                }
            }
        );
    });
};

module.exports = Offer;
