import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WordBreak", function () {
  let WordBreak;
  let wordBreak: any;

  beforeEach(async function () {
    WordBreak = await ethers.getContractFactory(
      "WordBreak"
    );

    wordBreak = await WordBreak.deploy();
    await wordBreak.deployed();
  });

  it("should return true when validate", async function () {
    const targetString = "code";
    const wordList = ["code"];
    const result = await wordBreak.verify(targetString, wordList);
    expect(result).to.equal(true);
  });
  it("should return false when unvalidate", async function () {
    const targetString = "leetcode";
    const wordList = ["code", "leett"];
    const result = await wordBreak.verify(targetString, wordList);
    expect(result).to.equal(false);
  });

});

