const dotenv = require("dotenv");

dotenv.config();

const Web3 = require('web3');

const ETx = require("ethereumjs-tx").Transaction;

const TRXHash = require("../models/transactions");

const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"));

const nftContractABI = require("../contractdetails/nft.json");

const contractABI = nftContractABI.abi;

const contractAddress = nftContractABI.networks[3].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

const setERC721AuctionPeriod = async (req, res) => {
    const { biddingTime, tokenID } = req.body;
    const publicKey = req.publicKey;
    const privateKey = req.privateKey;
    let nonce = await web3.eth.getTransactionCount(publicKey);
    const NetworkId = await web3.eth.net.getId();
    const pvt = Buffer.from(privateKey, "hex");
    const transferFunction = await contract.methods.setAuctionPeriod(biddingTime, tokenID).encodeABI()

    const rawTx = {
        from: publicKey,
        to: contractAddress.toLowerCase(),
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(1500000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: NetworkId,
    };

    trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

    trans.sign(pvt);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721SetAuctionPeriod' })

            trxHashObject.save()
                .then((result) => {

                    console.log("Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });

            res.status(200).send({ success: true, transactionHash: data.transactionHash });

        })
        .on("error", async (data) => {

            res.status(404).send({ status: 'data not found', data: data });

        });

}

const getAuctionPeriod = async (req, res) => {

    try {

        let { tokenID } = req.query;
        console.log(tokenID);

        var details = await contract.methods.getAuctionPeriod(tokenID).call();

        res.status(200).send({ success: true, totalBiddingTimeInMinutes: Number(details["0"]), BiddingEndTime: Number(details["1"]) });
    }
    catch (error) {
        res.status(404).send({ success: false, data: error });
    }

}

const bidERC721NFT = async (req, res) => {

    const { tokenID, bidAmount } = req.body;

    var auctionAmount = Number(bidAmount);

    const tokenOwner = await contract.methods.ownerOf(tokenID).call();

    const publicKey = req.publicKey;
    console.log(publicKey);
    const privateKey = req.privateKey;
    let nonce = await web3.eth.getTransactionCount(publicKey);
    const NetworkId = await web3.eth.net.getId();
    const pvt = Buffer.from(privateKey, "hex");

    const transferFunction = await contract.methods.placeFirstBid(tokenOwner, publicKey, tokenID, req.body.username).encodeABI();

    rawTx = {

        from: publicKey,

        to: contractAddress,

        data: transferFunction,

        nonce: nonce,

        value: web3.utils.toWei(web3.utils.toBN(auctionAmount), 'ether'),

        gas: web3.utils.toHex(1500000),

        gasPrice: web3.utils.toHex(30000000000),

        chainId: NetworkId,
    }

    const trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

    trans.sign(pvt);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721BidNFT' })

            trxHashObject.save()
                .then((result) => {

                    console.log("Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });

            res.status(200).send({ success: true, transactionHash: data.transactionHash });

        })
        .on("error", async (data) => {

            res.status(404).send({ status: 'data not found', data: data });

        });
}

const reBidERC721NFT = async (req, res) => {

    const { tokenID, bidAmount } = req.body;

    var auctionAmount = Number(bidAmount);

    const tokenOwner = await contract.methods.ownerOf(tokenID).call();

    console.log("token Owner ", tokenOwner);

    const publicKey = req.publicKey;
    const privateKey = req.privateKey;
    let nonce = await web3.eth.getTransactionCount(publicKey);
    const NetworkId = await web3.eth.net.getId();
    const pvt = Buffer.from(privateKey, "hex");
    const transferFunction = await contract.methods.reBid(tokenOwner, publicKey, tokenID, req.body.username).encodeABI();

    rawTx = {

        from: publicKey,

        to: contractAddress,

        data: transferFunction,

        nonce: nonce,

        value: web3.utils.toWei(web3.utils.toBN(auctionAmount), 'ether'),

        gas: web3.utils.toHex(1500000),

        gasPrice: web3.utils.toHex(30000000000),

        chainId: NetworkId,
    }

    const trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

    trans.sign(pvt);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721Re-BidNFT' })

            trxHashObject.save()
                .then((result) => {

                    console.log(" reBidERC721NFT Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });

            res.status(200).send({ success: true, transactionHash: data.transactionHash });

        })
        .on("error", async (data) => {

            res.status(404).send({ status: 'data not found', data: data });

        });
}

const declareBidWinner = async (req, res) => {

    const { tokenID } = req.body;
    console.log('declareBIDWINNER ', tokenID)
    const tokenOwner = await contract.methods.ownerOf(tokenID).call();

    console.log(tokenOwner);

    const publicKey = req.publicKey;
    const privateKey = req.privateKey;
    let nonce = await web3.eth.getTransactionCount(publicKey);
    const NetworkId = await web3.eth.net.getId();
    const pvt = Buffer.from(privateKey, "hex");
    const transferFunction = await contract.methods.declareWinner(tokenID, "Rushikesh Wadkar8").encodeABI();

    rawTx = {
        from: req.publicKey.toLowerCase(),

        to: contractAddress,

        data: transferFunction,

        nonce: nonce,

        value: "0x00000000000000",

        gas: web3.utils.toHex(1500000),

        gasPrice: web3.utils.toHex(30000000000),

        chainId: NetworkId,
    }

    const trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

    trans.sign(pvt);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721Re-DeclareBidWinner' })

            trxHashObject.save()
                .then((result) => {

                    console.log(" declareBidWinner Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });

            res.status(200).send({ success: true, transactionHash: data.transactionHash });

        })
        .on("error", async (data) => {

            res.status(404).send({ status: 'data not found', data: data });

        });
}

const withdrawFunds = async (req, res) => {

    const publicKey = req.publicKey;
    const privateKey = req.privateKey;
    let nonce = await web3.eth.getTransactionCount(publicKey);
    const NetworkId = await web3.eth.net.getId();
    const pvt = Buffer.from(privateKey, "hex");
    const transferFunction = await contract.methods.withdrawFunds(publicKey).encodeABI();

    rawTx = {
        from: tokenOwner,

        to: contractAddress,

        data: transferFunction,

        nonce: nonce,

        value: "0x00000000000000",

        gas: web3.utils.toHex(1500000),

        gasPrice: web3.utils.toHex(30000000000),

        chainId: NetworkId,
    }

    const trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

    trans.sign(pvt);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721Re-DeclareBidWinner' })

            trxHashObject.save()
                .then((result) => {

                    console.log(" declareBidWinner Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });

            res.status(200).send({ success: true, transactionHash: data.transactionHash });

        })
        .on("error", async (data) => {

            res.status(404).send({ status: 'data not found', data: data });

        });
}

module.exports = { setERC721AuctionPeriod, getAuctionPeriod, bidERC721NFT, reBidERC721NFT, declareBidWinner, withdrawFunds };