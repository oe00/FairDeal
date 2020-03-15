'use strict';

const moment = require('moment');
const {MySQL} = require('../db');
const {
    BadRequestError,
    InvalidModelArgumentsError,
    NoRecordFoundError,
} = require('../exceptions');
require('dotenv').load();

const {dbHost, dbUser, dbPassword, dbName} = process.env;
const db = new MySQL(dbHost, dbUser, dbPassword, dbName);

function Listing(
    code,
    name,
    askingPrice,
    cardImageUrl,
    listingCondition,
    description,
    categoryCode,
    addedBy,
    addedOn,
    status,
    dbConn
) {
    // If a field is optional then provide default empty value
    this.code = code;
    this.name = name;
    this.askingPrice = askingPrice;
    this.cardImageUrl = cardImageUrl;
    this.listingCondition = listingCondition;
    this.description = description || "";
    this.categoryCode = categoryCode;
    this.addedBy = addedBy;
    this.addedOn = addedOn || moment.utc().format('YYYY-MM-DD HH:mm:ss');
    this.status = status;
    if (dbConn !== undefined) {
        this.db = dbConn;
    }
}


Listing.prototype.getListing = function (code) {
    return new Promise((resolve, reject) => {
        let sql = `select code, name, askingPrice, cardImageUrl, listingCondition, description, categoryCode, addedOn, addedBy, status
               from listing where code='${code}'`;

        (this.db || db).query(sql, (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No listing found.'));
                    }
                } else {
                    const {
                        code,
                        name,
                        askingPrice,
                        cardImageUrl,
                        listingCondition,
                        description,
                        categoryCode,
                        addedBy,
                        addedOn,
                        status,
                    } = results[0];

                    resolve(new Listing(
                        code,
                        name,
                        askingPrice,
                        cardImageUrl,
                        listingCondition,
                        description,
                        categoryCode,
                        addedBy,
                        moment(addedOn).format('DD MMM YYYY'),
                        status,
                    ));
                }
            }
        );
    });
};

Listing.prototype.getAllActiveListings = function (page = 1, pageSize = 20, search = null) {
    return new Promise((resolve, reject) => {
        let sql = `select code, name, askingPrice, cardImageUrl, listingCondition, description, categoryCode, addedOn, addedBy, status
               from listing where status=1`;

        if (search) {
            sql += ` and (code like '%${search}%' or name like '%${search}%' or sku like '%${search}%')`;
        }

        sql += ` order by addedOn desc limit ${(page - 1) * pageSize}, ${pageSize}`;

        (this.db || db).query(sql, (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No listings found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const listings = results.map(listing => {
                        const {
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            addedOn,
                            status,
                        } = listing;

                        return new Listing(
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            moment(addedOn).format('DD MMM YYYY'),
                            status,
                        );
                    });
                    resolve(listings);
                }
            }
        );
    });
};

Listing.prototype.getAllUserActiveListings = function (code, page = 1, pageSize = 20, search = null) {
    return new Promise((resolve, reject) => {
        let sql = `select code, name, askingPrice, cardImageUrl, listingCondition, description, categoryCode, addedOn, addedBy, status
               from listing where status=1 and addedBy='${code}'`;

        sql += ` order by addedOn desc limit ${(page - 1) * pageSize}, ${pageSize}`;

        (this.db || db).query(sql, (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve([]);
                    }
                } else {
                    const listings = results.map(listing => {
                        const {
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            addedOn,
                            status,
                        } = listing;

                        return new Listing(
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            moment(addedOn).format('DD MMM YYYY'),
                            status,
                        );
                    });
                    resolve(listings);
                }
            }
        );
    });
};

Listing.prototype.getAllUserPassiveListings = function (code, page = 1, pageSize = 20, search = null) {
    return new Promise((resolve, reject) => {
        let sql = `select code, name, askingPrice, cardImageUrl, listingCondition, description, categoryCode, addedOn, addedBy, status
               from listing where status=0 and addedBy='${code}'`;

        sql += ` order by addedOn desc limit ${(page - 1) * pageSize}, ${pageSize}`;

        (this.db || db).query(sql, (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No offers found.'));
                    } else {
                        resolve([]);
                    }
                } else {
                    const listings = results.map(listing => {
                        const {
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            addedOn,
                            status,
                        } = listing;

                        return new Listing(
                            code,
                            name,
                            askingPrice,
                            cardImageUrl,
                            listingCondition,
                            description,
                            categoryCode,
                            addedBy,
                            moment(addedOn).format('DD MMM YYYY'),
                            status,
                        );
                    });
                    resolve(listings);
                }
            }
        );
    });
};

