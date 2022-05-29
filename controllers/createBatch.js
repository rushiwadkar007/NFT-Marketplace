const Web3 = require('web3');
const nftContractABI = require("../contractdetails/batch.json");
const ETx = require("ethereumjs-tx").Transaction;
const dotenv = require("dotenv");
dotenv.config();
const TRXHash = require("../models/transactions");
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"));
const contractABI = nftContractABI.abi;
const contractAddress = nftContractABI.networks[3].address;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const token = process.env.IPFS;
const client = new Web3Storage({ token });
const NFTs = [];
const NFTData = {};
const allNFTs = [];
/**
 * @dev function to create unique NFT using ERC721 smart contract
 * @param {*} req gets parameters for creating new NFT which are NFT name, NFT price, NFT creator name, NFT image url path, creator wallet mnemonic
 * @param {*} res NFT creation transaction hash along with creator public key
 */
const createNFTBatchXLS = async (req, res) => {
    try {
        const publicKey = req.publicKey;

        const privateKey = req.privateKey;

        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');

        const NetworkId = await web3.eth.net.getId();

        let strBigNumVal = 0;

        let amountToSend = [];

        for (let i = 0; i < req.prices.length; i++) {

            strBigNumVal = req.prices[i].toString();

            amountToSend[i] = web3.utils.toWei(strBigNumVal);

        }

        const userPrivKeyBuffered = Buffer.from(privateKey.toString(), "hex");

        console.log(req.nftName, amountToSend, req.ownerName, req.ids, amountToSend, req.nftURI, req.description);

        const transferFunction = contract.methods.mintBatchNFTs(req.nftName, amountToSend, req.ownerName, req.ids, req.amounts, req.nftURI, req.description).encodeABI();

        const rawTx = {

            from: publicKey,

            to: contractAddress,

            data: transferFunction,

            nonce: nonce,

            value: "0x00000000000000",

            gas: web3.utils.toHex(1500000 * req.nftName.length),

            gasPrice: web3.utils.toHex(30000000000),

            chainId: NetworkId,

        };

        let trans = new ETx(rawTx, {

            chain: "rinkeby",

            hardfork: "petersburg",

        });

        trans.sign(userPrivKeyBuffered);

        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

            .on("receipt", async (data) => {

                const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.logs[0].transactionHash, trxType: 'ERC1155BatchMintXLS' })
                trxHashObject.save()
                    .then((result) => {

                        console.log("Transaction details saved! ", result);

                    })

                    .catch((err) => {

                        console.log(err);

                    });

                res.status(200).send({ success: true, minter: data.from, trxHASH: data.logs[0].transactionHash });

            })

            .on("error", async (data) => {

                res.status(404).send({ status: 'data not found', data: data });

            })

    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}


const createNFTBatch = async (req, res) => {

    try {
        const { nftName, prices, ownerName, totalAmountOfNFTsCreating, amounts, description } = req.body;

        const ids = [];
        console.log("dfdf")
        let totalNFTsCreated = await contract.methods.totalNFTsCreated().call();
        console.log(totalNFTsCreated)
        for (let i = 1; i <= totalAmountOfNFTsCreating; i++) {

            await ids.push(Number(totalNFTsCreated) + i);

        }

        console.log(nftName, prices, ownerName, ids, amounts, description);

        let uris = [];
        console.log("req.files.length ", req.files.length);
        for (let i = 0; i < req.files.length; i++) {
            const files = await getFilesFromPath(req.files[i].path);

            const cid = await client.put(files);

            uris.push(`https://ipfs.io/ipfs/${cid}/${req.files[0].filename}`);
        }
        const publicKey = req.publicKey;
        console.log(uris);

        const privateKey = req.privateKey;
        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');
        const NetworkId = await web3.eth.net.getId();
        let strBigNumVal = 0;
        let amountToSend = [];
        for (let i = 0; i < prices.length; i++) {
            strBigNumVal = prices[i].toString();
            amountToSend[i] = web3.utils.toWei(strBigNumVal);
        }

        const userPrivKeyBuffered = Buffer.from(privateKey, "hex");
        const transferFunction = contract.methods.mintBatchNFTs(nftName, amountToSend, ownerName, ids, amounts, uris, description).encodeABI();
        const rawTx = {
            from: publicKey,
            to: contractAddress,
            data: transferFunction,
            nonce: nonce,
            value: "0x00000000000000",
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(30000000000),
            chainId: NetworkId,
        };

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

        trans.sign(userPrivKeyBuffered);

        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
            .on("receipt", async (data) => {
                const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.logs[0].transactionHash, trxType: 'ERC1155BatchMint' })
                trxHashObject.save()
                    .then((result) => {

                        console.log("Transaction details saved! ");

                    })

                    .catch((err) => {

                        console.log(err);

                    });
                res.status(200).send({ success: true, minter: data.from, trxHASH: data.logs[0].transactionHash });
            })
            .on("error", async (data) => {
                res.status(404).send({ status: 'data not found', data: data });
            })

        ids.splice(0, ids.length);
    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}


