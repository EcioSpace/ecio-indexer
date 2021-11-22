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

export function searchData(prefix: string, code: string): Data | null {
  for (let index = 0; index < partData.length; index++) {
    if (prefix + code == partData[index].CODE) {
      return partData[index];
    }
  }
  return null
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

  //Assign Class
  //limitation

  //Assign Part
  if (nft.nftType == "card") {

    nft.level = getLevel(nft.partCode)
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
    let prefix: string = ""
    let code: string = GetCode(nft.partCode, EQUIPMENT);
    if (nft.part == "gear") {
      prefix = "SG"
    } else if (nft.part == "drone") {
      prefix = "SD"
    } else if (nft.part == "suite") {
      prefix = "SS"
    } else if (nft.part == "bot") {
      prefix = "SB"
    } else if (nft.part == "weapon") {
      prefix = "SW"
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

export function getEquipmentRarity(code: string, equipment: string | null): string {

  let gear: string = "gear";
  let drone: string = "drone";
  let suite: string = "suite";
  let bot: string = "bot";
  let weapon: string = "weapon";
  let prefix: string = "";


  if (equipment == "gear") {
    prefix = "SG"
  } else if (equipment == "drone") {
    prefix = "SD"
  } else if (equipment == "suite") {
    prefix = "SS"
  } else if (equipment == "bot") {
    prefix = "SB"
  } else if (equipment == "weapon") {
    prefix = "SW"
  }


  for (let index = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == prefix + code) {
      return pd.RARITY.toLowerCase()
    }
  }
  return ""
}

export function getNFTName(prefix: string, code: string): string {
  for (let index = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == prefix + code) {
      return partData[index].NAME.toLowerCase()
    }
  }
  return ""
}

export function getNFTClass(prefix: string, code: string): string {

  for (let index = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE.toString() == (prefix + code).toString()) {
      return partData[index].ELEMENT.toLowerCase()
    }
  }
  return ""
}
export function getCardRarity(code: string): string {

  for (let index = 0; index < partData.length; index++) {
    const pd = partData[index];
    if (pd.CODE == "SH" + code) {
      return partData[index].RARITY.toLowerCase()
    }
  }
  return ""
}

export function getEquipment(partCode: string): string {
  let code: string = GetCode(partCode, EQUIPMENT);
  if (code == "03") {
    return "gear"
  } else if (code == "04") {
    return "drone"
  } else if (code == "05") {
    return "suite"
  } else if (code == "06") {
    return "bot"
  } else if (code == "08") {
    return "weapon"
  }
  return ""
}

export function getTribe(partCode: string): string {
  let code: string = GetCode(partCode, KINGDOM);
  if (code == "00") {
    return "solarian"
  } else if (code == "01") {
    return "andromedian"
  } else if (code == "02") {
    return "scultpian"
  } else if (code == "03") {
    return "mercenary"
  }
  return ""
}
export function getNFTType(partCode: string): string {

  let code: string = GetCode(partCode, 0);
  if (code == "00" || code == "01" || code == "02" || code == "03" || code == "04" || code == "05") {
    return "fagment"
  } else if ("06") {
    return "card"
  }

  return ""

}

export function getLevel(partCode: string): BigInt {
  let code: string = GetCode(partCode, 9);
  if (code == "00") {
    return new BigInt(1);
  } else if (code == "01") {
    return new BigInt(2);
  } else if (code == "02") {
    return new BigInt(3);
  } else if (code == "03") {
    return new BigInt(4);
  } else if (code == "04") {
    return new BigInt(5);
  }
  return new BigInt(0);
}

export function GetCode(partCode: string, no: number): string {
  var count: number = 0;
  for (let i = partCode.length - 1; i >= 0; i--) {
    if (count == no) {
      return `${partCode.at(i - 1)}${(partCode.at(i))}`
    }
    i--;
    count++;
  }
  return ""
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