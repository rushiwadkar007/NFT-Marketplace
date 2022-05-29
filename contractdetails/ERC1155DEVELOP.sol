/**
 ________  _______    ______     __      __    _______   _______           __       __   ______   ________  ________  __        __        ______   ______  
/        |/       \  /      \  _/  |   _/  |  /       | /       |         /  \     /  | /      \ /        |/        |/  |      /  |      /      | /      \ 
$$$$$$$$/ $$$$$$$  |/$$$$$$  |/ $$ |  / $$ |  $$$$$$$/  $$$$$$$/          $$  \   /$$ |/$$$$$$  |$$$$$$$$/ $$$$$$$$/ $$ |      $$ |      $$$$$$/ /$$$$$$  |
$$ |__    $$ |__$$ |$$ |  $$/ $$$$ |  $$$$ |  $$ |____  $$ |____   ______ $$$  \ /$$$ |$$ |__$$ |   $$ |   $$ |__    $$ |      $$ |        $$ |  $$ |  $$ |
$$    |   $$    $$< $$ |        $$ |    $$ |  $$      \ $$      \ /      |$$$$  /$$$$ |$$    $$ |   $$ |   $$    |   $$ |      $$ |        $$ |  $$ |  $$ |
$$$$$/    $$$$$$$  |$$ |   __   $$ |    $$ |  $$$$$$$  |$$$$$$$  |$$$$$$/ $$ $$ $$/$$ |$$$$$$$$ |   $$ |   $$$$$/    $$ |      $$ |        $$ |  $$ |  $$ |
$$ |_____ $$ |  $$ |$$ \__/  | _$$ |_  _$$ |_ /  \__$$ |/  \__$$ |        $$ |$$$/ $$ |$$ |  $$ |   $$ |   $$ |_____ $$ |_____ $$ |_____  _$$ |_ $$ \__$$ |
$$       |$$ |  $$ |$$    $$/ / $$   |/ $$   |$$    $$/ $$    $$/         $$ | $/  $$ |$$ |  $$ |   $$ |   $$       |$$       |$$       |/ $$   |$$    $$/ 
$$$$$$$$/ $$/   $$/  $$$$$$/  $$$$$$/ $$$$$$/  $$$$$$/   $$$$$$/          $$/      $$/ $$/   $$/    $$/    $$$$$$$$/ $$$$$$$$/ $$$$$$$$/ $$$$$$/  $$$$$$/                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

pragma solidity ^0.8.1;

library Address {
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function functionCall(address target, bytes memory data)
        internal
        returns (bytes memory)
    {
        return functionCall(target, data, "Address: low-level call failed");
    }

    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return
            functionCallWithValue(
                target,
                data,
                value,
                "Address: low-level call with value failed"
            );
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(
            address(this).balance >= value,
            "Address: insufficient balance for call"
        );
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(
            data
        );
        return verifyCallResult(success, returndata, errorMessage);
    }

    function functionStaticCall(address target, bytes memory data)
        internal
        view
        returns (bytes memory)
    {
        return
            functionStaticCall(
                target,
                data,
                "Address: low-level static call failed"
            );
    }

    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    function functionDelegateCall(address target, bytes memory data)
        internal
        returns (bytes memory)
    {
        return
            functionDelegateCall(
                target,
                data,
                "Address: low-level delegate call failed"
            );
    }

    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}
pragma solidity ^0.8.0;

contract ERC1155 {
    using Address for address;

    event TransferSingle(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount
    );
    event TransferBatch(
        address operator,
        address from,
        address to,
        uint256[] ids,
        uint256[] amounts
    );
    event ApprovalForAll(
        address indexed account,
        address indexed operator,
        bool approved
    );

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    string private _uri;

    /**
     * @dev See {_setURI}.
     */
    constructor() {}

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function balanceOf(address account, uint256 id)
        public
        view
        virtual
        returns (uint256)
    {
        require(
            account != address(0),
            "ERC1155: balance query for the zero address"
        );
        return _balances[id][account];
    }

    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        virtual
        returns (uint256[] memory)
    {
        require(
            accounts.length == ids.length,
            "ERC1155: accounts and ids length mismatch"
        );

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator)
        internal
        view
        virtual
        returns (bool)
    {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        uint256 fromBalance = _balances[id][from];
        require(
            fromBalance >= amount,
            "ERC1155: insufficient balance for transfer"
        );
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        _balances[id][to] += amount;

        emit TransferSingle(operator, from, to, id, amount);

        _afterTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(
                fromBalance >= amount,
                "ERC1155: insufficient balance for transfer"
            );
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
            _balances[id][to] += amount;
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _afterTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        _balances[id][to] += amount;
        emit TransferSingle(operator, address(0), to, id, amount);

        _afterTokenTransfer(operator, address(0), to, ids, amounts, data);
    }

    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
        }

        emit TransferBatch(operator, address(0), to, ids, amounts);

        _afterTokenTransfer(operator, address(0), to, ids, amounts, data);
    }

    function _burn(
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(operator, from, address(0), ids, amounts, "");

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: burn amount exceeds balance");
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }

        emit TransferSingle(operator, from, address(0), id, amount);

        _afterTokenTransfer(operator, from, address(0), ids, amounts, "");
    }

    function _burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, address(0), ids, amounts, "");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(
                fromBalance >= amount,
                "ERC1155: burn amount exceeds balance"
            );
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
        }

        emit TransferBatch(operator, from, address(0), ids, amounts);

        _afterTokenTransfer(operator, from, address(0), ids, amounts, "");
    }

    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC1155: setting approval status for self");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}

    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}

    function _asSingletonArray(uint256 element)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }
}