/**
 * @dev get all NFT collections function
 * @param {*} req nothing to pass parameters
 * @param {*} res gets all NFT collections on platform
 */
const getBatchList = async (req, res) => {

    try {

        const totalTokens = await contract.methods.totalNFTsCreated().call();

        for (let i = 0; i < totalTokens; i++) {

            var details = await contract.methods.nftDetailsArray(i).call();

            console.log(details);

            NFTs.push({ ownerName: details.tokenOwnerName, createrName: details.tokenOwnerName, totalNFTsAmount: Number(details.totalNFTsAmount), tokenID: Number(details.tokenID), nftMintTime: Number(details.nftMintTime), price: Number(details.value), nftName: details.nftName, isNFTBiddingDone: details.isNFTBiddingDone, uri: details.uri });

        }

        if (NFTs.length !== null || NFTs.length !== 0) {

            res.status(200).send({ success: true, totalCreatedNFTs: NFTs.length, data: NFTs.reverse() });

        }

        else {

            res.status(404).send({ success: false, status: "data not found!" });

        }

        NFTs.splice(0, NFTs.length);
    }

    catch (error) {

        res.status(400).send({ success: false, status: "data not found" });

    }
}

const getERC1155NFTByTokenID = async (req, res) => {
    try {
        const tokenID = req.body.tokenID;
        if (tokenID === null) res.status(404).send({ data: `NFT Not Found!`, status: false })
        let nftDetails = await contract.methods.nftINFO(tokenID).call();
        let owners = await contract.methods.ownerOf(tokenID).call();
        res.status(201).send({ owners: owners, data: { tokenCreaterName: nftDetails["tokenCreaterName"], tokenOwnerName: nftDetails["tokenOwnerName"], NFTAmount: nftDetails["totalNFTsAmount"], tokenID: nftDetails["tokenID"], nftMintTime: nftDetails["nftMintTime"], value: nftDetails["value"], name: nftDetails["nftName"], isNFTBiddingDone: nftDetails["isNFTBiddingDone"], uri: nftDetails["uri"] }, status: true });
    }
    catch (error) {
        res.status(400).send({ data: `Server error!`, status: false })
    }
}

const buyERC1155NFT = async (req, res) => {

    const { price, buyerName, tokenID, totalTokensPurchasing } = req.body;

    const transactionStatus = false;

    try {

        if (req.sellerPublicKey != undefined && req.buyerPublicKey != undefined && price != undefined && tokenID != undefined) {

            try {

                let newTransactionStatus = await transferPayment(req.sellerPublicKey, req.buyerPublicKey, price, req.buyerPrivateKey, transactionStatus).
                    then((result) => { return result }).
                    catch((error) => res.status(404).send({ success: false, status: error }));
                console.log('newTransactionStatus ', newTransactionStatus);
                if (newTransactionStatus != false) {
                    console.log('newTransactionStatus ', newTransactionStatus);

                    const nftTransferTransactionDetails = await transferERC1155NFT(req.sellerPublicKey, req.buyerPublicKey, req.body.buyername, req.sellerName, tokenID, req.sellerPrivateKey, totalTokensPurchasing).
                        then((result) => {

                            console.log('result ', result);

                            return result;

                        }).
                        catch((error) => res.status(404).send({ success: false, status: error }));

                    res.status(200).send({ success: true, trxDetails: NFTData });
                }

                else {

                    res.status(404).send({ success: false, status: `Seller has not received a payment so he can not transfer this NFT at this moment. Please re-initiate payment transfer transaction` });

                }

            }

            catch (error) {

                res.status(404).send({ success: false, status: "Execution failed!" });

            }

        }
        // else {

        //     res.status(404).send({ success: false, status: "Server Error!" });

        // }

    }

    catch (error) {

        res.status(500).send({ success: false, status: 'Server Error' });

    }

    for (var member in NFTData) delete NFTData[member];

}

