'use strict';

const router = require('express').Router();
const {sendEmail} = require('freetier');
const moment = require('moment');
const uniqid = require('uniqid');
const randomstring = require('randomstring');
require('dotenv').load();
const {authMiddleware, userCodeVerifier} = require('../middlewares');
const {Account, OAuth2Request} = require('../models');
const {UnauthorisedError} = require('../exceptions');

const {
    senderEmail,
    sendgridApiKey,
    sendgridDailyLimit,
    elasticemailApiKey,
    elasticemailDailyLimit,
} = process.env;


router.post(
    '/account/register',
    async (req, res) => {
        try {

            const account = new Account(
                uniqid(),
                req.body.name,
                req.body.city,
                "fd",
                req.body.email,
                req.body.password,
                randomstring.generate(32),
                moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            );

            const data = await account.add(account);

            /**const result = await sendEmail(
             {
                        to: req.body.email,
                        from: senderEmail,
                        subject: 'Your new account has been created.',
                        message: `Hi ${
                            req.body.name
                        }: <br /><br />Your account has been created and your temp password is: <b>${password}</b>.<br /><br />Please change your password after login.`,
                        recipient: req.body.name,
                        sender: 'Admin',
                    },
             {
                        elasticEmail: {
                            apiKey: elasticemailApiKey,
                            dailyLimit: elasticemailDailyLimit,
                        },
                        sendGrid: {
                            apiKey: sendgridApiKey,
                            dailyLimit: sendgridDailyLimit,
                        },
                    }
             );**/

            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/account/:code',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const account = new Account();
            const data = await account.get(req.params.code);
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.get(
    '/account/summary/:code',
    async (req, res) => {
        try {
            const account = new Account();
            const data = await account.getSummary(req.params.code);
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);


router.put(
    '/account/:code',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const localAccount = new Account();
            const oldEmail = (await localAccount.get(req.params.code)).email;
            const auth = new OAuth2Request();
            const verify = await auth.authByPassword(oldEmail, req.body.oldPassword);

            const account = new Account(
                req.params.code,
                req.body.name,
                req.body.city,
                null,
                req.body.email,
                req.body.password,
                null,
                null,
            );
            const data = await account.update(account);
            res.send(data);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.patch(
    '/accounts/:code',
    [authMiddleware, userCodeVerifier],
    async (req, res) => {
        try {
            const account = new Account();

            //const acct = await account.get(res.locals.auth.code);

            const data = await account.activate(req.params.code);

            res.send(data);

        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

router.delete(
    '/accounts/:code',
    [authMiddleware],
    async (req, res) => {
        try {
            const account = new Account();

            //const acct = await account.get(res.locals.auth.code);

            const data = await account.delete(req.params.code);

            res.send(data);

        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    }
);

module.exports = router;