struct NFTDetails {
    string tokenCreatorName;
    string tokenOwnerName;
    address payable tokenOwner;
    uint256 totalNFTsAmount;
    uint256 tokenID;
    uint256 nftMintTime;
    uint256 value;
    string nftName;
    bool isNFTBiddingDone;
    string uri;
    string description;
}

struct Participants {
    address payable bidParticipatorAddress;
    string bidParticipatorName;
    uint256 bidAmount;
}

struct Data {
    mapping(uint256 => NFTDetails) nftINFO;
    mapping(address => mapping(uint256 => string)) highestBidderName;
    mapping(address => mapping(uint256 => NFTDetails)) NFTListByOwner;
    mapping(uint256 => address) nftOwner;
    mapping(address => mapping(uint256 => bool)) isOwner;
    mapping(uint256 => address[]) tokenWiseAllOwners;
    mapping(address => mapping(address => mapping(uint256 => uint256))) pendingReturns;
    mapping(address => mapping(uint256 => Participants[])) tokenWiseBidParticipatorList;
    mapping(address => mapping(uint256 => uint256)) auctionEndTime;
    mapping(uint256 => mapping(address => uint256)) totalTokensOwnedByOwner;
    mapping(address => mapping(uint256 => uint256)) highestBid;
    mapping(address => mapping(uint256 => address)) highestBidder;
    mapping(address => mapping(uint256 => bool)) bidEnded;
    mapping(address => mapping(uint256 => uint256)) biddingTime;
    mapping(uint256 => mapping(address => NFTDetails)) tokenOwnerwiseNFTDetails;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) totalBidTokensAmount;
}

pragma solidity ^0.8.0;

