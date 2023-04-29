const ethers = require("ethers");

const utils = {
  moveDecimalLeft: (str, count) => {
    let start = str.length - count;
    let prePadding = "";

    while (start < 0) {
      prePadding += "0";
      start += 1;
    }

    str = prePadding + str;
    let result = str.slice(0, start) + "." + str.slice(start);
    if (result[0] == ".") {
      result = "0" + result;
    }

    return result;
  },
  BN256ToBin: (str) => {
    let r = BigInt(str).toString(2);
    let prePadding = "";
    let paddingAmount = 256 - r.length;
    for (var i = 0; i < paddingAmount; i++) {
      prePadding += "0";
    }
    return prePadding + r;
  },
  BN256ToHex: (n) => {
    let nstr = BigInt(n).toString(16);
    while (nstr.length < 64) {
      nstr = "0" + nstr;
    }
    nstr = `0x${nstr}`;
    return nstr;
  },
  BNToDecimal: (bn) => {
    return ethers.BigNumber.from(bn).toString();
  },
  reverseCoordinate: (p) => {
    let r = [0, 0];
    r[0] = p[1];
    r[1] = p[0];
    return r;
  },
};

export default utils;
