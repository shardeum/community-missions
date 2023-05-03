pragma circom 2.0.0;

template Multiplier(n) { //PUBLIC INPUT ARG
    signal input a; //PRIVATE INPUT
    signal input b; //PRIVATE INPUT
    signal output c; //PUBLIC OUTPUT

    c <== a*b*n; //OUTPUT PROOF
}

component main = Multiplier(1000); //PUBLIC INPUT FROM MAIN FUNCTION CALL