library Bid {
    event DeclareBIDWinner(
        address tokenOwner,
        uint256 tokenID,
        bool isBiddingDone
    );

    event AuctionEnded(address winner, uint256 amount);

    function declareWinner(uint256 tokenID, Data storage libdata) external {
        if (block.timestamp < libdata.auctionEndTime[msg.sender][tokenID]) {
            revert("BiF13");
        } else {
            require(
                libdata.totalTokensOwnedByOwner[tokenID][msg.sender] > 0,
                "BiF14"
            );

            libdata.bidEnded[msg.sender][tokenID] = true;

            uint256 nftBiddingTime = libdata
            .NFTListByOwner[msg.sender][tokenID].nftMintTime;

            address payable nftBidder = libdata
            .NFTListByOwner[msg.sender][tokenID].tokenOwner;

            string memory creatorName = libdata
            .NFTListByOwner[msg.sender][tokenID].tokenCreatorName;

            string memory uri = libdata.NFTListByOwner[msg.sender][tokenID].uri;

            string memory bidWinnerName = libdata.highestBidderName[msg.sender][
                tokenID
            ];

            string memory description = libdata
            .NFTListByOwner[msg.sender][tokenID].description;

            string memory nftName = libdata
            .NFTListByOwner[msg.sender][tokenID].nftName;

            emit AuctionEnded(
                libdata.highestBidder[msg.sender][tokenID],
                libdata.highestBid[msg.sender][tokenID]
            );

            nftBidder.transfer(libdata.highestBid[msg.sender][tokenID]);

            uint256 price = libdata.NFTListByOwner[msg.sender][tokenID].value;

            libdata.pendingReturns[msg.sender][
                libdata.highestBidder[msg.sender][tokenID]
            ][tokenID] = 0;

            libdata
            .NFTListByOwner[libdata.highestBidder[msg.sender][tokenID]][tokenID]
                .tokenOwner = payable(
                libdata.highestBidder[msg.sender][tokenID]
            );

            libdata
            .NFTListByOwner[libdata.highestBidder[msg.sender][tokenID]][tokenID]
                .tokenID = tokenID;
            // name, uri, description must be seen after completing bid process.
            libdata
            .NFTListByOwner[libdata.highestBidder[msg.sender][tokenID]][tokenID]
                .isNFTBiddingDone = true;

            libdata.nftOwner[tokenID] = libdata.highestBidder[msg.sender][
                tokenID
            ];

            NFTDetails memory nftDetails = NFTDetails(
                creatorName,
                bidWinnerName,
                payable(libdata.nftOwner[tokenID]),
                libdata.totalTokensOwnedByOwner[tokenID][msg.sender],
                tokenID,
                nftBiddingTime,
                price,
                nftName,
                true,
                uri,
                description
            );

            libdata.NFTListByOwner[libdata.nftOwner[tokenID]][
                tokenID
            ] = nftDetails;

            libdata.nftINFO[tokenID] = nftDetails;

            libdata.tokenWiseAllOwners[tokenID].push(libdata.nftOwner[tokenID]);

            libdata.tokenOwnerwiseNFTDetails[tokenID][
                libdata.highestBidder[msg.sender][tokenID]
            ] = nftDetails;

            libdata.highestBid[msg.sender][tokenID] = 0;

            libdata.auctionEndTime[msg.sender][tokenID] = 0;

            libdata.biddingTime[msg.sender][tokenID] = 0;

            libdata.isOwner[libdata.highestBidder[msg.sender][tokenID]][
                tokenID
            ] = true;

            libdata.isOwner[msg.sender][tokenID] = false;

            settleBidPayment(tokenID, libdata);

            emit DeclareBIDWinner(
                libdata
                .NFTListByOwner[libdata.highestBidder[msg.sender][tokenID]][
                    tokenID
                ].tokenOwner,
                tokenID,
                true
            );

            uint256 length = libdata
            .tokenWiseBidParticipatorList[msg.sender][tokenID].length;

            for (uint256 i = 0; i < length; i++) {
                delete libdata.tokenWiseBidParticipatorList[msg.sender][
                    tokenID
                ][i];
            }
        }
    }

    function settleBidPayment(uint256 tokenID, Data storage libdata) public {
        address payable bidderAddress;

        uint256 amount;

        for (
            uint256 i = 0;
            i <
            libdata.tokenWiseBidParticipatorList[msg.sender][tokenID].length;
            i++
        ) {
            bidderAddress = libdata
            .tokenWiseBidParticipatorList[msg.sender][tokenID][i]
                .bidParticipatorAddress;

            if (bidderAddress != 0x0000000000000000000000000000000000000000) {
                amount = libdata.pendingReturns[msg.sender][bidderAddress][
                    tokenID
                ];

                libdata.pendingReturns[msg.sender][bidderAddress][tokenID] = 0;

                if (!(bidderAddress).send(amount)) {
                    libdata.pendingReturns[msg.sender][bidderAddress][
                        tokenID
                    ] = amount;
                }
            }
        }
    }
}
pragma solidity ^0.8.0;

