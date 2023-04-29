#!/bin/bash

zokrates compile -i ./magic_square.zok -o magic_square --r1cs snarkjs/magic_square.r1cs --verbose
zokrates setup -i magic_square -b ark -s g16

npx snarkjs groth16 setup snarkjs/magic_square.r1cs snarkjs/powersOfTau28_hez_final_08.ptau snarkjs/magic_square.zkey
npx snarkjs zkey export verificationkey snarkjs/magic_square.zkey snarkjs/verification_key.json