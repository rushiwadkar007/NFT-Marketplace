const { Wallet } = require('ethers');
const xlsx = require('xlsx');
const fs = require('fs');
const User = require("../models/User");
const crypto = require('crypto-js');
const { default: Web3 } = require('web3');

const getAccount = async (req, res, next) => {

    try {

        const username = req.body.username;
        console.log(username);
        const user = await User.find({ username: username });
        console.log(user);
        if (!user) { res.status(404).send({ data: null, status: `User Not Found!` }); }
        else {
            const encryptedMnemonic = user[0].mnemonic;
            const mnemonic = crypto.AES.decrypt(encryptedMnemonic, process.env.PASS_SEC).toString(crypto.enc.Utf8);
            const wallet = Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);
            if (wallet !== null) {
                req.publicKey = wallet.address;
                console.log(req.publicKey);
                req.privateKey = wallet._signingKey().privateKey.slice(2);
                next();
            }
            else {
                res.status(404).send({ success: false, status: "account public key and private key data not found!" })
            }
        }
    }
    catch (error) {
        res.status(503).send({ success: false, status: "account public key and private key data not found!" });
    }
}

const getAccounts = async (req, res, next) => {

    try {

        const buyerUsername = req.body.buyername;
        console.log(buyerUsername)
        const sellerName = req.body.ownerName;
        const buyer = await User.find({ username: buyerUsername });
        const seller = await User.find({ username: sellerName });

        console.log(seller);

        if (!buyer[0]) { res.status(404).send({ data: null, status: `Buyer Not Found!` }); }
        else if (!seller[0]) { res.status(404).send({ data: null, status: `Seller Not Found!` }); }
        else {

            const buyerEncryptedMnemonic = buyer[0].mnemonic;

            const sellerEncryptedMnemonic = seller[0].mnemonic;

            const buyerMnemonic = crypto.AES.decrypt(buyerEncryptedMnemonic, process.env.PASS_SEC).toString(crypto.enc.Utf8);

            const sellerMnemonic = crypto.AES.decrypt(sellerEncryptedMnemonic, process.env.PASS_SEC).toString(crypto.enc.Utf8);

            const buyerWallet = Wallet.fromMnemonic(buyerMnemonic, `m/44'/60'/0'/0/0`);
            const sellerWallet = Wallet.fromMnemonic(sellerMnemonic, `m/44'/60'/0'/0/0`);
            if (buyerWallet !== null && sellerWallet !== null) {
                req.buyerName = buyer.username;
                req.sellerName = seller[0].username;
                console.log("middleware ", req.sellerName);
                req.buyerPublicKey = buyerWallet.address.toLowerCase();
                req.buyerPrivateKey = buyerWallet._signingKey().privateKey.slice(2);
                req.sellerPublicKey = sellerWallet.address.toLowerCase();
                req.sellerPrivateKey = sellerWallet._signingKey().privateKey.slice(2);
                next();
            }
            else {
                res.status(404).send({ success: false, status: "account public keys and private keys data not found!" })
            }
        }
    }
    catch (error) {
        res.status(503).send({ success: false, status: "account public keys and private keys data not found!" });
    }
}


const getCollection = async (req, res, next) => {
    try {

        const accessedFile = await xlsx.readFile(req.file.path);

        const sheet = accessedFile.Sheets['Sheet1'];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        for (let item of jsonData) {
            req.jsonData = item;
        }

        let emptyArray = [];
        req.jsonData = emptyArray.concat(jsonData);

        const email = req.body.email;
        const user = await User.find({ email: email });
        if (!user) { res.status(404).send({ data: null, status: `User Not Found!` }); }
        else {

            const encryptedMnemonic = user[0].mnemonic;
            const mnemonic = crypto.AES.decrypt(encryptedMnemonic, process.env.PASS_SEC).toString(crypto.enc.Utf8);
            const wallet = Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);

            if (wallet !== null) {
                req.nftName = [];
                req.prices = [];
                req.ownerName = [];
                req.ids = [];
                req.amounts = [];
                req.nftURI = [];
                req.description = [];

                for (let i = 0; i < req.jsonData.length; i++) {
                    req.nftName.push(req.jsonData[i].nftName);
                    req.prices.push(req.jsonData[i].prices);
                    req.ownerName.push(req.jsonData[i].ownerName);
                    req.ids.push(req.jsonData[i].ids);
                    req.amounts.push(req.jsonData[i].amounts);
                    req.nftURI.push(req.jsonData[i].nftURI);
                    req.description.push(req.jsonData[i].description);
                }

                req.publicKey = wallet.address.toLowerCase();
                req.privateKey = wallet._signingKey().privateKey.slice(2);
                next();

            }
            else {
                res.status(404).send({ success: false, status: "account public key and private key data not found!" })
            }
        }
    }
    catch (error) {
        res.status(503).send({ success: false, status: "account public key and private key data not found!" });
    }
}

module.exports = { getAccount, getCollection, getAccounts };