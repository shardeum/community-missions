pragma circom 2.0.0;

template F(){
    signal input x;
    signal input y;
    signal output o;
    
    signal m1<==x*x;
    signal m2<==m1*y;
    signal m3<==y*y;
    signal m4<==m3*x;

    o<==m2+m4+17;

}

component main=F();