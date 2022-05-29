const dotenv = require("dotenv");

dotenv.config();

const Web3 = require('web3');

const ETx = require("ethereumjs-tx").Transaction;

const Common = require('@ethereumjs/common');

const req = require('express/lib/request');

const TRXHash = require("../models/transactions");

const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"));

const nftContractABI = require("../contractdetails/nft.json");

const contractABI = nftContractABI.abi;

const contractAddress = nftContractABI.networks[3].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

const { Web3Storage, getFilesFromPath } = require('web3.storage');

const token = process.env.IPFS;

const client = new Web3Storage({ token });
const NFTs = [];

/**
 * @dev function to create unique NFT using ERC721 smart contract
 * @param {*} req gets parameters for creating new NFT which are NFT name, NFT price, NFT creator name, NFT image url path, creator wallet mnemonic
 * @param {*} res NFT creation transaction hash along with creator public key
 */
const createNFT = async (req, res) => {

    try {
        const { nftName, price, creatorName, description } = req.body;

        const files = await getFilesFromPath(req.file.path);

        const cid = await client.put(files);

        const publicKey = req.publicKey;

        const privateKey = req.privateKey;

        let nonce = await web3.eth.getTransactionCount(publicKey.toString(), 'pending');

        const NetworkId = await web3.eth.net.getId();

        let strBigNumVal = price.toString();

        let amountToSend = await web3.utils.toWei(strBigNumVal);

        const pvt = Buffer.from(privateKey, "hex");

        console.log(nftName, amountToSend, creatorName, `https://ipfs.io/ipfs/${cid}/${req.file.filename}`, description);

        const transferFunction = await contract.methods.mintNFT(nftName, amountToSend, creatorName, `https://ipfs.io/ipfs/${cid}/${req.file.filename}`, description).encodeABI();

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

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

        trans.sign(pvt);

        await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
            .on("receipt", async (data) => {

                const trxHashObject = new TRXHash({ network: 'Ethereum', trxSenderAddress: publicKey, trxHash: data.transactionHash, trxType: 'ERC721Mint' })

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
    catch (error) {

        res.status(404).send({ status: 'data not found', errorStatus: error });

    }
}

/**
 * @dev get all NFT function
 * @param {*} req nothing to pass parameters
 * @param {*} res gets all NFT on platform
 */
const getNFTList = async (req, res) => {

    try {

        const totalTokens = await contract.methods.totalTokensMinted().call();

        for (let i = 1; i <= totalTokens; i++) {

            var details = await contract.methods.NFTInfo(i).call();

            NFTs.push({ createrName: details.createrName, ownerName: details.ownerName, tokenOwner: details.tokenOwner, tokenID: details.tokenID, nftMintTime: details.nftMintTime, NFTPrice: details.value / 10 ** 18, nftName: details.nftName, isNFTBiddingDone: details.isNFTBiddingDone, uri: details.uri });

        }

        if (NFTs.length !== null || NFTs.length !== 0) {

            res.status(200).send({ success: true, totalCreatedNFTs: NFTs.length, ethereumNFTs: NFTs.reverse() });

        }
        else {

            res.status(404).send({ success: false, status: "data not found!" });

        }
        NFTs.splice(0, NFTs.length)
    }

    catch (error) {

        res.status(400).send({ success: false, status: "data not found" });

    }

}

const getERC721NFTByTokenID = async (req, res) => {
    try {
        const tokenID = req.body.tokenID;
        console.log(tokenID);
        if (tokenID === null) res.status(404).send({ data: `NFT Not Found!`, status: false })
        let nftDetails = await contract.methods.NFTInfo(tokenID).call();
        console.log(nftDetails)
        res.status(201).send({ data: { NFTName: nftDetails.nftName, createrName: nftDetails.createrName, ownerName: nftDetails.ownerName, tokenID: nftDetails.tokenID, nftMintTime: nftDetails.nftMintTime, value: nftDetails.value, isNFTBiddingDone: nftDetails.isNFTBiddingDone, uri: nftDetails.uri }, status: true });
    }
    catch (error) {
        res.status(400).send({ data: null, status: `Server Error` })
    }
}

const getOwnerwiseAllNFTs = async (req, res) => {
    try {
        let totalNFTsCreated = await contract.methods.totalTokensMinted().call();

        let nfts = [];

        for (let i = 1; i <= totalNFTsCreated; i++) {
            console.log(req.publicKey);
            let isOwner = await contract.methods.confirmOwner(i, req.publicKey).call()
            console.log(isOwner);
            if (isOwner == true) {

                let nft = await contract.methods.NFTInfo(i).call();

                nfts.push({ createrName: nft["createrName"], ownerName: nft["ownerName"], tokenOwner: nft["tokenOwner"], tokenID: nft["tokenID"], nftMintTime: nft["nftMintTime"], value: nft["value"] / 10 ** 18, nftName: nft["nftName"], isNFTBiddingDone: nft["isNFTBiddingDone"], uri: nft["uri"], description: nft["description"] });
            }
        }

        res.status(200).send({ success: true, data: nfts.reverse() });
    }
    catch {
        res.status(404).send({ success: false, data: null });
    }

}

const getTokenBiddersList = async (req, res) => {
    try {
        const { tokenID } = req.body;

        const biddersList = await contract.methods.getBiddersList(tokenID).call();
        console.log(biddersList)

        res.status(200).send({ allBidders: biddersList });

    }
    catch (error) {
        res.status(404).send({ success: false, data: null });
    }
}

module.exports = { createNFT, getNFTList, getERC721NFTByTokenID, getOwnerwiseAllNFTs, getTokenBiddersList }
