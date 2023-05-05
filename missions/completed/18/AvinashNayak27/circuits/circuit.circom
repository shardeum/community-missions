pragma circom 2.0.0;

template circuit(n) { //PUBLIC INPUT ARG
    signal input a; //PRIVATE INPUT
    signal input b; // PRIVATE INPUT
    signal output c;  // PUBLIC OUTPUT
    c <== a*b*n;
 }

 component main = circuit(100); //PUBLIC INPUT FROM MAIN FUNCTION CALL