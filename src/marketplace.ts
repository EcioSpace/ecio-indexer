import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  OrderCreated,
  OrderCanceled,
  OrderSuccessful
} from "../generated/Market/Market"
import { NFT, Order } from "../generated/schema"
import { Null } from './data/addresses'
import { log } from '@graphprotocol/graph-ts'
import { getNFTId } from "./modules/nft"

export function handleOrderCreated(event: OrderCreated): void {

  const tokenId = event.params.tokenId
  const nftId = getNFTId(event.params.nftContract.toHexString(),event.params.tokenId.toString());
  log.debug("nftId:{}", [nftId]);

  let nft = NFT.load(nftId)
  if (nft != null) {
    let orderId = event.params.orderId.toString()
    log.debug("orderId:{}", [orderId]);
    let order = new Order(orderId)
    order.buyWithERC20Address =  event.params.buyWithTokenContract
    order.status = "open"  //  open sold cancelled
    order.nft = tokenId.toString()
    order.nftAddress = event.params.nftContract
    order.tokenId = tokenId
    order.txHash = event.transaction.hash
    order.owner = event.params.seller
    order.price = event.params.price
    // order.expiresAt = event.params.
    order.blockNumber = event.block.number
    order.createdAt = event.block.timestamp
    order.updatedAt = event.block.timestamp
    order.save()

    nft.updatedAt = event.block.timestamp
    nft = updateNFTOrderProperties(nft, order)
    nft.save()

  }

}

export function handleOrderCanceled(event: OrderCanceled): void {
  
  const nftId = getNFTId(event.params.nftContract.toHexString(),event.params.tokenId.toString());

  let orderId = event.params.orderId.toString()

  let nft = NFT.load(nftId)
  let order = Order.load(orderId)

  if (nft != null && order != null) {
  
    order.status = "cancelled"
    order.blockNumber = event.block.number
    order.updatedAt = event.block.timestamp
    order.save()

    nft.updatedAt = event.block.timestamp
    nft = updateNFTOrderProperties(nft, order)
    nft.save()
  }
}

export function handleOrderSuccessful(event: OrderSuccessful): void {
  
  const nftId = getNFTId(event.params.nftContract.toHexString(),event.params.tokenId.toString());
  log.debug("nftId:{}", [nftId]);

  let orderId = event.params.orderId.toString()
  log.debug("orderId:{}", [orderId]);

  let order = Order.load(orderId)
  if (order == null) {
    return
  }

  order.status = "sold"
  order.buyer = event.params.owner
  order.price = event.params.price
  order.blockNumber = event.block.number
  order.updatedAt = event.block.timestamp
  order.save()

  let nft = NFT.load(nftId)
  if (nft == null) {
    return
  }

  nft.owner = event.params.owner.toHex()
  nft.updatedAt = event.block.timestamp
  nft = updateNFTOrderProperties(nft, order)
  nft.save()
}


export function updateNFTOrderProperties(nft: NFT, order: Order): NFT {
  if (order.status == "open") {
    return addNFTOrderProperties(nft, order)
  } else if (order.status == "sold" || order.status == "cancelled") {
    return clearNFTOrderProperties(nft)
  } else {
    return nft
  }
}

export function addNFTOrderProperties(nft: NFT, order: Order): NFT {
  nft.activeOrder = order.id
  nft.searchOrderStatus = order.status
  nft.searchOrderPrice = order.price
  nft.searchOrderCreatedAt = order.createdAt
  // nft.searchOrderExpiresAt = order.expiresAt
  return nft
}

export function clearNFTOrderProperties(nft: NFT): NFT {
  nft.activeOrder = ''
  nft.searchOrderStatus = null
  nft.searchOrderPrice = null
  nft.searchOrderCreatedAt = null
  nft.searchOrderExpiresAt = null
  return nft
}