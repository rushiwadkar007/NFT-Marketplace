const router = require("express").Router();

const { createNFT, getNFTList, getERC721NFTByTokenID, getOwnerwiseAllNFTs, getTokenBiddersList } = require("../controllers/createNFT");

const { createNFTBatchXLS, createNFTBatch, getBatchList, getERC1155NFTByTokenID, buyERC1155NFT, buyERC1155BatchNFT, getERC1155NFTOwners, getOwnerWiseNFTDetails, getOwnerWiseAllNFTs } = require('../controllers/createBatch');

const { saveEncryptedMnemonic, walletImport, getETHTRXDetails } = require("../controllers/getTRXDetails");

const { setERC1155AuctionPeriod, getERC1155AuctionPeriod, bidERC1155NFT, reBidERC1155NFT, declareERC1155BidWinner } = require('../controllers/batchBidding');

const { getAccount, getCollection, getAccounts } = require('../middlewares/getAccount');

const { buyNFT } = require("../controllers/buyNFT");

const { setERC721AuctionPeriod, getAuctionPeriod, bidERC721NFT, reBidERC721NFT, declareBidWinner } = require("../controllers/bidding");

const bodyParser = require('body-parser');

const { upload } = require('../services/multer');

var urlencodedParser = bodyParser.urlencoded({ extended: true });

router.put('/saveEncryptedMnemonic', urlencodedParser, saveEncryptedMnemonic);

router.get('/walletImport', urlencodedParser, walletImport);

router.get("/getNFTs", getBatchList);

router.get('/getERC721NFTByTokenID', urlencodedParser, getERC721NFTByTokenID);

router.get('/getERC1155NFTByTokenID', urlencodedParser, getERC1155NFTByTokenID);

router.get("/getETHTRXDetails", getAccount, getETHTRXDetails);

router.post('/createNFT', upload.single('image'), urlencodedParser, getAccount, createNFT);

router.post('/createNFTBatch', upload.array('images'), urlencodedParser, getAccount, createNFTBatch);

router.get("/getOwnerWiseNFTDetails", getAccount, getOwnerWiseNFTDetails);

router.post('/createNFTBatchXLS', upload.single('filename'), urlencodedParser, getCollection, createNFTBatchXLS);

router.post('/BuyERC721NFT', urlencodedParser, getAccounts, buyNFT);

router.post("/buyERC1155NFT", urlencodedParser, getAccounts, buyERC1155NFT);

router.post("/buyERC1155BatchNFT", urlencodedParser, getAccounts, buyERC1155BatchNFT);

router.get("/getNFT", getNFTList);

router.get("/getERC1155NFTOwners", getERC1155NFTOwners);

router.get("/getOwnerWiseAllNFTs", getAccount, getOwnerWiseAllNFTs);

router.post("/setERC721AuctionPeriod", urlencodedParser, getAccount, setERC721AuctionPeriod);

router.post("/setERC1155AuctionPeriod", urlencodedParser, getAccount, setERC1155AuctionPeriod);//*****

router.get("/getAuctionPeriod", getAuctionPeriod);

router.get("/getERC1155AuctionPeriod", getERC1155AuctionPeriod);//*****

router.post("/placeFirstBid", urlencodedParser, getAccount, bidERC721NFT);

router.post("/bidERC1155NFT", urlencodedParser, getAccount, bidERC1155NFT);//*****

router.post("/reBidERC721NFT", urlencodedParser, getAccount, reBidERC721NFT);

router.post("/reBidERC1155NFT", urlencodedParser, getAccount, reBidERC1155NFT); //*****

router.post("/declareERC721BidWinner", urlencodedParser, getAccount, declareBidWinner);

router.post("/getOwnerwiseAllNFTs", urlencodedParser, getAccount, getOwnerwiseAllNFTs);

router.post("/declareERC1155BidWinner", urlencodedParser, getAccount, getAccount);

router.get("/getTokenBiddersList", urlencodedParser, getTokenBiddersList);

module.exports = router;