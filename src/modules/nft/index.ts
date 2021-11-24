export function getNFTId(
    contractAddress: string,
    tokenId: string
  ): string {
    return  contractAddress + '-' + tokenId
}