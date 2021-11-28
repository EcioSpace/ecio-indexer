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
    UpdateNFT(event.params.id, event.address, event.params.to, event.params.from, event.block.timestamp)
}

export function handleTransferBatch(event: TransferBatch): void {

    for (let i = 0; i < event.params.ids.length; i++) {
        UpdateNFT(event.params.ids[i], event.address, event.params.to, event.params.from, event.block.timestamp)
    }

}


export function UpdateNFT(tokenId: BigInt, contractAddress: Address, to: Address, from: Address, timestamp: BigInt): void {

    if (tokenId.toString() == '') {
        return
    }

    let nftId = getNFTId(contractAddress.toHexString(), tokenId.toString())


    log.debug("contractAddress:{}", [contractAddress.toHexString()]);

    let nft = new NFT(nftId);

    nft.isMysteryBox = true;
    nft.partCode = "-";

    //Assign TokenId
    nft.tokenId = tokenId;
    log.debug("tokenId:{}", [nft.tokenId.toString()]);


    //Assign Smart Contract
    nft.contractAddress = contractAddress;


    //Assign Owner Address
    nft.owner = to.toHexString();

    //Assign NFT Type
    nft.nftType = "mysteryBox"

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


export function createOrLoadAccount(id: Address): Account {
    let account = Account.load(id.toHex())

    if (account == null) {
        account = new Account(id.toHex())
        account.address = id
    }

    account.save()

    return account
}