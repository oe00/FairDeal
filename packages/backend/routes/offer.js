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
    '/offer/sent-money/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let moneyOffer = await offer.getSentMoneyOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send(moneyOffer);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/offer/sent-swap/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let swapOffer = await offer.getSentSwapOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send(swapOffer);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/offer/received-money/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let moneyOffer = await offer.getReceivedMoneyOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send(moneyOffer);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/offer/received-swap/account/:code/',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const offer = new Offer();
            let swapOffer = await offer.getReceivedSwapOffers(req.params.code, req.query.page || 1, req.query.size || 20);

            res.send(swapOffer);
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
                swapListing,
                amount,
                "Pending",
                "",
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            );

            const data = !offerType ? await offer.addMoneyOffer(offer) : await offer.addSwapOffer(offer);

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.delete(
    '/offer/delete/:offerId',
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