const buyERC1155BatchNFT = async (req, res) => {

    const { price, tokenIDs, totalTokensPurchasing } = req.body;

    // var result = tokenIDs.map(function (x) {
    //     return parseInt(x, 10);
    // });
    // console.log(tokenIDs, totalTokensPurchasing);
    // console.log("aaaabbbbaaaaabbbbcccccc", typeof Number(tokenIDs));

    const transactionStatus = false;

    try {

        if (req.sellerPublicKey != undefined && req.buyerPublicKey != undefined && price != undefined && tokenIDs != undefined) {

            try {

                let newTransactionStatus = await transferPayment(req.sellerPublicKey, req.buyerPublicKey, price, req.buyerPrivateKey, transactionStatus).
                    then((result) => { return result }).
                    catch((error) => res.status(404).send({ success: false, status: error }));
                console.log('newTransactionStatus ', newTransactionStatus);
                if (newTransactionStatus != false) {
                    console.log('newTransactionStatus ', newTransactionStatus);

                    const nftTransferTransactionDetails = await transferBatchERC1155NFT(req.sellerPublicKey, req.buyerPublicKey, req.body.buyername, tokenIDs, req.sellerPrivateKey, totalTokensPurchasing).
                        then((result) => {

                            console.log('result ', result);

                            return result;

                        }).
                        catch((error) => res.status(404).send({ success: false, status: 'done done' }));
                    // console.log('api ', NFTData)
                    res.status(200).send({ success: true, trxDetails: NFTData });
                }

                else {

                    res.status(404).send({ success: false, status: `Seller has not received a payment so he can not transfer this NFT at this moment. Please re-initiate payment transfer transaction` });

                }

            }

            catch (error) {

                res.status(404).send({ success: false, status: "Execution failed!" });

            }

        }
        else {

            res.status(404).send({ success: false, status: "Server Error!" });

        }

    }

    catch (error) {

        res.status(500).send({ success: false, status: 'Server Error' });

    }

    for (var member in NFTData) delete NFTData[member];

}


const transferPayment = async (seller, buyer, price, privateKey, transactionStatus) => {

    const nonce = await web3.eth.getTransactionCount(buyer, 'pending');
    console.log("nonce ", nonce);

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = await Buffer.from(privateKey, 'hex');

    const transferFunction = await contract.methods.transferPayment(buyer, seller).encodeABI();

    const rawTx = {
        from: buyer,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: web3.utils.toWei(web3.utils.toBN(price), 'ether'),
        gas: web3.utils.toHex(3000000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",

        hardfork: "petersburg",

    });

    console.log(trans.sign(privateKeyBuffered));

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: buyer, trxHash: data.transactionHash, trxType: 'ERC1155TransferPayment' })

            trxHashObject.save()
                .then((result) => {

                    console.log("Transfer Payment Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });
            console.log(data);
            transactionStatus = true;

            console.log('transaction status ', transactionStatus);
        })
        .on("error", async (data) => {
            console.log(data);
            console.log('transaction status ', transactionStatus);
            transactionStatus = false;
        });
    return transactionStatus;
}

const transferERC1155NFT = async (seller, buyer, buyerName, sellerName, tokenID, privateKey, totalTokensTransferred) => {
    console.log("transfer nft erc155 ", seller, buyer, buyerName, sellerName, tokenID, privateKey, totalTokensTransferred);

    const nonce = await web3.eth.getTransactionCount(seller, 'pending');

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = Buffer.from(privateKey, 'hex');

    const transferFunction = await contract.methods.transferNFT(seller, buyerName, sellerName, buyer, tokenID, totalTokensTransferred).encodeABI();
    console.log(transferFunction);
    const rawTx = {
        from: seller,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(3000000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",

        hardfork: "petersburg",

    });


    trans.sign(privateKeyBuffered);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: seller, trxHash: data.transactionHash, trxType: 'ERC1155TransferNFT' })

            trxHashObject.save()
                .then((result) => {

                    console.log("Transfer NFT Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });
            NFTData["network"] = "Ethereum";
            NFTData["from"] = seller;
            NFTData["NewOwner"] = buyer;
            NFTData["oldOwner"] = seller;
            NFTData["trxSenderAddress"] = seller;
            NFTData["tokenID"] = tokenID;
            NFTData["trxHash"] = data.transactionHash;
            NFTData["totalTokensTransferred"] = totalTokensTransferred;
            NFTData["trxType"] = 'ERC1155TransferNFT';

            console.log("NFT data ", NFTData);

            return NFTData;

        })
        .on("error", async (error) => {
            console.log(error);
            return NFTData;
        });
}

