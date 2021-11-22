import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ECIONFTCore,
  Approval,
  ApprovalForAll,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer
} from "../generated/ECIONFTCore/ECIONFTCore"
import { NFT, Account } from "../generated/schema"
import { partData, Data } from "./data/part"
import { Null } from './data/addresses'

export const KINGDOM = 1
export const TRAINING = 2
export const GEAR = 3
export const DRONE = 4
export const SUITE = 5
export const BOT = 6
export const GENOME = 7
export const WEAPON = 8
export const RANKS = 9
export const EQUIPMENT = 10

export const GEAR_PART = 3
export const DRONE_PART = 4
export const SUITE_PART = 5
export const BOT_PART = 6
export const WEAPON_PART = 8

export const GEAR_CASE = "gear"
export const DRONE_CASE = "drone"
export const SUITE_CASE = "suite"
export const BOT_CASE = "bot"
export const WEAPON_CASE = "weapon"
// id: ID! [Done]
// partCode: String!  [Done]
// tokenId: BigInt! [Done]
// contractAddress: Bytes! [Done]
// owner: Account!   [Done]
// tokenURI: String!  [Done]
// nftType: NFTType! [Done]
// level: BigInt [Done]
// class: Class [Done]
// Tribe: [Done]
// part: Part  [Done]
// rarity: Rarity [] [Done]
// camp: Camp [Requirement No Clear]

// orders: [Order!] @derivedFrom(field: "nft") # History of all orders. Should only ever be ONE open order. all others must be cancelled or sold
// activeOrder: Order

// name: String //[Done]
// image: String [Done]

// createdAt: BigInt! [Done]
// updatedAt: BigInt! [Done]

export function getNFTImage(partCode: string): string {
  return ('https://metadata.ecio.space/card/' + partCode + '/image.png')
}

export function isMint(event: Transfer): boolean {
  return event.params.from.toHexString() == Null
}

export function searchData(prefix: string, code: string): Data {
  for (let index: number = 0; index < partData.length; index++) {
    if (prefix + code == partData[index].CODE) {
      return partData[index];
    }
  }
  return {
    "CODE": "",
    "RARITY": "",
    "ELEMENT": "",
    "NAME": "",
    "ABILITY": "",
    "INFORMATION": "",
    "HP": 0,
    "ATK": 0,
    "DEF": 0,
    "ASPD": 0,
    "RANGE": 0,
    "BONUS_HP": 0,
    "BONUS_ATK": 0,
    "BONUS_DEF": 0,
    "BONUS_ASPD": 0,
    "CRIT": 0,
    "DODGE": 0,
    "LIFESTEAL": 0
  }
}

export function handleTransfer(event: Transfer): void {

  if (event.params.tokenId.toString() == '') {
    return
  }

  let contractAddress = event.address;

  let nft = new NFT(event.params.tokenId.toString());

  //Assign TokenId
  nft.tokenId = event.params.tokenId;

  let erc721 = ECIONFTCore.bind(event.address);

  //Find Token Info
  let result = erc721.tokenInfo(event.params.tokenId);
  nft.partCode = result.value0;

  //Assign Smart Contract
  nft.contractAddress = contractAddress;

  //Assign NFT's Image
  let imageURL = erc721.tokenURI(event.params.tokenId);
  nft.image = imageURL


  //Assign Owner Address
  nft.owner = event.params.to.toHex();

  //Assign NFT Type
  nft.nftType = getNFTType(nft.partCode)


  //Assign Level
  if (nft.nftType == "card") {
    nft.level = BigInt.fromI32(getLevel(nft.partCode))
  }

  //Assign Class
  //limitation

  //Assign Part
  if (nft.nftType == "card") {
    nft.level = BigInt.fromI32(getLevel(nft.partCode))
    // let code0 = GetCode(nft.partCode, 0);
    // let code1 = GetCode(nft.partCode, KINGDOM);
    nft.tribe = getTribe(nft.partCode)
    let st = GetCode(nft.partCode, TRAINING);
    let code3 = GetCode(nft.partCode, GEAR);
    let code4 = GetCode(nft.partCode, DRONE);
    let code5 = GetCode(nft.partCode, SUITE);
    let code6 = GetCode(nft.partCode, BOT);
    let sh: string = GetCode(nft.partCode, GENOME);
    let code8 = GetCode(nft.partCode, WEAPON);
    let code9 = GetCode(nft.partCode, RANKS);
    let code10 = GetCode(nft.partCode, EQUIPMENT);

    //Assign Card's Part
    nft.rarity = getCardRarity(nft.partCode)

    //Assign Card's Class 
    nft.nftClass = getNFTClass("SH", sh);

    //Assign Camp
    // nft.camp


    //Assign NFT's Name
    nft.name = getNFTName("SH", sh)


  } else {
    //Assign Part
    nft.part = getEquipment(nft.partCode)

    //Assign Equipemnt's Part
    nft.rarity = getEquipmentRarity(nft.partCode, nft.part)

    //Assign Card's Class 
    let prefix: string
    let code: string = GetCode(nft.partCode, EQUIPMENT);
    switch (nft.part) {
      case "gear":
        prefix = "SG"
        break;
      case "drone":
        prefix = "SD"
        break;
      case "suite":
        prefix = "SS"
        break;
      case "bot":
        prefix = "SB"
        break;
      case "weapon":
        prefix = "SW"
        break;
      default:
        prefix = ""
        break;
    }

    // Assign Class
    nft.nftClass = getNFTClass(prefix, code);

    //Assign Name
    nft.name = getNFTName(prefix, code)
  }

  if (isMint(event)) {
    nft.createdAt = event.block.timestamp
  }

  nft.updatedAt = event.block.timestamp

  //Assign NFT's Image
  nft.image = getNFTImage(nft.partCode)

  nft.save()

  //Update Owner
  createOrLoadAccount(event.params.to);
}

