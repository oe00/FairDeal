'use strict';

const router = require('express').Router();
const uniqid = require('uniqid');
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
            const listing_data = await listing.getListing(req.params.code);

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
            const data = await listing.getListingImages(listingCode);
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

            const data = await listing.updateListing(listing);

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
            const data = await listing.makeActiveListing(req.params.code);

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

            const data = await listing.deleteListingImage(req.params.listingCode,req.params.imageCode);

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

            const listings = await listing.getAllActiveListings(
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

            const listings = await listing.getAllUserActiveListings(req.params.code,
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

            const listings = await listing.getAllUserPassiveListings(req.params.code,
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
            const data = await listing.updateListingCardImage(req.params.listingCode,image_source);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.post(
    '/listing/new-listing',
    [authMiddleware,userCodeVerifier],
    async (req,res) => {
        try{

            const {
                name,
                askingPrice,
                listingCondition,
                description,
                categoryCode
            } = req.body;

            const listing = new Listing();

            const data = await listing.addListing(new Listing(
                uniqid(),
                name,
                askingPrice,
                "ni.svg",
                listingCondition,
                description,
                categoryCode,
                req.headers['account-code'],
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                "0"
            ));

            res.send(data);

        }
        catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.put(
    '/listing/:listingCode/update',
    [authMiddleware,userCodeVerifier],
    async (req,res) => {
        try{

            const {
                name,
                askingPrice,
                listingCondition,
                description,
                categoryCode
            } = req.body;

            const listing = new Listing();

            const data = await listing.updateListing(new Listing(
                req.params.listingCode,
                name,
                askingPrice,
                null,
                listingCondition,
                description,
                categoryCode,
                null,
                null,
                null
            ));

            res.send(data);

        }
        catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.patch(
    '/listing/:listingCode/set-active',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();
            const data = await listing.makeActiveListing(req.params.listingCode);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.patch(
    '/listing/:listingCode/set-passive',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const listing = new Listing();
            const data = await listing.makePassiveListing(req.params.listingCode);

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
            const data = await listing.addListing(listing);

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