const transferBatchERC1155NFT = async (seller, buyer, buyerName, tokenIDs, privateKey, totalTokensTransferred) => {
    // console.log('transferBatchERC1155NFT', seller, buyer, buyerName, tokenIDs, privateKey, totalTokensTransferred);
    const nonce = await web3.eth.getTransactionCount(seller, 'pending');

    const networkID = await web3.eth.net.getId();
    console.log('ajdfdsjfldsafjlkdjflajfldjfl ', typeof buyer, typeof buyerName, typeof seller, typeof tokenIDs, typeof tokenIDs[0], typeof totalTokensTransferred, typeof totalTokensTransferred[0]);
    const privateKeyBuffered = Buffer.from(privateKey, 'hex');
    const transferFunction = await contract.methods.transferBatchNFTs(buyer, buyerName.toString(), seller, tokenIDs, totalTokensTransferred).encodeABI();
    console.log('transferBatchERC1155NFT', transferFunction);
    const rawTx = {
        from: seller,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(3000000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",

        hardfork: "petersburg",

    });


    trans.sign(privateKeyBuffered);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {
            console.log("transfer erc1155 nft data ", data)

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: seller, trxHash: data.transactionHash, trxType: 'ERC1155TransferNFT' })

            await trxHashObject.save()
                .then((result) => {

                    console.log("Transfer NFT Transaction details saved! ", result);

                })

                .catch((err) => {

                    console.log(err);

                });
            NFTData["network"] = "Ethereum";
            NFTData["from"] = seller;
            NFTData["NewOwner"] = buyer;
            NFTData["oldOwner"] = seller;
            NFTData["trxSenderAddress"] = seller;
            NFTData["tokenID"] = tokenIDs;
            NFTData["trxHash"] = data.transactionHash;
            NFTData["totalTokensTransferred"] = totalTokensTransferred;
            NFTData["trxType"] = 'ERC1155TransferNFT';

            console.log("NFT data ", NFTData);

            return NFTData;

        })
        .on("error", async (error) => {
            console.log(error);
            return NFTData;
        });
}

const getERC1155NFTOwners = async (req, res) => {
    try {
        const { tokenID } = req.query;
        const details = await contract.methods.nftINFO(tokenID).call()
        // const totalTokensOwnedByOwner = await contract.methods.totalTokensOwnedByOwner
        if (details !== null) {
            res.status(201).send({ success: true, data: { nftName: details["6"], value: details["5"], creator: details["0"], tokenOwners: details["1"], creatorAddress: details["2"], tokenOwnerAddresses: details["3"], tokenID: details["4"] } });
        }
    }
    catch (e) {
        res.status(400).send({ success: false, data: e });
    }
}

const getOwnerWiseNFTDetails = async (req, res) => {
    try {
        const { tokenID } = req.query;
        const details = await contract.methods.getOwnerwiseNFTDetails(tokenID, req.publicKey).call();
        if (details !== null) {
            res.status(201).send({ success: true, data: details });
        }
    }
    catch (e) {
        res.status(400).send({ success: false, data: e });
    }
}

const getOwnerWiseAllNFTs = async (req, res) => {
    try {

        let totalNFTsCreated = await contract.methods.totalNFTsCreated().call();

        for (let i = 1; i <= totalNFTsCreated; i++) {

            let tokenWiseAllOwners = await contract.methods.allNFTOwners(i).call();

            if (tokenWiseAllOwners.includes(req.publicKey.toString())) {

                const details = await contract.methods.getOwnerwiseNFTDetails(i, req.publicKey).call();
                let detailsObject = Object.assign({}, details);

                if (detailsObject["totalNFTsAmount"] !== 0) {
                    allNFTs.push({ tokenCreatorName: detailsObject["tokenCreatorName"], tokenOwnerName: detailsObject["tokenOwnerName"], tokenOwner: detailsObject["tokenOwner"], totalNFTsAmount: detailsObject["totalNFTsAmount"], tokenID: detailsObject["tokenID"], value: detailsObject["value"], nftName: detailsObject["nftName"], isNFTBiddingDone: detailsObject["isNFTBiddingDone"], uri: detailsObject["uri"], description: detailsObject["description"] });
                }
            }
        }

        res.status(201).send({ success: true, data: allNFTs });
        allNFTs.splice(0, allNFTs.length);
    }
    catch (e) {
        res.status(400).send({ success: false, data: e });
    }
}

module.exports = { createNFTBatchXLS, createNFTBatch, getBatchList, getERC1155NFTByTokenID, buyERC1155NFT, buyERC1155BatchNFT, getERC1155NFTOwners, getOwnerWiseNFTDetails, getOwnerWiseAllNFTs }