// gear
// drone
// suite
// bot
// weapon
export function getEquipmentRarity(code: string, equipment: string): string {
  let prefix: string
  switch (equipment) {
    case GEAR_CASE:
      prefix = "SG"
      break;
    case "drone":
      prefix = "SD"
      break;
    case "suite":
      prefix = "SS"
      break;
    case "bot":
      prefix = "SB"
      break;
    case WEAPON_CASE:
      prefix = "SW"
      break;
    default:
      prefix = ""
      break;
  }

  for (let index: number = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == prefix + code) {
      return partData[index].RARITY.toLowerCase()
    }
  }
  return ""
}

export function getNFTName(prefix: string, code: string): string {
  for (let index: number = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == prefix + code) {
      return partData[index].NAME.toLowerCase()
    }
  }
  return ""
}

export function getNFTClass(prefix: string, code: string): string {

  for (let index: number = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE.toString() == (prefix + code).toString()) {
      return partData[index].ELEMENT.toLowerCase()
    }
  }
  return ""
}
export function getCardRarity(code: string): string {

  for (let index: number = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == "SH" + code) {
      return partData[index].RARITY.toLowerCase()
    }
  }
  return ""
}

export function getEquipment(partCode: string): string {
  let code: string = GetCode(partCode, EQUIPMENT);
  // gear
  // drone
  // suite
  // bot
  // weapon
  // export const GEAR_PART = 3
  // export const DRONE_PART = 4
  // export const SUITE_PART = 5
  // export const BOT_PART = 6
  // export const WEAPON_PART = 8
  switch (code) {
    case "03":
      return "gear"
    case "04":
      return "drone"
    case "05":
      return "suite"
    case "06":
      return "bot"
    case "08":
      return "weapon"
    default:
      return ""
  }
}

export function getTribe(partCode: string): string {
  let code: string = GetCode(partCode, KINGDOM);
  switch (code) {
    case "00":
      return "solarian"
    case "01":
      return "andromedian"
    case "02":
      return "scultpian"
    case "03":
      return "mercenary"
    default:
      return ""
  }
}
export function getNFTType(partCode: string): string {
  let code: string = GetCode(partCode, 0);
  switch (code) {
    case "00": case "01": case "02": case "03": case "04": case "05":
      return "fagment"
    case "06":
      return "card"
    default:
      return ""
  }
}

export function getLevel(partCode: string): number {
  let code: string = GetCode(partCode, 9);
  switch (code) {
    case "00":
      return 1;
    case "01":
      return 2;
    case "02":
      return 3;
    case "03":
      return 4;
    case "04":
      return 5;
    default:
      return 0;
  }
}

export function GetCode(partCode: string, no: number): string {
  var count: number = 0;
  for (let i: number = partCode.length - 1; i >= 0; i--) {
    if (count == no) {
      return `${partCode.at(i - 1)}${(partCode.at(i))}`
    }
    i--;
    count++;
  }
  return ""
}


export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner
  // entity.approved = event.params.approved

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.MINTER_ROLE(...)
  // - contract.balanceOf(...)
  // - contract.getApproved(...)
  // - contract.getRoleAdmin(...)
  // - contract.hasRole(...)
  // - contract.isApprovedForAll(...)
  // - contract.name(...)
  // - contract.ownerOf(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenInfo(...)
  // - contract.tokenURI(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void { }

export function handleRoleAdminChanged(event: RoleAdminChanged): void { }

export function handleRoleGranted(event: RoleGranted): void { }

export function handleRoleRevoked(event: RoleRevoked): void { }


export function createOrLoadAccount(id: Address): Account {
  let account = Account.load(id.toHex())

  if (account == null) {
    account = new Account(id.toHex())
    account.address = id
  }

  account.save()

  return account
}