Listing.prototype.addListing = function (listing) {
    let proceed = true;

    return new Promise((resolve, reject) => {
        if (listing instanceof Listing) {
            Object.keys(listing).forEach(function (key, index) {
                if (listing[key] === undefined) {
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
                askingPrice,
                cardImageUrl,
                listingCondition,
                description,
                categoryCode,
                addedBy,
                addedOn,
                status
            } = listing;

            (this.db || db).query(
                `insert into listing (code, name, askingPrice, cardImageUrl, listingCondition, description, categoryCode, addedBy, addedOn, status) 
         values('${code}', '${name}', '${askingPrice}', '${cardImageUrl}', '${listingCondition}', "${description}", '${categoryCode}', '${addedBy}', 
         '${addedOn}','${status}')`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid listing data.'));
                    } else {
                        resolve(code);
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid listing data.'));
        }
    });
};

Listing.prototype.updateListing = function (listing) {
    return new Promise((resolve, reject) => {
        if (listing instanceof Listing) {
            const {name, askingPrice, categoryCode, description, listingCondition,code} = listing;

            let queryString = "update listing set";

            if (name) {
                queryString += ` name='${name}',`;
            }

            if (askingPrice) {
                queryString += ` askingPrice='${askingPrice}',`;
            }

            if (categoryCode) {
                queryString += ` categoryCode='${categoryCode}',`;
            }
            if (description) {
                queryString += ` description='${description}',`;
            }

            if (listingCondition) {
                queryString += ` listingCondition='${listingCondition}',`;
            }

            queryString = queryString.substring(0, queryString.length - 1);

            queryString += ` where code='${code}'`;


            (this.db || db).query(
                queryString,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid listing data.'));
                    } else {
                        resolve("Listing update successful.");
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid listing data.'));
        }
    });
};

Listing.prototype.getListingImages = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select imageURL
               from listing_image where listingCode='${code}'`,
            (error, results) => {
                if (error || results.length === 0) {
                    if (error) {
                        reject(new NoRecordFoundError('No listings image found.'));
                    } else {
                        resolve(false);
                    }
                } else {
                    const images = results.map(image => {
                        const {
                            imageURL
                        } = image;

                        return imageURL;
                    });
                    resolve(images);
                }
            }
        );
    });
};

Listing.prototype.addListingImage = function (code, image) {
    return new Promise((resolve, reject) => {
            let sql = `insert listing_image (imageURL,listingCode) values('${image}','${code}')`;

            (this.db || db).query(sql, (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid image or listing data.'));
                    } else {
                        resolve("Image URL inserted.");
                    }
                }
            )
        }
    );
};

Listing.prototype.deleteListingImage = function (listingCode, imageURL) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `delete from listing_image where imageURL='${imageURL}' and listingCode='${listingCode}'`,
            (error, results) => {

                if (error) {
                    reject(new BadRequestError('Image deletion failed.'));
                } else {
                    resolve('Image deleted.');
                }
            }
        );
    });
};

Listing.prototype.updateListingCardImage = function (code, image) {
    return new Promise((resolve, reject) => {
            let sql = `update listing set cardImageURL='${image}' where code='${code}'`;

            (this.db || db).query(sql, (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid image or listing data.'));
                    } else {
                        resolve("Card Image Updated.");
                    }
                }
            )
        }
    );
};

Listing.prototype.makeActiveListing = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update listing set status=1 where code='${code}'`,
            (error, results) => {

                if (error || results.affectedRows == 0) {
                    reject(new BadRequestError('Making listing active failed.'));
                } else {
                    resolve('Listing activated.');
                }
            }
        );
    });
};

Listing.prototype.makePassiveListing = function (code) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `update listing set status=0 where code='${code}'`,
            (error, results) => {

                if (error || results.affectedRows == 0) {
                    reject(new BadRequestError('Making listing passive failed.'));
                } else {
                    resolve('Listing set to passive.');
                }
            }
        );
    });
};


function CategoryAttribute(
    code,
    attributeName,
    productId,
    quantity,
    varPrice,
    addedOn,
    addedBy,
    productAttributeCategoryId,
    productAttributeCategoryName,
    status,
    dbConn
) {
    // If a field is optional then provide default empty value
    this.code = code;
    this.attributeName = attributeName;
    this.productId = productId;
    this.quantity = quantity;
    this.varPrice = varPrice;
    this.addedOn = addedOn;
    this.addedBy = addedBy;
    this.productAttributeCategoryId = productAttributeCategoryId;
    this.productAttributeCategoryName = productAttributeCategoryName || '';
    this.status = status || 1;
    if (dbConn !== undefined) {
        this.db = dbConn;
    }
}

