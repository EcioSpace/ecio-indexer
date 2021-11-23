import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ECIONFTCore,
  Transfer
} from "../generated/ECIONFTCore/ECIONFTCore"
import { NFT, Account } from "../generated/schema"
import { partData, Data } from "./data/part"
import { Null } from './data/addresses'
import { log } from '@graphprotocol/graph-ts'
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

  event.params.tokenId.toString()

  let contractAddress = event.address;
  log.debug("contractAddress:{}", [event.address.toHexString()]);

  let nft = new NFT(event.params.tokenId.toString());

  //Assign TokenId
  nft.tokenId = event.params.tokenId;
  log.debug("tokenId:{}", [nft.tokenId.toString()]);

  let erc721 = ECIONFTCore.bind(event.address);

  //Find Token Info
  let result = erc721.tokenInfo(nft.tokenId);
  nft.partCode = result.value0;
  log.debug("partCode:{}", [nft.partCode]);

  //Assign Smart Contract
  nft.contractAddress = contractAddress;


  //Assign Owner Address
  nft.owner = event.params.to.toHexString();

  //Assign NFT Type
  nft.nftType = getNFTType(nft.partCode)

  //Assign Class
  //limitation

  //Assign Part
  if (nft.nftType == "card") {

    nft.level = getLevelNumber(nft.partCode)
  
    let kd = GetCode(nft.partCode, KINGDOM);
    log.debug("kd:{}", [kd]);
 
    nft.tribe = getTribeName(kd)

    // let st = GetCode(nft.partCode, TRAINING);
    let sg = GetCode(nft.partCode, GEAR);
    let sd = GetCode(nft.partCode, DRONE);
    let ss = GetCode(nft.partCode, SUITE);
    let sb = GetCode(nft.partCode, BOT);
    let sh: string = GetCode(nft.partCode, GENOME);
    let sw = GetCode(nft.partCode, WEAPON);
    // let code9 = GetCode(nft.partCode, RANKS);
    // let code10 = GetCode(nft.partCode, EQUIPMENT);

    nft.codeGear = sg
    nft.codeDrone = sd
    nft.codeSuite = ss
    nft.codeBot = sb
    nft.codeWeapon = sw


    //Assign Card's Part
    nft.rarity = getCardRarity(kd)
  
    //Assign Card's Class 
    nft.nftClass = getNFTClass("SH", sh);

    //Assign Camp
    // nft.camp

    //Assign NFT's Name
    nft.name = getNFTName("SH", sh)


  } else {

    // //Assign Part
    nft.part = getEquipmentName(nft.partCode)

    // //Assign Equipemnt's Part
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

    log.debug("prefix,code:{}", [prefix, code]);

    // Assign Class
    nft.nftClass = getNFTClass(prefix, code);

    //Assign Name
    nft.name = getNFTName(prefix, code)
  }

  if (isMint(event)) {
    nft.createdAt = event.block.timestamp
  }

  log.debug("isMint:{}", [isMint(event).toString()]);

  nft.updatedAt = event.block.timestamp

  //Assign NFT's Image
  nft.image = getNFTImage(nft.partCode)

  log.debug("image:{}", [nft.image.toString()]);


  nft.save()

  //Update Owner
  createOrLoadAccount(event.params.to);
}


export function toArray(mesage: string | null): string[] {
  return mesage ? [mesage] : [];
}


export function getEquipmentRarity(code: string, equipment: string | null): string {
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

export function getEquipmentName(partCode: string): string {
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

export function getTribeName(partCode: string): string {
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

export function getLevelNumber(partCode: string): BigInt {
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