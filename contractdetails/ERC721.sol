
pragma solidity ^0.5.2;
// pragma experimental ABIEncoderV2;
pragma experimental ABIEncoderV2;
// pragma experimental "v0.5.0";
library SafeMath {
    /**
     * @dev Multiplies two unsigned integers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b,"wrong multiplication");

        return c;
    }

    /**
     * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0,"wrong divisin");
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "wrong subtraction");
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two unsigned integers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "wrong addition");

        return c;
    }

    /**
     * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "wrong mod value");
        return a % b;
    }
}

library Counters {
    using SafeMath for uint256;

    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        counter._value += 1;
    }

    function decrement(Counter storage counter) internal {
        counter._value = counter._value.sub(1);
    }
}

library Address {
    /**
     * Returns whether the target address is a contract
     * @dev This function will return false if invoked during the constructor of a contract,
     * as the code is not actually created until after the constructor finishes.
     * @param account address of the account to check
     * @return whether the target address is a contract
     */
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        // XXX Currently there is no better way to check if there is a contract in an address
        // than to check the size of the code at that address.
        // See https://ethereum.stackexchange.com/a/14016/36603
        // for more details about how this works.
        // TODO Check this again before the Serenity release, because all addresses will be
        // contracts then.
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }
}



contract ERC721 {

    using SafeMath for uint256;

    using Address for address;

    using Counters for Counters.Counter;

    address owner;

    // bool bidEnded = false;
    mapping(uint256 => bool) bidEnded;

    bool paymetTransferred = false; 

    address payable private nftOwner;

    uint256 tID;

    uint256 public totalTokensMinted;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    mapping(address => mapping(uint256 => bool)) private isOwner;

    struct NFTDetails {

        string createrName;

        string ownerName;

        address payable tokenOwner;

        uint256 tokenID;

        uint256 nftMintTime;

        uint256 value;

        string nftName;

        bool isNFTBiddingDone;

        string uri;

        string description;
        
    }

    struct NFTOwnerDetails {

        address  tokenOwner;

        uint256 tokenID;

        string ownerName;

        uint256 totalTokensMinted;

    }

    struct Participants {

        address payable bidParticipatorAddress;

        string bidParticipatorName;

        uint256 bidAmount;

    }

    NFTDetails nftDetails;

    NFTOwnerDetails nftOwnerDetails;

    Participants participants;

    // Mapping from token ID to owner
    mapping (uint256 => address) private _tokenOwner;

    // Mapping from token ID to approved address
    mapping (uint256 => address) private _tokenApprovals;

    // Mapping from owner to number of owned token
    mapping (address => Counters.Counter) private _ownedTokensCount;

    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    mapping(uint256 => NFTDetails) public NFTInfo;

    mapping(uint256 => NFTOwnerDetails) private NFTOwnerInfo;

    mapping(address => mapping(uint256 => NFTDetails)) private nftListByNFTOwner;

    mapping(uint256 => uint256) private tokenBiddingEndTime;

    mapping(address => uint256) private getTokenID;

    event Details(address, uint256, uint256, string);

    event NFTMinted(address tokenOwner, uint256 tokenID, uint256 tokenMintTime);

    mapping(uint256 => uint256) private auctionEndTime;

    mapping(uint256 => uint256) private biddingTime;

    mapping(uint256 => address payable)  public highestBidder;

    mapping(uint256 => string)  public highestBidderName;

    mapping(uint256 => uint256) public highestBid;

    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    mapping(uint256 => Participants[]) public tokenWiseBidParticipatorList;

    event HighestBidIncrease(address bidder, uint256 amount);

    event AuctionEnded(address winner, uint256 amount);

    event PaymentTransferred(address buyer, address seller, bool paymentTransferred);

    event NFTTransferred(address buyer, address seller, uint256 tokenID, bool NFTTransferred);

    NFTDetails[] public nftList;

    constructor () public {
        
    }

    function getNFTList() public view returns(NFTDetails[] memory){
        return nftList;
    }

     modifier onlyOwner() {

        nftOwner = msg.sender;
        _;
    }

    function balanceOf(address _account) public view returns (uint256) {

        require(_account != address(0), "NULL Address");

        return _ownedTokensCount[_account].current();

    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {

        address nftHolder = _tokenOwner[tokenId];

        require(nftHolder != address(0),"address is null!");

        return nftHolder;
    }

    
    function transferFrom(address from, address to, uint256 tokenId) private {

        _transferFrom(from, to, tokenId);

    }

    
    function safeTransferFrom(address from, address to, uint256 tokenId) private {

        transferFrom(from, to, tokenId);

    }

    
    function _exists(uint256 _tokenId) internal view returns (bool) {

        address nftHolder = _tokenOwner[_tokenId];

        return nftHolder != address(0);
    }

    
    function _mint(address to, uint256 _tokenId) internal {

        require(to != address(0), "address is zero");

        require(!_exists(_tokenId), "address doesn't exists");

        _tokenOwner[_tokenId] = to;

        _ownedTokensCount[to].increment();

        emit Transfer(address(0), to, _tokenId);

    }

    
    function _burn(address _account, uint256 _tokenId) internal {

        require(ownerOf(_tokenId) == _account, "address mismatch");

        _clearApproval(_tokenId);

        _ownedTokensCount[_account].decrement();

        _tokenOwner[_tokenId] = address(0);

        emit Transfer(_account, address(0), _tokenId);

    }

    function _burn(uint256 _tokenId) internal {

        _burn(ownerOf(_tokenId), _tokenId);

    }

    
    function _transferFrom(address from, address to, uint256 _tokenId) internal {

        require(ownerOf(_tokenId) == from,"owner is not authenticated");

        require(to != address(0),"address is zero -one");

        _clearApproval(_tokenId);

        _ownedTokensCount[from].decrement();

        _ownedTokensCount[to].increment();

        _tokenOwner[_tokenId] = to;

        emit Transfer(from, to, _tokenId);

    }


    function _clearApproval(uint256 tokenId) private {

        if (_tokenApprovals[tokenId] != address(0)) {

            _tokenApprovals[tokenId] = address(0);

        }

    }

    // BIDDING   
    function mintNFT(
        string memory _nftName,
        uint256 price,
        string memory ownerName,
        string memory uri,
        string memory description
    ) public {

        uint256 _tokenID = tID +1;

        tID = _tokenID;

        _mint(msg.sender, _tokenID);

        uint256 mintTime = block.timestamp;

        nftDetails = NFTDetails(ownerName, ownerName, msg.sender, _tokenID, mintTime,price, _nftName, false, uri, description);

        nftList.push(nftDetails);

        NFTInfo[_tokenID] = nftDetails;

        NFTOwnerInfo[_tokenID] = nftOwnerDetails;

        totalTokensMinted = nftList.length;

        nftOwnerDetails = NFTOwnerDetails(
            msg.sender,
            _tokenID,
            ownerName,
            totalTokensMinted
        );

        nftListByNFTOwner[msg.sender][_tokenID] = nftDetails;

        getTokenID[msg.sender] = _tokenID;

        isOwner[msg.sender][_tokenID] = true;

        emit NFTMinted(msg.sender, _tokenID, mintTime);

    }

    function transferPayment(address payable _from, address payable _to)
        public
        payable
    {
        require(
            msg.value != 0 && _from != address(0),
            "Must send ethers to the seller. You are sending 0 amount as payment to seller."
        );

        require(_from != address(0) && _to != address(0), "address is Empty.");

        uint256 amount = msg.value;

        _from = msg.sender;

        _to.transfer(amount);

        paymetTransferred = true;

        emit PaymentTransferred( _from,  _to, true);
    }

    function transferNFT(
        address seller,
        address payable buyer,
        string calldata buyerName,
        uint256 tokenID
    ) external{
        require(
            paymetTransferred == true,
            "Payment has not yet been transferred to the NFT Owner. Please Send Payment in time."
        );

        require(
            ownerOf(tokenID) != buyer,
            "Buyer can not be the owner of NFT at this stage."
        );

        safeTransferFrom(seller, buyer, tokenID);

        uint256 price = nftListByNFTOwner[seller][tokenID].value;

        string memory name = nftListByNFTOwner[seller][tokenID].ownerName;

        string memory uri = nftListByNFTOwner[seller][tokenID].uri;

        string memory nftName = nftListByNFTOwner[seller][tokenID].nftName;

        string memory description = nftListByNFTOwner[seller][tokenID].description;

        nftOwner = buyer;

        paymetTransferred = false;

        nftDetails = NFTDetails(name, buyerName, buyer, tokenID, 0, price, nftName, false, uri, description);

        nftListByNFTOwner[buyer][tokenID] = nftDetails;

        NFTInfo[tokenID] = nftDetails;

        isOwner[buyer][tokenID] = true;
        isOwner[seller][tokenID] = false;

        emit NFTTransferred(buyer, seller, tokenID, true);

    }
    
    function bidNFT(uint256 tokenID, string memory bidderName) internal {  

        require(block.timestamp < auctionEndTime[tokenID], "auction already ended.");

        require(
            msg.value >= highestBid[tokenID],
            "Equal or higher than this bid is already present"
        );

        highestBid[tokenID] = msg.value;

        highestBidder[tokenID] = msg.sender;

        highestBidderName[tokenID] = bidderName;

        require(highestBid[tokenID] != 0, "Bidding value is zero, can not be entered!");

        pendingReturns[tokenID][highestBidder[tokenID]] = highestBid[tokenID];

        emit HighestBidIncrease(msg.sender, msg.value);

    }

    function setAuctionPeriod(uint256 _biddingTime, uint256 tokenID)
        external
        onlyOwner
        returns (uint256, uint256)
    {
        require(
            ownerOf(tokenID) ==
                nftListByNFTOwner[msg.sender][tokenID].tokenOwner,
            "Token is not owned by you!"
        );

        biddingTime[tokenID] = _biddingTime;

        bidEnded[tokenID] = false;

        auctionEndTime[tokenID] = block.timestamp + biddingTime[tokenID];

        return (biddingTime[tokenID], auctionEndTime[tokenID]);
    }

    function getAuctionPeriod(uint256 tokenID) public view returns (uint256, uint256) {

        return (biddingTime[tokenID], auctionEndTime[tokenID]);

    }

    function isPriorBidPresent(uint256 _tokenID, address _bidder) public view returns(bool){

        uint256 length = tokenWiseBidParticipatorList[_tokenID].length;

        for(uint256 i = 0; i < length; i++){

            if(tokenWiseBidParticipatorList[_tokenID][i].bidParticipatorAddress == _bidder){

                return true;
    
            }    

        }

        return false;
    }

    function checkHighestBidOfToken(uint256 tokenID, uint256 bidAmount) public view returns(bool){
        if (highestBid[tokenID] == bidAmount ){
            return false;
        }
    }

    function bidding( address _nftOwner, address payable _bidder, uint256 _tokenID, string memory bidParticipatorName) internal  returns(bool){
        
        getAuctionPeriod(_tokenID);

        require(
            nftListByNFTOwner[_bidder][_tokenID].tokenOwner != _nftOwner,
            "bidder is not the owner of this NFT."
        );

        require(
            nftListByNFTOwner[_nftOwner][_tokenID].tokenID == _tokenID,
            "token ID is wrong. Perhaps this token is not minted yet."
        );

        bidNFT(_tokenID, bidParticipatorName);

        uint256 bidAmount = msg.value;

        participants = Participants(_bidder, bidParticipatorName, bidAmount );

        tokenWiseBidParticipatorList[_tokenID].push(participants);

        return true;

    }

    function placeFirstBid(
        address _nftOwner,
        address payable _bidder,
        uint256 _tokenID,
        string calldata bidParticipatorName
    ) external payable returns (bool) { 

        require( isPriorBidPresent(_tokenID, _bidder) == false, "Since you have already bid and entered some funds as a BID AMOUNT into our platform, please collect your funds first and re-bid here.");  

        getAuctionPeriod(_tokenID);

        bidding(_nftOwner, _bidder, _tokenID, bidParticipatorName);
             
    }

    function updatePreviousBidAmountToZero(address payable _bidder, uint256 _tokenID) internal returns(bool){
        
        require( isPriorBidPresent(_tokenID, _bidder) == true,"Prior Bid is present");  

        uint256 length = tokenWiseBidParticipatorList[_tokenID].length;

        for(uint256 i = 0; i < length; i++){

            if(tokenWiseBidParticipatorList[_tokenID][i].bidParticipatorAddress == _bidder){

                delete tokenWiseBidParticipatorList[_tokenID][i];

                return true;
    
            }    

        }

        return false;

    }

    function reBid(address _nftOwner, address payable _bidder, uint256 _tokenID, string calldata bidParticipatorName) external payable returns(bool){

            require( isPriorBidPresent(_tokenID, _bidder) == true, "Place your first bid then have a try to re-bidding.");  

            updatePreviousBidAmountToZero(_bidder, _tokenID);

            _bidder = msg.sender;

            uint256 amount = pendingReturns[_tokenID][_bidder];

            require(amount > 0, "amount must be geater than zero.");

            if (!(_bidder).send(amount)) {

            pendingReturns[_tokenID][_bidder] = amount;

            return false;

            }

            bidding(_nftOwner, _bidder, _tokenID,  bidParticipatorName);

            return true;
    }

    function compareAuctionTime(uint256 tokenID) external view returns (bool) {
        if (block.timestamp < auctionEndTime[tokenID]) {
            return true;
        } else {
            return false;
        }
    }

    event DeclareBIDWinner(address tokenOwner, uint256 tokenID, bool isBiddingDone);

    function declareWinner(uint256 tokenID)
        external
    {
        if (block.timestamp < auctionEndTime[tokenID]) {
            revert("Auction is still going on...Bid fast to win it...");
        } else {

            require(ownerOf(tokenID) == msg.sender, "Sorry, You are not the owner of this NFT, You can not close this bid.");

            bidEnded[tokenID] = true;

            uint256 nftBiddingTime = nftListByNFTOwner[msg.sender][tokenID].nftMintTime;

            address payable nftBidder = nftListByNFTOwner[msg.sender][tokenID].tokenOwner;

            string memory creatorName = nftListByNFTOwner[nftOwner][tokenID].createrName;

            string memory uri  = nftListByNFTOwner[nftOwner][tokenID].uri;

            string memory bidWinnerName = highestBidderName[tokenID];

            string memory description = nftListByNFTOwner[nftOwner][tokenID].description;

            string memory nftName = nftListByNFTOwner[nftOwner][tokenID].nftName;

            emit AuctionEnded(highestBidder[tokenID], highestBid[tokenID]);

            nftBidder.transfer(highestBid[tokenID]);

            uint256 price = nftListByNFTOwner[nftOwner][tokenID].value;

            safeTransferFrom(nftOwner, highestBidder[tokenID], tokenID);

            pendingReturns[tokenID][highestBidder[tokenID]] = 0;

            nftListByNFTOwner[highestBidder[tokenID]][tokenID]
                .tokenOwner = highestBidder[tokenID];

            nftListByNFTOwner[highestBidder[tokenID]][tokenID].tokenID = tokenID;
            // name, uri, description must be seen after completing bid process.
            nftListByNFTOwner[highestBidder[tokenID]][tokenID].isNFTBiddingDone = true;

            nftOwner = highestBidder[tokenID]; 

            nftDetails = NFTDetails( creatorName, bidWinnerName, nftOwner, tokenID, nftBiddingTime,price, nftName, true, uri, description);

            nftListByNFTOwner[nftOwner][tokenID] = nftDetails;

            NFTInfo[tokenID] = nftDetails;

            highestBid[tokenID] = 0;

            auctionEndTime[tokenID] = 0;

            biddingTime[tokenID] = 0;

            isOwner[highestBidder[tokenID]][tokenID] = true;

            isOwner[msg.sender][tokenID] = false;

            settleBidPayment(tokenID);

            emit DeclareBIDWinner(nftListByNFTOwner[highestBidder[tokenID]][tokenID].tokenOwner, tokenID, true);
            
        }
    }

    function settleBidPayment(uint256 tokenID) internal{

        address payable bidderAddress;

        uint256 amount;

        for(uint256 i = 0; i < tokenWiseBidParticipatorList[tokenID].length; i++){

            bidderAddress = tokenWiseBidParticipatorList[tokenID][i].bidParticipatorAddress;

                if(bidderAddress != 0x0000000000000000000000000000000000000000){

                    amount = pendingReturns[tokenID][bidderAddress];

                    pendingReturns[tokenID][bidderAddress] = 0;

                    if (!(bidderAddress).send(amount)) {

                    pendingReturns[tokenID][bidderAddress] = amount;

                }
            }
        }
    }

    function getNFTOwner(uint256 tokenID) external view returns (address, uint256, uint256, bool) {

        return (NFTInfo[tokenID].tokenOwner, NFTInfo[tokenID].tokenID, NFTInfo[tokenID].nftMintTime, NFTInfo[tokenID].isNFTBiddingDone);

    }

    function withdrawFunds(uint256 _tokenID, address _bidder) external returns (bool) {

        _bidder = msg.sender;

        uint256 amount = pendingReturns[_tokenID][_bidder];

        require(amount > 0, "amount must be geater than zero.");

        pendingReturns[_tokenID][_bidder] = 0;

        if (!(msg.sender).send(amount)) {

            pendingReturns[_tokenID][_bidder] = amount;

            return false;
        }

        return true;
    }

    function confirmOwner(uint256 tokenID, address tokenOwner) public view returns(bool){
        return isOwner[tokenOwner][tokenID];
    }

    function getBiddersList(uint256 tokenID) public view returns(Participants[] memory l){
        l = tokenWiseBidParticipatorList[tokenID];
        return l;
    }

    function checkBidEnded(uint256 tokenID) public view returns(bool){
        return bidEnded[tokenID];
    }

    // function returnFundsAfterBid(uint256 _tokenID) external returns(bool){

    //     uint256 length = tokenWiseBidParticipatorList[_tokenID].length;
    //     address payable bidderAddress;
    //     uint256 amount;

        
    //     for(uint256 i = 0; i < length; i++){
    //         bidderAddress = tokenWiseBidParticipatorList[_tokenID][i].bidParticipatorAddress;
    //         // amount = tokenWiseBidParticipatorList[_tokenID][i].bidAmount;
    //         // bidderAddress.transfer(amount);

    //         amount = pendingReturns[bidderAddress];

    //         require(amount > 0, "amount must be geater than zero.");

    //         pendingReturns[bidderAddress] = 0;

    //          if (!(bidderAddress).send(amount)) {

    //         pendingReturns[bidderAddress] = amount;

    //         return false;

    //         }
            
    //     }

    //     return true;
                
    // }
    
}
