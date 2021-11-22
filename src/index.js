var partCode = "12000000000100040001001016"

console.log(GetCode(partCode, 12))

function GetCode(partCode, no) {
    var count = 0;
    for (let i = partCode.length - 1; i >= 0; i--) {
        if (count == no) {
            return count, partCode[i - 1] + partCode[i]
        }
        i--;
        count++;
    }
    return ""
}
