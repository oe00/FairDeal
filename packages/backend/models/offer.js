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
    offerType,
    proposedListing,
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
    this.offerType = offerType;
    this.proposedListing = proposedListing;
    this.amount = amount;
    this.comment = comment;
    this.status = status;
    this.addedOn = addedOn;
    if (dbConn !== undefined) {
        this.db = dbConn;
    }
}

Offer.prototype.add = function (offer) {
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
                offerType,
                proposedListing,
                amount,
                status,
                comment,
                addedOn,
            } = offer;

            console.log({offer})

            let addedProposedListing = proposedListing ? `'${proposedListing}'` : proposedListing;

            (this.db || db).query(
                `insert into offer (code, toListing, toUser, fromUser, offerType, proposedListing, amount, status, comment, addedOn) 
         values('${code}', '${toListing}', '${toUser}', '${fromUser}', '${offerType}' , ${addedProposedListing}, '${amount}', '${status}', '${comment}', '${addedOn}')`,
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
                                        new Offer(
                                            code,
                                            storeId,
                                            moment(addedOn).format('YYYY-MM-DD HH:mm:ss'),
                                            addedBy,
                                            paidOn,
                                            customerName,
                                            shippingAddress,
                                            billingAddress,
                                            customerContact,
                                            products,
                                            true
                                        )
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

const order = function (id) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select code, store_id as storeId, added_by as addedBy, added_on as addedOn, paid_on as paidOn, 
       customer_name as customerName, shipping_address as shippingAddress, billing_address as billingAddress, 
       customer_contact as customerContact, status
       from \`order\`
       where code='${id}'`,
            (error, results) => {
                if (error || results.length == 0) {
                    reject(new NoRecordFoundError('No order found.'));
                } else {
                    const order = results[0];
                    (this.db || db).query(
                        `select p.code, p.name, p.sku, op.purchasing_price as unitPrice, op.quantity
             from product as p
             right join order_product as op on p.code = op.product_id
             where order_id='${id}' and op.status=1`,
                        (error, results) => {
                            if (error || results.length == 0) {
                                order.products = [];
                            } else {
                                order.products = results.map(product => {
                                    const {
                                        code,
                                        name,
                                        sku,
                                        unitPrice,
                                        quantity,
                                    } = product;
                                    return {
                                        code,
                                        name,
                                        sku,
                                        unitPrice,
                                        quantity,
                                    };
                                });
                            }

                            resolve(order);
                        }
                    );
                }
            }
        );
    });
};

Offer.prototype.getReceivedMoneyOffers = function (code, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select *
       from offer
       where toUser='${code}' and offerType='0' order by addedOn desc limit ${(page - 1) *
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
                            offerType,
                            proposedListing,
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
                            offerType,
                            proposedListing,
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
       from offer
       where toUser='${code}' and offerType='1' order by addedOn desc limit ${(page - 1) *
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
                            offerType,
                            proposedListing,
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
                            offerType,
                            proposedListing,
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
       from offer
       where fromUser='${code}' and offerType='0' order by addedOn desc limit ${(page - 1) *
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
                            offerType,
                            proposedListing,
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
                            offerType,
                            proposedListing,
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
       from offer
       where fromUser='${code}' and offerType='1' order by addedOn desc limit ${(page - 1) *
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
                            offerType,
                            proposedListing,
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
                            offerType,
                            proposedListing,
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

Offer.prototype.update = function (offer) {
    return new Promise((resolve, reject) => {
        if (offer instanceof Offer) {
            const {
                code,
                storeId,
                addedBy,
                paidOn,
                customerName,
                shippingAddress,
                billingAddress,
                customerContact,
                products,
            } = offer;

            (this.db || db).query(
                'update `offer` set paid_on=' + (paidOn ? `'${paidOn}'` : null) + `, customer_name='${customerName}', 
         shipping_address='${shippingAddress}', billing_address='${billingAddress}', customer_contact='${customerContact}'
         where code='${code}' and added_by='${addedBy}'`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid offer data.'));
                    } else {
                        (this.db || db).query(
                            `update order_product set status=0
               where order_id='${code}' and status=1`, (error, results) => {
                                if (error) {
                                    reject(new BadRequestError('Invalid offer product data.'));
                                } else {
                                    if (products.length > 0) {
                                        let sql = 'insert into order_product(product_id, purchasing_price, order_id, quantity) values';

                                        products.forEach(product => {
                                            sql += ` ('${product.code}', ${product.unitPrice}, '${code}', ${product.quantity}),`;
                                        });

                                        sql = sql.slice(0, -1);
                                        sql += ';';

                                        (this.db || db).query(sql, (error, results) => {
                                            if (error || results.affectedRows == 0) {
                                                reject(new BadRequestError('Invalid offer product data.'));
                                            } else {
                                                resolve(
                                                    new Offer(
                                                        code,
                                                        storeId,
                                                        '',
                                                        addedBy,
                                                        paidOn,
                                                        customerName,
                                                        shippingAddress,
                                                        billingAddress,
                                                        customerContact,
                                                        products
                                                    )
                                                );
                                            }
                                        });
                                    } else {
                                        resolve(
                                            new Offer(
                                                code,
                                                storeId,
                                                '',
                                                addedBy,
                                                paidOn,
                                                customerName,
                                                shippingAddress,
                                                billingAddress,
                                                customerContact,
                                                products
                                            )
                                        );
                                    }
                                }
                            }
                        );
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid offer data.'));
        }
    });
};

Offer.prototype.delete = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update \`order\` set status=0 where code='${code}'`,
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
