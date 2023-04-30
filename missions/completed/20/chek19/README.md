# mission20
website : https://black-bread-0661.on.fleek.co/

demo: https://youtu.be/jAlU6hJyF9s

circuit:https://github.com/Chek19/mission20/blob/main/circuits/src/main.nr

verification contract:https://github.com/Chek19/mission20/blob/main/circuits/plonk_vk.sol 

proof:https://github.com/Chek19/mission20/blob/main/circuits/proof.txt


# Developing Zero Knowledge Proof Using Noir

## What is Noir?
Noir is a domain specific language for creating and verifying proofs. It's design choices are influenced heavily by Rust.

**Developing ZK Circuit using Noir**

Step 1: **Installing Nargo**
Nargo is a command line tool for interacting with Noir programs. please refer this [documentation](https://noir-lang.org/getting_started/nargo_installation) for installing nargo.

Step 2: **create Nargo project** <br>
       * use this `nargo new projectname` command to create new project.
       * `nargo new circuits`. this would generate a folder name circuits
          
       ``` .
       ├── ...
       ├── circuits 
              ├── norgo.toml
              ├── src
                  ├── main.nr #Please make the necessary changes to this file and include your circuit code.

       ```
Step 3: **To proceed, navigate to the `circuits` folder and use the `nargo check` command to generate the input and output files** 
        - To change your current directory to the `circuits` folder, use the command `cd circuits`.
        - If you wish to edit the circuit, access the src/main.nr file located in the 'circuits' folder.
        
        ```
        fn main(x : Field, y : pub Field) {
          constrain x+y==1729;
         }
        ```
        
        - Once you have made the necessary changes to the circuit in the main.nr file, you can use the 'nargo check' command to generate the input and output files required for verification.
        
        
        
        ```
       .
       ├── ...
       ├── circuits 
              ├── norgo.toml
              ├── prover.toml #houses input values
              ├── verifier.toml #houses public values
              ├── src
                  ├── main.nr #Please make the necessary changes to this file and include your circuit code.

       ```
       
Step 4: **Use the 'nargo codegen-verifier' command to generate the proof verification contract.**  

       ```
       .
       ├── ...
       ├── circuits 
              ├── norgo.toml
              ├── prover.toml #houses input values
              ├── verifier.toml #houses public values
              ├── contract #folder contains proof verification contract.
                  ├──plonk_vk.sol #proof verification contract for evm chains.
              ├── src
                  ├── main.nr #Please make the necessary changes to this file and include your circuit code.

       ```
       
##  Developing Frontend integration files

For frontend integration. please refer this [documentation](https://noir-lang.org/typescript).

**use the files `circuits/generateacir.ts` to generate frontend files** <br>
`node circuits/generateacir.ts` <br>
after running the above file. it will generate `circuit.buf` and `acir.buf`. it would needed to generate proof in frontend.
<br> `src/generate_calldata.ts` file is used to generate call data  for contract verficiation. after generating proof it would return proof array.

```
{
  "type" : "Buffer", "data" : [
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,   1,   13,  194, 214, 6,   85,  27,  101, 61,  52,  21,  86,  188, 128,
    19,  140, 103, 83,  59,  10,  115, 47,  35,  210, 61,  40,  151, 33,  32,
    148, 194, 115, 17,  3,   192, 57,  255, 247, 111, 25,  205, 34,  223, 235,
    75,  207, 207, 12,  49,  175, 142, 108, 221, 189, 238, 158, 213, 86,  136,
    62,  71,  102, 137, 40,  129, 10,  137, 50,  68,  247, 11,  216, 234, 222,
    173, 231, 46,  143, 81,  70,  90,  129, 134, 63,  211, 176, 16,  250, 62,
    241, 218, 13,  196, 172, 68,  198, 45,  4,   202, 69,  64,  21,  160, 60,
    6,   45,  212, 178, 99,  37,  243, 177, 122, 245, 59,  36,  35,  212, 16,
    148, 222, 140, 112, 254, 234, 155, 91,  170, 228, 27,  130, 68,  246, 246,
    216, 50,  5,   30,  75,  123, 53,  117, 152, 86,  155, 225, 182, 96,  207,
    126, 190, 70,  35,  202, 101, 169, 51,  10,  146, 183, 213, 32,  192, 82,
    240, 230, 247, 48,  234, 143, 108, 91,  220, 121, 219, 62,  133, 88,  75,
    134, 18,  195, 72,  57,  168, 55,  110, 29,  30,  159, 28,  135, 126, 48,
    58,  155, 41,  85,  169, 28,  239, 230, 90,  198, 125, 186, 103, 19,  15,
    20,  140, 206, 168, 18,  143, 185, 137, 142, 79,  231, 31,  147, 237, 138,
    32,  33,  195, 107, 65,  145, 239, 15,  116, 129, 121, 61,  104, 16,  7,
    181, 36,  249, 211, 209, 37,  31,  122, 148, 228, 243, 147, 164, 161, 97,
    26,  162, 1,   15,  126, 238, 76,  206, 10,  79,  242, 12,  129, 92,  153,
    254, 76,  24,  56,  86,  109, 75,  201, 122, 163, 186, 125, 190, 219, 150,
    239, 193, 139, 95,  206, 39,  42,  40,  68,  188, 195, 164, 189, 197, 171,
    160, 140, 195, 141, 194, 212, 80,  218, 104, 199, 107, 144, 236, 80,  128,
    69,  130, 21,  23,  82,  108, 202, 1,   4,   0,   49,  124, 141, 221, 164,
    190, 172, 0,   239, 211, 10,  53,  78,  253, 154, 208, 240, 11,  185, 67,
    91,  128, 63,  204, 52,  107, 123, 215, 138, 40,  216, 71,  25,  138, 31,
    116, 67,  206, 184, 100, 55,  57,  118, 82,  51,  158, 90,  41,  234, 222,
    61,  104, 197, 209, 1,   90,  141, 14,  139, 233, 165, 37,  225, 112, 13,
    102, 218, 107, 98,  149, 27,  0,   204, 128, 229, 85,  245, 110, 40,  82,
    217, 64,  231, 39,  35,  79,  199, 51,  216, 210, 135, 111, 32,  17,  209,
    105, 102, 165, 251, 149, 47,  40,  102, 103, 19,  31,  120, 22,  197, 49,
    170, 13,  181, 61,  179, 212, 147, 7,   68,  17,  254, 196, 47,  143, 61,
    1,   227, 158, 30,  195, 146, 216, 236, 190, 204, 61,  37,  107, 99,  222,
    165, 163, 69,  6,   48,  14,  2,   171, 113, 45,  172, 82,  25,  177, 54,
    233, 196, 44,  236, 231, 97,  21,  48,  159, 136, 33,  47,  44,  232, 207,
    15,  44,  158, 24,  195, 229, 182, 34,  240, 136, 19,  179, 54,  111, 218,
    255, 233, 212, 99,  20,  134, 89,  121, 242, 56,  91,  197, 92,  237, 222,
    118, 199, 117, 13,  219, 20,  103, 171, 142, 80,  138, 27,  247, 101, 71,
    65,  133, 226, 5,   0,   37,  40,  165, 180, 12,  236, 169, 188, 140, 3,
    189, 209, 83,  158, 149, 53,  95,  156, 130, 74,  195, 86,  62,  65,  251,
    254, 97,  60,  91,  231, 121, 245, 255, 32,  114, 42,  246, 173, 169, 100,
    151, 186, 195, 206, 4,   146, 90,  134, 67,  74,  225, 175, 71,  197, 121,
    237, 37,  70,  112, 27,  110, 221, 95,  27,  195, 47,  220, 30,  75,  94,
    237, 220, 201, 240, 203, 193, 237, 187, 27,  176, 59,  109, 207, 81,  50,
    20,  88,  47,  102, 139, 232, 97,  197, 45,  17,  148, 222, 48,  22,  106,
    155, 242, 76,  246, 170, 26,  146, 208, 69,  197, 88,  62,  65,  224, 21,
    109, 211, 2,   163, 211, 234, 185, 106, 19,  223, 215, 101, 32,  57,  41,
    30,  88,  208, 118, 94,  132, 150, 37,  163, 53,  19,  154, 13,  91,  124,
    95,  247, 110, 180, 121, 18,  227, 48,  223, 102, 124, 81,  182, 42,  150,
    155, 43,  102, 177, 42,  80,  68,  220, 55,  122, 23,  140, 226, 126, 13,
    132, 63,  132, 196, 217, 45,  195, 163, 190, 219, 29,  28,  112, 198, 148,
    123, 119, 46,  32,  74,  189, 227, 169, 129, 125, 8,   40,  161, 208, 72,
    60,  149, 211, 25,  113, 97,  25,  251, 14,  11,  112, 104, 203, 49,  124,
    139, 107, 208, 38,  150, 43,  45,  222, 203, 52,  179, 122, 136, 174, 140,
    235, 46,  8,   158, 100, 145, 97,  2,   120, 255, 176, 123, 103, 147, 86,
    133, 95,  154, 204, 135, 154, 77,  0,   13,  108, 85,  73,  185, 44,  183,
    247, 229, 4,   235, 252, 146, 67,  55,  29,  108, 242, 245, 173, 83,  189,
    29,  71,  199, 149, 246, 116, 164, 12,  51,  16,  59,  155, 62,  91,  242,
    104, 77,  77,  44,  170, 32,  11,  107, 178, 86,  115, 63,  89,  129, 214,
    200, 222, 18,  121, 239, 150, 183, 246, 161, 125, 244, 47,  78,  188, 243,
    148, 214, 240, 95,  249, 217, 130, 142, 19,  79,  101, 226, 28,  191, 71,
    87,  186, 196, 138, 21,  120, 127, 28,  227, 58,  136, 203, 31,  44,  222,
    159, 214, 124, 176, 188, 219, 160, 149, 127, 8,   21,  194, 132, 89,  188,
    133, 89,  251, 148, 178, 117, 153, 115, 137, 122, 164, 139, 147, 0,   83,
    5,   179, 224, 50,  80,  254, 15,  57,  239, 85,  37,  123, 12,  46,  194,
    119, 100, 65,  81,  172, 150, 38,  103, 83,  178, 28,  104, 221, 144, 171,
    166, 145, 26,  237, 194, 14,  207, 160, 87,  161, 227, 77,  108, 157, 67,
    98,  205, 180, 127, 234, 94,  202, 173, 187, 251, 186, 134, 226, 186, 177,
    194, 170, 120, 204, 44,  146, 220, 33,  91,  136, 219, 204, 197, 208, 99,
    35,  100, 230, 144, 117, 31,  246, 120, 223, 24,  169, 85,  179, 204, 178,
    236, 159, 1,   4,   74,  43,  22,  9,   254, 254, 213, 87,  173, 72,  245,
    164, 26,  181, 23,  224, 54,  241, 99,  250, 59,  172, 115, 117, 31,  98,
    167, 186, 194, 199, 9,   81,  216, 165, 16,  188, 113, 52,  70,  111, 152,
    143, 166, 225, 172, 157, 158, 161, 151, 26,  149, 130, 98,  205, 47,  100,
    252, 253, 109, 171, 224, 234, 152, 46,  100, 93,  8,   191, 22,  8,   14,
    203, 216, 78,  29,  213, 17,  143, 34,  34,  223, 139, 48,  188, 225, 109,
    6,   146, 122, 51,  208, 154, 137, 122, 150, 69,  179, 128, 14,  223, 28,
    214, 131, 133, 19,  237, 146, 106, 158, 72,  25,  55,  54,  0,   84,  25,
    69,  124, 67,  209, 135, 163, 225, 185, 180, 241, 120, 104, 78,  72,  31,
    124, 193, 151, 118, 123, 38,  13,  48,  194, 136, 162, 83,  242, 214, 178,
    50,  113, 9,   221, 245, 188, 117, 21,  5,   7,   139, 163, 206, 147, 51,
    245
  ]
}
```

<br>
we need need to convert above array to according to calldata format according to our verifier contract ABI.<br>


```
0x8e760afe000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004c0000000000000000000000000000000000000000000000000000000000000000129968d5e0787b45deabacc305885b083483addb617fde65898f86f2108f235bf1c1a1da06c1a827bafa73dd6faf05cdeae633cfda702a941fb5ecb645ac37b600a7d043394ce327f86e3252a822906654f28f29ec989e63909ff8e2610822a61084a122ecb7fe5c7176d830f5b27abc803c9a8a23fb19fcc3d19d28cbbe7e1221f1401c5a07bd250722245233afb1214ab61c952cc7a721b3304ef10875e5069243e7846ebcc0b73425bedae3386a976475946a2bd982b0c40526de8141b71061162aa0b7759bce84b8408752e05d589257ea83dc12f98285f8a8b03aa2d50f2183343ca188acdbc3032a3a6684fd126ce48e93836e1506436f852aa541d1b9327b012ff84f9910a14d526c7b50cab0f6c4c9abab280e879ff9f0849b5c75f7c0f6425486e7247cccefc92a00a3fc0dbdc566a1bc49839cbde7f427acf04040f11b5e8da933fc61e6ef830522be585c8293a626c5251b19daff5142c65c31f211e912f7de1961f381231cd1e312478515b6d794dbaa78f5665bf634cd5907c311b67ce005247f6ce07b6e5b8b59a982a074874416d9db7a4517b6bd46556a91a195bb582e567337184a8f6ded51e1e874b0759aae2f763999b82674fa8d21dd52c2cd4c9a536a60be20f385d38c80c5eef940aa7a53aa5cdae29e4873d528db7035aeeda5eeb9c3ca0fbc9b4c2357ff4ee1ce3a77f0d628e45adf319085069c517315ea7808abbb23e6307559c73fc4afd8a8036a922493597db416d2aa9a6ea11cf97f48f9fb52c1ef92bd3a1ee091c4d2801ebafd19436653bc771d7c02d8d2e0e5bbae78a9e4a35810e48af0ae79f71a13a2ac9f48f0efe8ba1390a4a486e29aec06c0f068db6b9f958c057731c37606677cfcc75971a5e3ac8c8edeeff6f0f16f5450384be4fa692d6644c1fa9b0d4a886a7ece4702ca0a3204ea9f954b42d31c98937a40951aa9e0032489111642c01071935527f312b4bf9f83cf71eaa05c4bdf974448685ec0c11b41a32f365b6ef15c9f55c17e9003666414861f8e9142a6db5191458404f7b4f23332aeba604e283b81419a264a2b5cfafba3122b10954c60b9cbe56dad8763810ab92dcd860333fbf79770b2d33f2001440e5936929186ea522d2c0eb09d72a46dbd5f1d59213088b9c489e41c67ada953e336202038ce62e6c839d78ec26f4a13d55241dbb865a160cbb90331754a96c36faec1e03a52466781341de73bcb62b70e11313b651805f0f4f2cb425683785f84a9ba82b0e5a2a5c5882c5b8b387c9a6f58289566df30e2bc1af8badf8e98b13c8eb38088c0401384479400ad98f7202eefd81f407f125389eb8450d5921d3c46edfdf1157577c8e0064829792400f3eb190c10b9d06867f7a4eb4cbc57a0f1df119b203ad8b78027f797c1399a27ebee2e86ba8ee0a4a4d290ded6034786be9e021f32727321af979d2d2e1930ba6e1c18f5732575665edebe8cc64cf9af4132272f805a0ea7d97374a04adfbd136029853a1ddbad2a104fe697a90ca5f50866b56b105cfbe5438bd851369a6fe3e695a42cf9fbedf3ae05e2317badcd479e613ed7a0fa69f4ca1fe4f10852cf90ee2f8d0c083addc111d125cc8528abcaec7a129be25d9ca33e50086124aa32dd8c834ae27b34a9bffca8acbd92fa33a30a35000a2
```

<br>

## call data formating in solidity <br>


        0x00 - 0x04 : function signature 
        0x04 - 0x24 : proof_data pointer (location in calldata that contains the proof_data array) 
        0x44 - 0x64 : length of `proof_data` array 
        0x64 - ???? : array containing our zk proof data 
        
**for proof verification in etherscan we would need the array starting from `0x64` location.**  

0x00 - 0x04 : 8e760afe <br>
0x04 - 0x24 : 000000000000000000000000000000000000000000000000000000000000002 <br>
0x44 - 0x64 : 000000000000000000000000000000000000000000000000000000000000004c <br>
0x64 - ???? : array containing our zk proof data 

verifier contract link: https://sepolia.etherscan.io/address/0xC2f25E06073b2Edbf1961A425fCD84B840eD267e#code

```
use this proof for verification in etherscan
0x000000000000000000000000000000000000000000000000000000000000000129968d5e0787b45deabacc305885b083483addb617fde65898f86f2108f235bf1c1a1da06c1a827bafa73dd6faf05cdeae633cfda702a941fb5ecb645ac37b600a7d043394ce327f86e3252a822906654f28f29ec989e63909ff8e2610822a61084a122ecb7fe5c7176d830f5b27abc803c9a8a23fb19fcc3d19d28cbbe7e1221f1401c5a07bd250722245233afb1214ab61c952cc7a721b3304ef10875e5069243e7846ebcc0b73425bedae3386a976475946a2bd982b0c40526de8141b71061162aa0b7759bce84b8408752e05d589257ea83dc12f98285f8a8b03aa2d50f2183343ca188acdbc3032a3a6684fd126ce48e93836e1506436f852aa541d1b9327b012ff84f9910a14d526c7b50cab0f6c4c9abab280e879ff9f0849b5c75f7c0f6425486e7247cccefc92a00a3fc0dbdc566a1bc49839cbde7f427acf04040f11b5e8da933fc61e6ef830522be585c8293a626c5251b19daff5142c65c31f211e912f7de1961f381231cd1e312478515b6d794dbaa78f5665bf634cd5907c311b67ce005247f6ce07b6e5b8b59a982a074874416d9db7a4517b6bd46556a91a195bb582e567337184a8f6ded51e1e874b0759aae2f763999b82674fa8d21dd52c2cd4c9a536a60be20f385d38c80c5eef940aa7a53aa5cdae29e4873d528db7035aeeda5eeb9c3ca0fbc9b4c2357ff4ee1ce3a77f0d628e45adf319085069c517315ea7808abbb23e6307559c73fc4afd8a8036a922493597db416d2aa9a6ea11cf97f48f9fb52c1ef92bd3a1ee091c4d2801ebafd19436653bc771d7c02d8d2e0e5bbae78a9e4a35810e48af0ae79f71a13a2ac9f48f0efe8ba1390a4a486e29aec06c0f068db6b9f958c057731c37606677cfcc75971a5e3ac8c8edeeff6f0f16f5450384be4fa692d6644c1fa9b0d4a886a7ece4702ca0a3204ea9f954b42d31c98937a40951aa9e0032489111642c01071935527f312b4bf9f83cf71eaa05c4bdf974448685ec0c11b41a32f365b6ef15c9f55c17e9003666414861f8e9142a6db5191458404f7b4f23332aeba604e283b81419a264a2b5cfafba3122b10954c60b9cbe56dad8763810ab92dcd860333fbf79770b2d33f2001440e5936929186ea522d2c0eb09d72a46dbd5f1d59213088b9c489e41c67ada953e336202038ce62e6c839d78ec26f4a13d55241dbb865a160cbb90331754a96c36faec1e03a52466781341de73bcb62b70e11313b651805f0f4f2cb425683785f84a9ba82b0e5a2a5c5882c5b8b387c9a6f58289566df30e2bc1af8badf8e98b13c8eb38088c0401384479400ad98f7202eefd81f407f125389eb8450d5921d3c46edfdf1157577c8e0064829792400f3eb190c10b9d06867f7a4eb4cbc57a0f1df119b203ad8b78027f797c1399a27ebee2e86ba8ee0a4a4d290ded6034786be9e021f32727321af979d2d2e1930ba6e1c18f5732575665edebe8cc64cf9af4132272f805a0ea7d97374a04adfbd136029853a1ddbad2a104fe697a90ca5f50866b56b105cfbe5438bd851369a6fe3e695a42cf9fbedf3ae05e2317badcd479e613ed7a0fa69f4ca1fe4f10852cf90ee2f8d0c083addc111d125cc8528abcaec7a129be25d9ca33e50086124aa32dd8c834ae27b34a9bffca8acbd92fa33a30a35000a2
```





        
        
        
       
       
          

