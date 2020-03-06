'use strict';

const router = require('express').Router();
const uniqid = require('uniqid');
const moment = require('moment');
require('dotenv').load();
const {
    authMiddleware,
    userCodeVerifier,
} = require('../middlewares');
const {
    Offer,
} = require('../models');

const {UnauthorisedError} = require('../exceptions');

router.get(
    '/offer/sent/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let moneyOffer = await offer.getSentMoneyOffers(req.params.code, req.query.page || 1, req.query.size || 20);
            let swapOffer = await offer.getSentSwapOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send({moneyOffer,swapOffer});
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/offer/received/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let moneyOffer = await offer.getReceivedMoneyOffers(req.params.code, req.query.page || 1, req.query.size || 20);
            let swapOffer = await offer.getReceivedSwapOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send({moneyOffer,swapOffer});
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/offer/:offerCode/account/:code/',
    [authMiddleware,userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            const data = await offer.get(req.params.code);

            if (data.toUser !== req.params.code && data.fromUser !== req.params.code) {
                throw new UnauthorisedError('User is not part of the offer.');
            }
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.put(
    '/stores/:storeId/offers/:offerId',
    [authMiddleware],
    async (req, res) => {
        try {
            const {
                paidOn,
                customerName,
                shippingAddress,
                billingAddress,
                customerContact,
                products,
            } = req.body;

            const offer = new Offer(
                req.params.offerId,
                req.params.storeId,
                null,
                res.locals.auth.accountId,
                paidOn,
                customerName,
                shippingAddress,
                billingAddress,
                customerContact,
                products
            );
            const data = await offer.update(offer);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.post(
    '/offer/makeOffer',
    [authMiddleware],
    async (req, res) => {
        try {
            const {
                toListing,
                toUser,
                fromUser,
                offerType,
                swapListing,
                amount,
            } = req.body;

            const offer = new Offer(
                uniqid(),
                toListing,
                toUser,
                fromUser,
                offerType,
                swapListing,
                amount,
                "Pending",
                "",
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            );

            const data = await offer.add(offer);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.delete(
    '/stores/:storeId/offers/:offerId',
    [authMiddleware],
    async (req, res) => {
        try {
            const offer = new Offer();
            const data = await offer.delete(req.params.offerId);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

module.exports = router;
