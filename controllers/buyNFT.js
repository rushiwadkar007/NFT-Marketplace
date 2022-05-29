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

const NFTData = {};

const buyNFT = async (req, res) => {

    const { price, buyerName, tokenID } = req.body;

    const transactionStatus = false;

    try {

        if (req.sellerPublicKey != undefined && req.buyerPublicKey != undefined && price != undefined && tokenID != undefined) {

            try {

                let newTransactionStatus = await transferPayment(req.sellerPublicKey, req.buyerPublicKey, price, req.buyerPrivateKey, transactionStatus).
                    then((result) => { return result }).
                    catch((error) => res.status(404).send({ success: false, status: error }));

                if (newTransactionStatus != false) {

                    const nftTransferTransactionDetails = await transferNFT(req.sellerPublicKey, req.buyerPublicKey, buyerName, tokenID, req.sellerPrivateKey).
                        then((result) => {

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
        gas: web3.utils.toHex(1500000),
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

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: buyer, trxHash: data.transactionHash, trxType: 'ERC721TransferPayment' })

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

const transferNFT = async (seller, buyer, buyerName, tokenID, privateKey) => {

    console.log(seller, buyer, tokenID, privateKey);

    const nonce = await web3.eth.getTransactionCount(seller, 'pending');

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = Buffer.from(privateKey, 'hex');
    console.log(seller, buyer, tokenID)
    const transferFunction = await contract.methods.transferNFT(seller, buyer, buyerName, tokenID).encodeABI();
    console.log(transferFunction);
    const rawTx = {
        from: seller,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(1500000),
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

            const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: seller, trxHash: data.transactionHash, trxType: 'ERC721TransferNFT' })

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
            NFTData["trxType"] = 'ERC721TransferNFT';

            console.log("NFT data ", NFTData);

            return NFTData;

        })
        .on("error", async (error) => {
            console.log(error);
            return NFTData;
        });
}

module.exports = { buyNFT };