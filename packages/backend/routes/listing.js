'use strict';

const router = require('express').Router();
const shortid = require('shortid');
const moment = require('moment');
require('dotenv').load();
const {authMiddleware, storeIdVerifier, userCodeVerifier} = require('../middlewares');
const {Listing, Category} = require('../models');
const {UnauthorisedError} = require('../exceptions');
const fs = require('fs');

router.get(
    '/listing/get/:code',
    async (req, res) => {
        try {
            const listing = new Listing();
            const listing_data = await listing.get(req.params.code);

            const category = new Category();
            const category_data = await category.get(listing_data.categoryCode);

            let data = {listing_data, category_data};

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/listing/:code/get-images',
    async function (req, res) {
        try {
            const listingCode = req.params.code;
            const listing = new Listing();
            const data = await listing.getImages(listingCode);
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }

    });

router.put(
    '/listing/put/:code',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const {
                name,
                categoryId,
                sku,
                description,
                quantity,
                allowQuantity,
                unitPrice,
                cost,
                coverImage,
                manufacturerId,
                supplierId,
            } = req.body;
            const listing = new Listing(
                req.params.productId,
                name,
                categoryId,
                req.params.storeId,
                sku,
                description,
                quantity,
                allowQuantity,
                null,
                res.locals.auth.accountId,
                unitPrice,
                cost,
                coverImage,
                manufacturerId,
                supplierId
            );

            const data = await listing.update(listing);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.patch(
    'listing/patch/:code',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();
            const data = await listing.activate(req.params.code);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.delete(
    '/listing/:listingCode/delete-image/:imageCode',
    [authMiddleware,userCodeVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();

            const data = await listing.deleteImage(req.params.listingCode,req.params.imageCode);

            fs.unlinkSync(`uploads/accounts/${req.headers['account-code']}/listings/${req.params.listingCode}/${req.params.imageCode}`);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/listing/browse',
    async (req, res) => {
        try {
            const listing = new Listing();
            const category = new Category();

            const listings = await listing.getAll(
                req.query.page || 1,
                req.query.size || 20,
                req.query.q || null
            );

            const categories = await Promise.all(listings.map(async (listing) => await category.get(listing.categoryCode)));

            let data = [];
            for (let i = 0; i < listings.length; i++) {
                let listing_data = listings[i];
                let category_data = categories[i];
                data.push({listing_data, category_data});
            }
            if (data.length === 0)
                data = false;
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/listing/active/account/:code',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();
            const category = new Category();

            const listings = await listing.getAllActiveListings(req.params.code,
                req.query.page || 1,
                req.query.size || 20,
                req.query.q || null
            );


            const categories = await Promise.all(listings.map(async (listing) => await category.get(listing.categoryCode)));

            let data = [];
            for (let i = 0; i < listings.length; i++) {
                let listing_data = listings[i];
                let category_data = categories[i];
                data.push({listing_data, category_data});
            }
            if (data.length === 0)
                data = false;
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/listing/passive/account/:code',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();
            const category = new Category();

            const listings = await listing.getAllPassiveListings(req.params.code,
                req.query.page || 1,
                req.query.size || 20,
                req.query.q || null
            );

            const categories = await Promise.all(listings.map(async (listing) => await category.get(listing.categoryCode)));

            let data = [];
            for (let i = 0; i < listings.length; i++) {
                let listing_data = listings[i];
                let category_data = categories[i];
                data.push({listing_data, category_data});
            }
            if (data.length === 0)
                data = false;
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.post(
    '/listing/:listingCode/set-card-image',
    [authMiddleware,userCodeVerifier],
    async (req, res) => {
        try {
            const {image_source} = req.body;

            let listing = new Listing();
            const data = await listing.updateCardImage(req.params.listingCode,image_source);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);













/**
 *
 *
 *
 *
 *
 * **/

router.post(
    '/stores/:storeId/products',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const {
                name,
                categoryId,
                sku,
                description,
                quantity,
                allowQuantity,
                unitPrice,
                cost,
                coverImage,
                supplierId,
                manufacturerId,
            } = req.body;

            const listing = new Listing(
                shortid.generate(),
                name,
                categoryId,
                req.params.storeId,
                sku,
                description,
                quantity,
                allowQuantity,
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                res.locals.auth.accountId,
                unitPrice,
                cost,
                coverImage,
                manufacturerId,
                supplierId
            );
            const data = await listing.add(listing);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/stores/:storeId/products/:productId/attributes',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const aroductAttribute = new ListingAttribute();
            const data = await aroductAttribute.getAllByListingId(
                req.params.productId
            );

            res.send(data);
        } catch (err) {
            console.log(err);
            res.status(err.statusCode).send(err);
        }
    }
);

router.post(
    '/stores/:storeId/products/:productId/attributes',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const {name, quantity, varPrice, productAttributeCategoryId} = req.body;
            const aroductAttribute = new ListingAttribute(
                shortid.generate(),
                name,
                req.params.productId,
                quantity,
                varPrice,
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                res.locals.auth.accountId,
                productAttributeCategoryId
            );
            const data = await aroductAttribute.add(aroductAttribute);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.put(
    '/stores/:storeId/products/:productId/attributes/:attributeId',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const {name, quantity, varPrice, productAttributeCategoryId} = req.body;
            const aroductAttribute = new ListingAttribute(
                req.params.attributeId,
                name,
                req.params.productId,
                quantity,
                varPrice,
                null,
                res.locals.auth.accountId,
                productAttributeCategoryId
            );
            const data = await aroductAttribute.update(aroductAttribute);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.delete(
    '/stores/:storeId/products/:productId/attributes/:attributeId',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const attr = new ListingAttribute();
            const data = await attr.delete(req.params.attributeId);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.patch(
    '/stores/:storeId/products/:productId/attributes/:attributeId',
    [authMiddleware, storeIdVerifier],
    async (req, res) => {
        try {
            const attr = new ListingAttribute();
            const data = await attr.activate(req.params.attributeId);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

module.exports = router;
