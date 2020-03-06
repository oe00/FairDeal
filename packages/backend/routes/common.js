'use strict';

const {Account, Listing} = require('../models');

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const {sendEmail} = require('freetier');
const sharp = require('sharp');
const fs = require('fs');

require('dotenv').load();
const {
    authMiddleware,
    userCodeVerifier
} = require('../middlewares');
const {
    Public,
} = require('../models');
const {BadRequestError} = require('../exceptions');

const {
    senderEmail,
    sendgridApiKey,
    sendgridDailyLimit,
    elasticemailApiKey,
    elasticemailDailyLimit,
    passwordCallbackUrl,
} = process.env;

const listingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `uploads/accounts/${req.params.code}/listings/${req.params.listingCode}/`;
        mkdirp(dir, err => cb(err, dir));

    },
    filename: (req, file, cb) => {
        cb(null, shortid.generate() + path.extname(file.originalname));
    },
});
const accountStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `uploads/accounts/${req.params.code}/`;
        mkdirp(dir, err => cb(err, dir));

    },
    filename: (req, file, cb) => {
        cb(null, shortid.generate() + path.extname(file.originalname));
    },
});

const listingUpload = multer({
    storage: listingStorage,
    fileFilter: async (req, file, cb) => {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return cb(new Error('Only images are allowed'));
        }

        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 2, // TODO: make filesize limit configurable
    },
}).single('image');

const accountUpload = multer({
    storage: accountStorage,
    fileFilter: async (req, file, cb) => {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return cb(new Error('Only images are allowed'));
        }

        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 2, // TODO: make filesize limit configurable
    },
}).single('image');

router.post('/upload/account/:code/listing/:listingCode', [authMiddleware,userCodeVerifier], listingUpload, async (req, res) => {

    try {
        const {filename: image, destination: destination} = req.file;

        await sharp(req.file.path)
            .resize(330, 330)
            .toFile(destination + "-" + image);

        const listing = new Listing();

        const data = await listing.addPicture(req.params.listingCode,"-" + image);

        fs.unlinkSync(req.file.path);

        res.send(data);
    } catch (e) {
        console.log(e);
    }

});

router.post('/upload/account/:code/', [authMiddleware, userCodeVerifier], accountUpload, async (req, res) => {

    try {
        const {filename: image, destination: destination} = req.file;

        await sharp(req.file.path)
            .resize(220, 220)
            .toFile(destination + "-" + image);

        const account = new Account();

        const {code, picture} = await account.get(req.params.code);

        if (picture !== "fd")
            fs.unlinkSync(`uploads/accounts/${code}/${picture}`);

        const data = await account.update(new Account(
            req.params.code,
            null,
            null,
            "-" + image,
            null,
            null,
            null,
            null));

        fs.unlinkSync(req.file.path);
        res.send(data);
    } catch (err) {
        res.status(err.statusCode).send(err);
    }

});

router.get(
    '/image/account/:code',
    async function (req, res) {
        try {

            const accountCode = req.params.code;

            const account = new Account();

            const {picture} = await account.get(accountCode);

            if (picture === "fd") {
                res.sendFile(path.join(__dirname, `../uploads/${picture}.png`));
            } else {
                res.sendFile(path.join(__dirname, `../uploads/accounts/${accountCode}/${picture}`));
            }
        } catch (err) {
            res.status(err.statusCode).send(err);
        }

    });

router.get(
    '/image/listing/:listingCode/:imageName',
    async function (req, res) {
        try {

            const listingCode = req.params.listingCode;

            const imageName = req.params.imageName;

            const listing = new Listing();

            const {addedBy} = await listing.get(listingCode);

            res.sendFile(path.join(__dirname, `../uploads/accounts/${addedBy}/listings/${listingCode}/${imageName}`));

        } catch (err) {
            res.status(err.statusCode).send(err);
        }

    });

router.get(
    '/image/card/listing/:listingCode',
    async function (req, res) {
        try {

            const listingCode = req.params.listingCode;

            const listing = new Listing();

            const {addedBy,cardImageUrl} = await listing.get(listingCode);

            res.sendFile(path.join(__dirname, `../uploads/accounts/${addedBy}/listings/${listingCode}/${cardImageUrl}`));

        } catch (err) {
            res.status(err.statusCode).send(err);
        }

    });


router.post('/password/email',
    async (req, res) => {
        try {
            const utility = new Public();
            const data = await utility.generateEmailLink(req.body.email);
            const result = await sendEmail({
                to: req.body.email,
                from: senderEmail,
                subject: 'Reset your password',
                message: '<a href="' + passwordCallbackUrl + '/password/reset?token=' + data + '">Click here to reset your password</a>',
                recipient: '',
                sender: '',
            }, {
                elasticEmail: {apiKey: elasticemailApiKey, dailyLimit: elasticemailDailyLimit},
                sendGrid: {apiKey: sendgridApiKey, dailyLimit: sendgridDailyLimit},
            });

            res.send(result);
        } catch (err) {
            res.status(err.statusCode).send(err);
        }
    });

module.exports = router;