CategoryAttribute.prototype.get = function (id) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select code, product_id as productId, pa.name as attributeName, quantity, var_price as varPrice, added_on as addedOn, added_by as addedBy, 
       product_attribute_category_id as productAttributeCategoryId, pac.name as productAttributeCategoryName, status 
       from product_attribute as pa left join product_attribute_category as pac on pa.product_attribute_category_id = pac.id
       where code='${id}'`,
            (error, results) => {
                if (error || results.length == 0) {
                    reject(new NoRecordFoundError('No product attribute found.'));
                } else {
                    const {
                        code,
                        attributeName,
                        productId,
                        quantity,
                        varPrice,
                        addedOn,
                        addedBy,
                        productAttributeCategoryId,
                        productAttributeCategoryName,
                        status,
                    } = results[0];
                    resolve(
                        new CategoryAttribute(
                            code,
                            attributeName,
                            productId,
                            quantity,
                            varPrice,
                            addedOn,
                            addedBy,
                            productAttributeCategoryId,
                            productAttributeCategoryName,
                            status
                        )
                    );
                }
            }
        );
    });
};

CategoryAttribute.prototype.getAllByProductId = function (id) {
    return new Promise((resolve, reject) => {
        (this.db || db).query(
            `select code, product_id as productId, pa.name as attributeName, quantity, var_price as varPrice, added_on as addedOn, added_by as addedBy, 
       product_attribute_category_id as productAttributeCategoryId, pac.name as productAttributeCategoryName, status 
       from product_attribute as pa left join product_attribute_category as pac on pa.product_attribute_category_id = pac.id
       where product_id='${id}' and status=1`,
            (error, results) => {
                if (error) {
                    reject(new NoRecordFoundError('No product attributes found.'));
                } else {
                    const productAttributes = results.map(attr => {
                        const {
                            code,
                            attributeName,
                            productId,
                            quantity,
                            varPrice,
                            addedOn,
                            addedBy,
                            productAttributeCategoryId,
                            productAttributeCategoryName,
                            status,
                        } = attr;
                        return new CategoryAttribute(
                            code,
                            attributeName,
                            productId,
                            quantity,
                            varPrice,
                            addedOn,
                            addedBy,
                            productAttributeCategoryId,
                            productAttributeCategoryName,
                            status
                        );
                    });

                    resolve(productAttributes);
                }
            }
        );
    });
};

CategoryAttribute.prototype.add = function (productAttribute) {
    let proceed = true;

    return new Promise((resolve, reject) => {
        if (productAttribute instanceof CategoryAttribute) {
            Object.keys(productAttribute).forEach(function (key, index) {
                if (productAttribute[key] === undefined) {
                    reject(
                        new InvalidModelArgumentsError(
                            'Not all required attribute fields have a value.'
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
                attributeName,
                productId,
                quantity,
                varPrice,
                addedOn,
                addedBy,
                productAttributeCategoryId,
            } = productAttribute;

            (this.db || db).query(
                `insert into product_attribute(code, product_id, name, quantity, var_price, added_on, added_by, product_attribute_category_id) 
         values('${code}', '${productId}', '${attributeName}', ${quantity}, ${varPrice}, '${addedOn}', '${addedBy}', ${productAttributeCategoryId})`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid product attribute data.'));
                    } else {
                        resolve(
                            new CategoryAttribute(
                                code,
                                attributeName,
                                productId,
                                quantity,
                                varPrice,
                                addedOn,
                                addedBy,
                                productAttributeCategoryId,
                                '',
                                true,
                            )
                        );
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid product attribute data.'));
        }
    });
};

CategoryAttribute.prototype.update = function (productAttribute) {
    return new Promise((resolve, reject) => {
        if (productAttribute instanceof CategoryAttribute) {
            const {
                code,
                attributeName,
                productId,
                quantity,
                varPrice,
                addedBy,
                productAttributeCategoryId,
            } = productAttribute;

            (this.db || db).query(
                `update product_attribute set name='${attributeName}', product_id='${productId}', quantity=${quantity}, 
         var_price=${varPrice}, product_attribute_category_id=${productAttributeCategoryId}
         where code='${code}' and added_by='${addedBy}'`,
                (error, results) => {
                    if (error || results.affectedRows == 0) {
                        reject(new BadRequestError('Invalid product attribute data.'));
                    } else {
                        resolve(
                            new CategoryAttribute(
                                code,
                                attributeName,
                                productId,
                                quantity,
                                varPrice,
                                null,
                                addedBy,
                                productAttributeCategoryId,
                            )
                        );
                    }
                }
            );
        } else {
            reject(new BadRequestError('Invalid product attribute data.'));
        }
    });
};


module.exports = {
    Listing
};