contract ERC1155Matellio is ERC1155 {
    NFTDetails nftDetails;

    // mapping (address => mapping(uint => NFTDetails)) public NFTListByOwner;

    // mapping(uint256 => mapping(address => uint256)) public totalTokensOwnedByOwner;

    Data libdata;

    bool paymetTransferred = false;

    event nftMinted(address minter, uint256[] tokenID, uint256 mintTime);

    event paymentTransferred(address buyer, address seller, uint256 amount);

    event NFTTransferred(
        address seller,
        string buyerName,
        address buyer,
        uint256 tokenID,
        uint256 totalTokensTransferred
    );

    NFTDetails[] public nftDetailsArray;

    uint256 public totalNFTsCreated;

    function mintBatchNFTs(
        string[] memory _nftName,
        uint256[] memory price,
        string memory ownerName,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        string[] memory nftURI,
        string[] memory description
    ) external {
        _mintBatch(msg.sender, _ids, _amounts, " ");

        uint256 mintTime = block.timestamp;

        for (uint256 i = 0; i < _ids.length; i++) {
            nftDetails = NFTDetails(
                ownerName,
                ownerName,
                payable(msg.sender),
                _amounts[i],
                _ids[i],
                mintTime,
                price[i],
                _nftName[i],
                false,
                nftURI[i],
                description[i]
            );

            nftDetailsArray.push(nftDetails);

            libdata.nftINFO[_ids[i]] = nftDetails;

            libdata.NFTListByOwner[msg.sender][_ids[i]] = nftDetails;

            libdata.tokenWiseAllOwners[_ids[i]].push(msg.sender);

            libdata.tokenOwnerwiseNFTDetails[_ids[i]][msg.sender] = nftDetails;

            libdata.totalTokensOwnedByOwner[_ids[i]][msg.sender] = _amounts[i];
        }

        totalNFTsCreated = totalNFTsCreated + _ids.length;

        emit nftMinted(msg.sender, _ids, mintTime);
    }

    function transferPayment(address payable buyer, address payable seller)
        public
        payable
    {
        require(msg.value != 0 && address(buyer) != address(0), "BF1");

        require(buyer != address(0) && seller != address(0), "BF2");

        uint256 amount = msg.value;

        buyer = payable(msg.sender);

        payable(seller).transfer(amount);

        paymetTransferred = true;

        emit paymentTransferred(buyer, seller, amount);
    }

    function transferNFT(
        address seller,
        string memory buyerName,
        string memory sellerName,
        address payable buyer,
        uint256 tokenID,
        uint256 totalTokensTransferred
    ) external returns (bool) {
        require(paymetTransferred == true, "BF3");

        require(
            libdata.totalTokensOwnedByOwner[tokenID][buyer] <=
                libdata.nftINFO[tokenID].totalNFTsAmount,
            "BF4"
        );

        require(
            libdata.totalTokensOwnedByOwner[tokenID][seller] >=
                totalTokensTransferred,
            "BF5"
        );

        safeTransferFrom(seller, buyer, tokenID, totalTokensTransferred, "");

        string memory description = libdata
        .NFTListByOwner[seller][tokenID].description;

        uint256 nftMintTime = libdata
        .NFTListByOwner[seller][tokenID].nftMintTime;

        paymetTransferred = false;

        NFTDetails memory nftSellerDetails = NFTDetails(
            libdata.NFTListByOwner[seller][tokenID].tokenCreatorName,
            sellerName,
            payable(seller),
            libdata.totalTokensOwnedByOwner[tokenID][seller] -
                totalTokensTransferred,
            tokenID,
            nftMintTime,
            libdata.NFTListByOwner[seller][tokenID].value,
            libdata.NFTListByOwner[seller][tokenID].nftName,
            false,
            libdata.NFTListByOwner[seller][tokenID].uri,
            description
        );

        NFTDetails memory nftBuyerDetails = NFTDetails(
            libdata.NFTListByOwner[seller][tokenID].tokenCreatorName,
            buyerName,
            buyer,
            libdata.totalTokensOwnedByOwner[tokenID][buyer] +
                totalTokensTransferred,
            tokenID,
            nftMintTime,
            libdata.NFTListByOwner[seller][tokenID].value,
            libdata.NFTListByOwner[seller][tokenID].nftName,
            false,
            libdata.NFTListByOwner[seller][tokenID].uri,
            description
        );

        libdata.NFTListByOwner[seller][tokenID] = nftSellerDetails;

        libdata.NFTListByOwner[buyer][tokenID] = nftBuyerDetails;

        libdata.tokenOwnerwiseNFTDetails[tokenID][seller] = nftSellerDetails;

        libdata.tokenOwnerwiseNFTDetails[tokenID][buyer] = nftBuyerDetails;

        libdata.tokenWiseAllOwners[tokenID].push(buyer);

        libdata.totalTokensOwnedByOwner[tokenID][seller] =
            libdata.totalTokensOwnedByOwner[tokenID][seller] -
            totalTokensTransferred;

        libdata.totalTokensOwnedByOwner[tokenID][buyer] =
            libdata.totalTokensOwnedByOwner[tokenID][buyer] +
            totalTokensTransferred;

        emit NFTTransferred(
            seller,
            buyerName,
            buyer,
            tokenID,
            totalTokensTransferred
        );

        return true;
    }

    function transferBatchNFTs(
        address buyer,
        string memory buyerName,
        string memory sellerName,
        address seller,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external returns (bool) {
        require(ids.length == amounts.length, "BF6");

        for (uint256 i = 0; i < ids.length; i++) {
            require(paymetTransferred == true, "BF7");

            require(
                libdata.totalTokensOwnedByOwner[ids[i]][buyer] <=
                    libdata.nftINFO[ids[i]].totalNFTsAmount,
                "BF8"
            );

            require(
                libdata.totalTokensOwnedByOwner[ids[i]][seller] >= amounts[i],
                "BF9"
            );

            safeTransferFrom(seller, buyer, ids[i], amounts[i], "");

            uint256 nftMintTime = libdata
            .NFTListByOwner[seller][ids[i]].nftMintTime;

            NFTDetails memory nftSellerDetails = NFTDetails(
                libdata.NFTListByOwner[seller][ids[i]].tokenCreatorName,
                sellerName,
                payable(seller),
                libdata.totalTokensOwnedByOwner[ids[i]][seller] - amounts[i],
                ids[i],
                nftMintTime,
                libdata.NFTListByOwner[seller][ids[i]].value,
                libdata.NFTListByOwner[seller][ids[i]].nftName,
                false,
                libdata.NFTListByOwner[seller][ids[i]].uri,
                libdata.NFTListByOwner[seller][ids[i]].description
            );

            NFTDetails memory nftBuyerDetails = NFTDetails(
                libdata.NFTListByOwner[seller][ids[i]].tokenCreatorName,
                sellerName,
                payable(seller),
                libdata.totalTokensOwnedByOwner[ids[i]][buyer] + amounts[i],
                ids[i],
                nftMintTime,
                libdata.NFTListByOwner[seller][ids[i]].value,
                libdata.NFTListByOwner[seller][ids[i]].nftName,
                false,
                libdata.NFTListByOwner[seller][ids[i]].uri,
                libdata.NFTListByOwner[seller][ids[i]].description
            );

            libdata.NFTListByOwner[seller][ids[i]] = nftSellerDetails;

            libdata.NFTListByOwner[buyer][ids[i]] = nftBuyerDetails;

            libdata.nftINFO[ids[i]] = nftSellerDetails;

            libdata.tokenWiseAllOwners[ids[i]].push(buyer);

            libdata.tokenOwnerwiseNFTDetails[ids[i]][seller] = nftSellerDetails;

            libdata.tokenOwnerwiseNFTDetails[ids[i]][buyer] = nftBuyerDetails;

            libdata.totalTokensOwnedByOwner[ids[i]][seller] =
                libdata.totalTokensOwnedByOwner[ids[i]][seller] -
                amounts[i];

            libdata.totalTokensOwnedByOwner[ids[i]][buyer] =
                libdata.totalTokensOwnedByOwner[ids[i]][buyer] +
                amounts[i];

            emit NFTTransferred(seller, buyerName, buyer, ids[i], amounts[i]);
        }

        paymetTransferred = false;

        return true;
    }

    function getOwnerwiseNFTDetails(uint256 tokenID, address tokenOwner)
        external
        view
        returns (NFTDetails memory n)
    {
        n = libdata.tokenOwnerwiseNFTDetails[tokenID][tokenOwner];

        return n;
    }

    function setAllNFTOwners(uint256 tokenID)
        internal
        returns (address[] memory)
    {
        uint256 length = libdata.tokenWiseAllOwners[tokenID].length;
        for (uint256 i = 0; i < length; i++) {
            if (
                libdata.totalTokensOwnedByOwner[tokenID][
                    libdata.tokenWiseAllOwners[tokenID][i]
                ] == 0
            ) {
                delete libdata.tokenWiseAllOwners[tokenID][i];
            }
        }
        return libdata.tokenWiseAllOwners[tokenID];
    }

    function allNFTOwners(uint256 tokenID)
        external
        view
        returns (address[] memory)
    {
        return libdata.tokenWiseAllOwners[tokenID];
    }

    function totalTokensOwnedByOwner(uint256 tokenID, address nftOwner)
        external
        view
        returns (uint256)
    {
        return libdata.totalTokensOwnedByOwner[tokenID][nftOwner];
    }

    // mapping(address => mapping(uint256 => uint256)) public biddingTime;

    // mapping(address => mapping(uint256 => uint256)) public auctionEndTime;

    function setAuctionPeriod(
        uint256 _biddingTime,
        uint256 tokenID,
        uint256 totalTokensInBidding
    ) external returns (uint256, uint256) {
        require(
            libdata.totalTokensOwnedByOwner[tokenID][msg.sender] > 0,
            "BiF1"
        );

        libdata.biddingTime[msg.sender][tokenID] = _biddingTime;

        libdata.auctionEndTime[msg.sender][tokenID] =
            block.timestamp +
            libdata.biddingTime[msg.sender][tokenID];

        libdata.totalBidTokensAmount[msg.sender][tokenID][
                libdata.auctionEndTime[msg.sender][tokenID]
            ] = totalTokensInBidding;

        return (
            libdata.biddingTime[msg.sender][tokenID],
            libdata.auctionEndTime[msg.sender][tokenID]
        );
    }

    function getAuctionPeriod(uint256 tokenID, address tokenOwner)
        public
        view
        returns (uint256, uint256)
    {
        return (
            libdata.biddingTime[tokenOwner][tokenID],
            libdata.auctionEndTime[tokenOwner][tokenID]
        );
    }

    // mapping(address => mapping(uint256 => uint256)) public highestBid;

    // mapping(address => mapping(uint256 => address)) public highestBidder;

    // mapping(address => mapping(address => mapping(uint256 => uint256))) public pendingReturns; //token's highestBidder address => tokenID = amount that needs to be returned

    event HighestBidIncrease(address highestBidder, uint256 highestBid);

    function bidNFT(
        uint256 tokenID,
        address tokenOwner,
        string memory bidderName
    ) internal {
        require(
            libdata.totalTokensOwnedByOwner[tokenID][tokenOwner] > 0,
            "BiF2"
        );

        require(
            block.timestamp < libdata.auctionEndTime[tokenOwner][tokenID],
            "BiF3"
        );

        require(msg.value > libdata.highestBid[tokenOwner][tokenID], "BiF4");

        libdata.highestBid[tokenOwner][tokenID] = msg.value;

        libdata.highestBidder[tokenOwner][tokenID] = msg.sender;

        libdata.highestBidderName[tokenOwner][tokenID] = bidderName;

        require(libdata.highestBid[tokenOwner][tokenID] != 0, "BiF5");

        libdata.pendingReturns[tokenOwner][
            libdata.highestBidder[tokenOwner][tokenID]
        ][tokenID] = libdata.highestBid[tokenOwner][tokenID];

        emit HighestBidIncrease(msg.sender, msg.value);
    }

    // struct Participants {
    //     address payable bidParticipatorAddress;
    //     string bidParticipatorName;
    //     uint256 bidAmount;
    // }

    // mapping(address => mapping(uint256 => Participants[]))
    //  public tokenWiseBidParticipatorList;

    function isPriorBidPresent(
        uint256 _tokenID,
        address _bidder,
        address tokenOwner
    ) public view returns (bool) {
        uint256 length = libdata
        .tokenWiseBidParticipatorList[tokenOwner][_tokenID].length;

        for (uint256 i = 0; i < length; i++) {
            if (
                libdata
                .tokenWiseBidParticipatorList[tokenOwner][_tokenID][i]
                    .bidParticipatorAddress == _bidder
            ) {
                return true;
            }
        }

        return false;
    }

    function bidding(
        address _nftOwner,
        string memory _bidParticipatorName,
        address payable _bidder,
        uint256 _tokenID
    ) internal returns (bool) {
        getAuctionPeriod(_tokenID, _nftOwner);

        require(
            libdata.totalTokensOwnedByOwner[_tokenID][_nftOwner] > 0,
            "BiF6"
        );

        require(
            libdata.NFTListByOwner[_nftOwner][_tokenID].tokenID == _tokenID,
            "BiF7"
        );

        bidNFT(_tokenID, _nftOwner, _bidParticipatorName);

        uint256 bidAmount = msg.value;

        Participants memory participants = Participants(
            _bidder,
            _bidParticipatorName,
            bidAmount
        );

        libdata.tokenWiseBidParticipatorList[_nftOwner][_tokenID].push(
            participants
        );

        isPriorBidPresent(_tokenID, _bidder, _nftOwner);

        return true;
    }

    function placeFirstBid(
        address _nftOwner,
        address payable _bidder,
        uint256 _tokenID,
        string calldata bidParticipatorName
    ) external payable returns (bool) {
        require(
            isPriorBidPresent(_tokenID, _bidder, _nftOwner) == false,
            "BiF8"
        );

        getAuctionPeriod(_tokenID, _nftOwner);

        return bidding(_nftOwner, bidParticipatorName, _bidder, _tokenID);
    }

    function updatePreviousBid(
        address payable _bidder,
        uint256 _tokenID,
        address tokenOwner
    ) internal returns (bool) {
        require(
            libdata.totalTokensOwnedByOwner[_tokenID][tokenOwner] > 0,
            "BiF9"
        );
        require(
            isPriorBidPresent(_tokenID, _bidder, tokenOwner) == true,
            "BiF10"
        );

        uint256 length = libdata
        .tokenWiseBidParticipatorList[tokenOwner][_tokenID].length;

        for (uint256 i = 0; i < length; i++) {
            if (
                libdata
                .tokenWiseBidParticipatorList[tokenOwner][_tokenID][i]
                    .bidParticipatorAddress == _bidder
            ) {
                delete libdata.tokenWiseBidParticipatorList[tokenOwner][
                    _tokenID
                ][i];

                return true;
            }
        }
        return false;
    }

    function reBid(
        address _nftOwner,
        uint256 _tokenID,
        string calldata bidParticipatorName
    ) external payable returns (bool) {
        require(
            isPriorBidPresent(_tokenID, msg.sender, _nftOwner) == true,
            "BiF11"
        );

        updatePreviousBid(payable(msg.sender), _tokenID, _nftOwner);

        address payable _bidder = payable(msg.sender);

        uint256 amount = libdata.pendingReturns[_nftOwner][msg.sender][
            _tokenID
        ];

        require(amount > 0, "BiF12");

        if (!(_bidder).send(amount)) {
            libdata.pendingReturns[_nftOwner][_bidder][_tokenID] = amount;

            return false;
        }

        bidding(_nftOwner, bidParticipatorName, payable(msg.sender), _tokenID);

        return true;
    }

    //  erc1155.safeTransferFrom(msg.sender, data.highestBidder[msg.sender][tokenID], tokenID, data.totalTokensOwnedByOwner[tokenID][msg.sender], "");

    function getHighestBidderAndTokensOwnedByOwner(
        uint256 tokenID,
        address nftOwner
    ) public view returns (address, uint256) {
        return (
            libdata.highestBidder[nftOwner][tokenID],
            libdata.totalTokensOwnedByOwner[tokenID][nftOwner]
        );
    }

    function nftInfo(uint256 tokenID)
        public
        view
        returns (NFTDetails memory n)
    {
        n = libdata.nftINFO[tokenID];
        return n;
    }

    function totalBidTokens(uint256 tokenID, address nftOwner)
        public
        view
        returns (uint256)
    {
        return
            libdata.totalBidTokensAmount[nftOwner][tokenID][
                libdata.auctionEndTime[nftOwner][tokenID]
            ];
    }

    function DeclareBIDWinner(uint256 tokenID) public {
        address tokenAndOwnerwiseHighestBidder = libdata.highestBidder[
            msg.sender
        ][tokenID];
        uint256 bidtokenamount = libdata.totalBidTokensAmount[msg.sender][
            tokenID
        ][libdata.auctionEndTime[msg.sender][tokenID]];
        safeTransferFrom(
            msg.sender,
            tokenAndOwnerwiseHighestBidder,
            tokenID,
            bidtokenamount,
            ""
        );

        Bid.declareWinner(tokenID, libdata);

        Bid.settleBidPayment(tokenID, libdata);

        uint256 totalTokensOwnedByAuctioneer = libdata.totalTokensOwnedByOwner[
            tokenID
        ][msg.sender];

        totalTokensOwnedByAuctioneer =
            totalTokensOwnedByAuctioneer -
            bidtokenamount;

        libdata.totalTokensOwnedByOwner[tokenID][
            tokenAndOwnerwiseHighestBidder
        ] =
            libdata.totalTokensOwnedByOwner[tokenID][
                tokenAndOwnerwiseHighestBidder
            ] +
            bidtokenamount;

        libdata.highestBidder[msg.sender][
                tokenID
            ] = 0x0000000000000000000000000000000000000000;

        uint256 length = libdata
        .tokenWiseBidParticipatorList[msg.sender][tokenID].length;

        for (uint256 i = 0; i < length; i++) {
            delete libdata.tokenWiseBidParticipatorList[msg.sender][tokenID][i];
        }

        setAllNFTOwners(tokenID);
    }

    function getBiddersList(uint256 tokenID, address nftOwner)
        external
        view
        returns (Participants[] memory p)
    {
        p = libdata.tokenWiseBidParticipatorList[nftOwner][tokenID];
        return p;
    }
}
