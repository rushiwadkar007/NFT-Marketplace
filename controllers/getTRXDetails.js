const Web3 = require('web3');
const { Wallet } = require('ethers');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"));
const dotenv = require("dotenv");
dotenv.config();
const ETx = require("ethereumjs-tx").Transaction;
const express = require('express');
const TRXHash = require("../models/transactions");
const User = require('../models/User');
const crypto = require('crypto-js');
const { find } = require('../models/User');
// const binanceNFTContractABI = require("../contractdetails/bep721matellio.json");

// const web3B = new Web3(new Web3.providers.HttpProvider("https://apis.ankr.com/fd5ad7c3eee240ebbf3e5480a44a8db5/4b078eaffa8652dc7dfcd895f2ba498a/binance/full/test"))

// const binanceContractABI = binanceNFTContractABI.abi;

// const binanceContractAddress = binanceNFTContractABI.networks[3].address;

// const contractB = new web3B.eth.Contract(binanceContractABI, binanceContractAddress);

const TRXHashes = [];

/**
 * @dev fetch account key credentials from account mnemonic provided by user
 * @param {*} req wallet mnemonic only provided by user
 * @param {*} res provide key credentials of user wallet
 */

const saveEncryptedMnemonic = async (req, res) => {

    const encryptedMnemonic = await crypto.AES.encrypt(req.body.mnemonic, process.env.PASS_SEC).toString();

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send("User not found!");

    if (user !== null) {

        await saveAccount(req.body.email, encryptedMnemonic);

        res.status(200).send({ success: true, status: "Your details are saved, Please try again to login!" })

    }
    else {
        res.status(404).send({ success: false, status: "User details not found! Please create an account first to get an access of your wallet through our app." })
    }
}

const walletImport = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.query.email });

        const decryptMnemonic = crypto.AES.decrypt(user.mnemonic, process.env.PASS_SEC).toString(crypto.enc.Utf8);

        const wallet = Wallet.fromMnemonic(decryptMnemonic, `m/44'/60'/0'/0/0`);

        if (wallet !== null) {

            accountBalance = await web3.eth.getBalance(wallet.address.toLowerCase());
            binanceAccountBalance = await web3B.eth.getBalance(wallet.address.toLocaleLowerCase());

            res.status(200).send({
                success: true,
                publicKey: wallet.address.toLowerCase(),
                privateKey: wallet._signingKey().privateKey,
                ETHBalance: accountBalance / 10 ** 18,
                BinanceBalance: binanceAccountBalance / 10 ** 18
            });
        }
        else {
            res.status(404).send({ success: false, status: "data not found!" });
        }
    }
    catch (error) {
        res.status(503).send({ success: false, status: "server error" });
    }
}

// U2FsdGVkX195xK7uSmkF+pVBisp/c/rFSfN1TLhVhgd/DfuGNZ+iFLS08CphTvN0MvGWa1FnpIwjf8lxn5HXOi2bOwSTNUqYwShufs61naBraWJHSbKRRSbUe+EDEs/W
/**
 * @dev get all Ethereum transactions details of wallet
 * @param {*} req public key and private keys of wallet
 * @param {*} res all transactions done by public key on platform
 */
const getETHTRXDetails = async (req, res) => {
    try {

        const publicKey = req.publicKey;
        console.log(publicKey);

        const userTransactions = await TRXHash.find({ network: 'Ethereum', trxSenderAddress: publicKey.toLowerCase() });

        if (!userTransactions) res.status(404).send({ success: false, status: "Data Not Found!" });

        let trxHashes = userTransactions.map(function (i) {
            return i.trxHash;
        }).reverse();

        console.log(trxHashes);

        let trxData = [];

        if (trxHashes) {
            for (trx of trxHashes) {
                let receipt = await web3.eth.getTransactionReceipt(trx)
                    .then((result) => { return result })
                    .catch((error) => res.status(404).send({ success: false, status: "Transaction not found!" }));

                TRXHashes.push(receipt);
            }

            console.log(TRXHashes);

            trxData = TRXHashes.map(function (i) {

                return { isTrueTransactionMined: i.status, from: i.from, to: i.to, gasUsed: i.gasUsed, transactionHash: i.transactionHash };
            });

            res.status(200).send(trxData);

        }


        TRXHashes.splice(0, TRXHashes.length);
        trxData.splice(0, trxData.length);

    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}

// /**
//  * @dev get all Ethereum transactions details of wallet
//  * @param {*} req public key and private keys of wallet
//  * @param {*} res all transactions done by public key on platform
//  */
// const getBNBTRXDetails = async (req, res) => {
//     try {

//         const publicKey = req.publicKey;
//         console.log(publicKey);

//         const userTransactions = await TRXHash.find({ network: 'Binance', trxSenderAddress: publicKey.toLowerCase() });

//         if (!userTransactions) res.status(404).send({ success: false, status: "Data Not Found!" });

//         let trxHashes = userTransactions.map(function (i) {
//             return i.trxHash;
//         }).reverse();

//         console.log(trxHashes);

//         let trxData = [];

//         if (trxHashes) {
//             for (trx of trxHashes) {
//                 let receipt = await web3B.eth.getTransactionReceipt(trx)
//                     .then((result) => { return result })
//                     .catch((error) => res.status(404).send({ success: false, status: "Transaction not found!" }));

//                 TRXHashes.push(receipt);
//             }

//             console.log(TRXHashes);

//             trxData = TRXHashes.map(function (i) {
//                 return { isTrueTransactionMined: i.status, from: i.from, to: i.to, gasUsed: i.gasUsed, transactionHash: i.transactionHash };
//             });

//             res.status(200).send(trxData);

//         }


//         TRXHashes.splice(0, TRXHashes.length);
//         trxData.splice(0, trxData.length);

//     }
//     catch (error) {
//         res.status(404).send({ status: 'data not found', errorStatus: error });
//     }
// }

const saveAccount = async (email, mnemonic) => {
    if (mnemonic) {
        User.updateOne(

            { email: email },

            {

                $set: {

                    mnemonic: mnemonic,

                },

            }

        )
            .then((result) => console.log("Mnemonic is saved Successfully"))

            .catch((err) => console.log(err));

        return true;
    }
    else {
        return false;
    }
}

module.exports = { walletImport, getETHTRXDetails, saveEncryptedMnemonic };