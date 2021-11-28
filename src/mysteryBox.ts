import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
    TransferSingle,
    TransferBatch
} from "../generated/MysteryBox/MysteryBox"
import { NFT, Account } from "../generated/schema"
import { Null } from './data/addresses'
import { log } from '@graphprotocol/graph-ts'
import { getNFTId } from './modules/nft'

export function handleTransferSingle(event: TransferSingle): void {
    UpdateNFT(event.params.id, event.address, event.params.to, event.params.from, event.block.timestamp, event.params.value)
}

export function handleTransferBatch(event: TransferBatch): void {

    for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i];
        const value = event.params.values[i];
        UpdateNFT(tokenId, event.address, event.params.to, event.params.from, event.block.timestamp, value)
    }
}

export function UpdateNFT(tokenId: BigInt, contractAddress: Address, to: Address, from: Address, timestamp: BigInt, value: BigInt): void {

    if (tokenId.toString() == '') {
        return
    }

    let nftId = getNFTId(contractAddress.toHexString(), tokenId.toString()) + "-" + to.toHexString()
    let nft = NFT.load(nftId);

    if (nft == null) {
        nft = new NFT(nftId);
        log.debug("UpdateNFT Create New NFT nftId:{}", [nftId]);
    }else{
        log.debug("UpdateNFT Reuse NFT nftId:{}", [nftId]);
    }

    log.debug("contractAddress:{}", [contractAddress.toHexString()]);

    nft.isMysteryBox = true;
    nft.partCode = "-";
    nft.nftType = "mysteryBox";

    //Update NFT Amount of destination
    let toAmount = nft.amount.toI64() + value.toI64()
    nft.amount = BigInt.fromI64(toAmount);


    //Update NFT Amount of source
    if (from.toHexString() != Null) {
        let fromNFTId = getNFTId(contractAddress.toHexString(), tokenId.toString()) + "-" + from.toHexString()
        let fromNFT = NFT.load(fromNFTId)!;
        let fromAmount = nft.amount.toI64() + value.toI64()
        fromNFT.amount = BigInt.fromI64(fromAmount);
        if (fromAmount == 0) {
            fromNFT.owner = Null;
            log.debug("Brun NFT nftId:{}", [fromNFTId]);
        }else{
            log.debug("Reduce NFT nftId:{} amount:{}", [fromNFTId,fromAmount.toString()]);
        }
        fromNFT.save();
    }


    //Assign TokenId
    nft.tokenId = tokenId;
    log.debug("tokenId:{}", [nft.tokenId.toString()]);

    //Assign Smart Contract
    nft.contractAddress = contractAddress;


    //Assign Owner Address
    nft.owner = to.toHexString();


    //Assign tokenURI
    nft.tokenURI = "https://metadata.ecio.space/mysteryBox/" + tokenId.toString();

    nft.image = "https://metadata.ecio.space/mysteryBox-" + tokenId.toString() + ".png"

    log.debug("image:{}", [nft.image.toString()]);


    if (from.toHexString() == Null) {
        nft.createdAt = timestamp
    }

    nft.updatedAt = timestamp
    nft.save()

    createOrLoadAccount(to);


}

export function updateNFTAmount(contractAddress: Address, tokenId: BigInt, from: Address, value: BigInt): void {

    if (from.toHexString() != Null) {
        let _nftId = getNFTId(contractAddress.toHexString(), tokenId.toString()) + "-" + from.toHexString()
        let _nft = new NFT(_nftId);
        if (_nftId != null) {
            let fromAmount = _nft.amount.toI64() - value.toI64()
            log.debug("updateNFTAmount fromAmount:{}", [fromAmount.toString()]);

            if (fromAmount == 0) {
                _nft.owner = Null
            } else {
                _nft.amount = BigInt.fromI64(fromAmount);
            }
            _nft.save()
        } else {
            log.error("Not Found _nftId:{}", [_nftId.toString()]);
        }


    }
}


export function createOrLoadAccount(id: Address): Account {
    let account = Account.load(id.toHex())

    if (account == null) {
        account = new Account(id.toHex())
        account.address = id
    }

    account.save()

    return account
}