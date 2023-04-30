//@ts-nocheck
import {
  Button,
  Code,
  Flex,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { readFile } from "fs/promises";
import { cloneDeep } from "lodash";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { initialize, ZoKratesProvider } from "zokrates-js";
import ConclusionPicture from "../../public/conclusion.png";
import { MagicSquare } from "../components/MagicSquare";
import { MainContainer } from "../components/MainContainer";
import { SourceCodeModal } from "../components/SourceCodeModal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useContractRead, useAccount } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
const snarkjs = require("snarkjs");

const solution = [
  ["31", "73", "7"],
  ["13", "37", "61"],
  ["67", "1", "43"],
];

const defaultValues = [
  ["", "", "7"],
  ["13", "37", ""],
  ["", "", ""],
];

const Index = (props) => {
  const [zokratesProvider, setZokratesProvider] =
    useState<ZoKratesProvider>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proof, setProof] = useState(null);
  const [proof1, setProof1] = useState(false);
  const mounted = useIsMounted();
  const { connector: activeConnector, isConnected } = useAccount();
  const [proofz, setProofz] = useState({
    proof: {
      a: [
        "0x20946a6f6e3db01933ed87ac8195c5e8f6bd297c7c2df141b913a09298b5119a",
        "",
      ],
      b: [
        [
          "0x0c26ffdeb6d849e3f0bd6d46faea48348bcf37c582adc450d9826e339739a533",
          "0x2a85354b5b9471b8d6d2f823fcefda926b86948a34d03b9c68dddacc93f5eeba",
        ],
        [
          "0x2316bce696bd77c61f13d161c7da90ac2ed7aab1b2746095e634ba9dc6f28a78",
          "",
        ],
      ],
      c: [
        "0x012e5cfe23c22ac5184a217c919cf9d368470ed85098a83d558161433d9f56bb",
        "",
      ],
    },
    inputs: [
      "0x000000000000000000000000000000000000000000000000000000000000006f",
    ],
  });
  console.log(
    [proofz["proof"]["a"], proofz["proof"]["b"], proofz["proof"]["c"]],
    proofz["inputs"]
  );
  const { data, isError } = useContractRead({
    address: "0x243deCeFaCfA0774aD566065cc5E67D62238eF19",
    abi: [
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "X",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "Y",
                    type: "uint256",
                  },
                ],
                internalType: "struct Pairing.G1Point",
                name: "a",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "uint256[2]",
                    name: "X",
                    type: "uint256[2]",
                  },
                  {
                    internalType: "uint256[2]",
                    name: "Y",
                    type: "uint256[2]",
                  },
                ],
                internalType: "struct Pairing.G2Point",
                name: "b",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "X",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "Y",
                    type: "uint256",
                  },
                ],
                internalType: "struct Pairing.G1Point",
                name: "c",
                type: "tuple",
              },
            ],
            internalType: "struct Verifier.Proof",
            name: "proof",
            type: "tuple",
          },
          {
            internalType: "uint256[1]",
            name: "input",
            type: "uint256[1]",
          },
        ],
        name: "verifyTx",
        outputs: [
          {
            internalType: "bool",
            name: "r",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "verifyTx",

    args: [
      // @ts-ignore
      [
        proofz["proof"]["a"],
        // @ts-ignore
        proofz["proof"]["b"],
        proofz["proof"]["c"],
      ],
      // @ts-ignore
      proofz["inputs"],
    ],
    enabled: proof1,
    onSuccess(data) {
      // @ts-ignore
      setProof1(false);
      setIsLoading(false);
      toast({
        title: "Yes!",
        description: "Victor successfully verified Peggy's proof :)",
        position: "top",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  console.log(isError);
  useEffect(() => {
    const load = async () => {
      let provider = await initialize();
      setZokratesProvider(provider);
    };
    load();
  }, []);

  const [values, setValues] = useState(defaultValues);

  const onValueChange = (r: number, c: number, value: string) => {
    let newValues = values.slice();
    newValues[r][c] = value;
    setValues(newValues);
  };

  const toast = useToast();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setProof(null);

    setTimeout(async () => {
      try {
        const program = Uint8Array.from(Buffer.from(props.program, "hex"));
        const inputs = values.flat();

        const output = zokratesProvider.computeWitness(
          program,
          [...inputs, "111"],
          { snarkjs: true }
        );

        const provingKey = Uint8Array.from(
          Buffer.from(props.provingKey, "hex")
        );
        const zokratesProof = zokratesProvider.generateProof(
          program,
          output.witness,
          provingKey
        );

        // optionally we can use snarkjs to prove :)
        const zkey = Uint8Array.from(Buffer.from(props.snarkjs.zkey, "hex"));
        const snarkjsProof = await snarkjs.groth16.prove(
          zkey,
          output.snarkjs.witness
        );

        setProof({ zokratesProof, snarkjsProof });
        toast({
          title: "Yay!",
          description: "Your solution is correct :)",
          position: "top",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Whoops!",
          description: "Your solution seems to be incorrect :(",
          position: "top",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      setIsLoading(false);
    }, 100);
  };

  const verify = () => {
    setIsLoading(true);
    const { zokratesProof, snarkjsProof } = proof;
    setProofz(zokratesProof);
    setProof1(true);
    // setTimeout(async () => {
    //   try {
    //     if (
    //       // verify using zokrates
    //       zokratesProvider.verify(props.verificationKey, zokratesProof) &&
    //       // or with snarkjs
    //       (await snarkjs.groth16.verify(
    //         props.snarkjs.vkey,
    //         snarkjsProof.publicSignals,
    //         snarkjsProof.proof
    //       ))
    //     ) {
    //       toast({
    //         title: "Yes!",
    //         description: "Victor successfully verified Peggy's proof :)",
    //         position: "top",
    //         status: "success",
    //         duration: 5000,
    //         isClosable: true,
    //       });
    //     } else {
    //       throw new Error("Verification failed :(");
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     toast({
    //       title: "Whoops!",
    //       description: e.toString(),
    //       position: "top",
    //       status: "error",
    //       duration: 5000,
    //       isClosable: true,
    //     });
    //   }
    //   setIsLoading(false);
    // }, 100000);
  };
  const { nextStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const resetSteps = () => {
    setValues(defaultValues);
    setProof(null);
    setIsLoading(false);
    reset();
  };

  return (
    <MainContainer p={4} justifyContent="center" bg="white" maxWidth="48rem">
      <div>
        <ConnectButton showBalance={false} />
      </div>
      {mounted && isConnected ? (
        <Steps activeStep={activeStep} orientation="vertical">
          <Step label="Bujii (the prover)" key="prover" py={2}>
            <form onSubmit={(e) => onSubmit(e)}>
              <Stack spacing="1.5rem" width="100%" alignItems="center" p={1}>
                <Flex direction="column" alignItems="center">
                  <MagicSquare
                    values={values}
                    onValueChange={(r, c, v) => onValueChange(r, c, v)}
                    marginBottom={2}
                  />
                  <Text
                    color="gray.500"
                    fontSize="sm"
                    onClick={() => setValues(cloneDeep(solution))}
                    cursor="pointer"
                  >
                    Show solution
                  </Text>
                </Flex>
                <Text color="text" fontSize="lg">
                  This is a{" "}
                  <Text as="span" fontWeight="bold">
                    Magic Square
                  </Text>
                  {/* . This means that the numbers add up to the same total in every
                direction. Every row, column and diagonal should add up to{" "}
                <Code>111</Code>. Fill the missing fields and prove to the
                verifier that you know the solution without revealing the
                values! */}
                  The objective is to ensure that all the numbers in the puzzle
                  add up to the same total of {""} <Code>111</Code> in every
                  direction, including rows, columns, and diagonals. Please
                  complete the blank fields and demonstrate to the verifier that
                  you have solved the puzzle without disclosing the specific
                  values.
                </Text>
                <Flex gap={2} flexWrap={"wrap"}>
                  <Button
                    isLoading={isLoading}
                    loadingText="Proving..."
                    colorScheme="teal"
                    variant="solid"
                    type="submit"
                  >
                    Generate a proof
                  </Button>
                  <SourceCodeModal source={props.source} />
                </Flex>
                {proof && (
                  <Flex maxW="100%" direction="column">
                    <Code
                      whiteSpace="pre"
                      overflow="scroll"
                      textAlign="left"
                      p={2}
                      mb={2}
                    >
                      {JSON.stringify(proof.zokratesProof, null, 2)}
                    </Code>
                    <Button
                      variant="solid"
                      type="button"
                      colorScheme="teal"
                      onClick={nextStep}
                    >
                      Next step
                    </Button>
                  </Flex>
                )}
              </Stack>
            </form>
          </Step>
          <Step label="Dora (the verifier)" key="verifier" py={2}>
            <Stack
              spacing="1.5rem"
              width="100%"
              maxWidth="48rem"
              alignItems="center"
              p="1rem"
            >
              <Image src={ConclusionPicture} alt="conclusion" />
              <Text color="text" fontSize="lg"></Text>
              <Flex gap={2}>
                <Button
                  isLoading={isLoading}
                  loadingText="Verifying..."
                  colorScheme="teal"
                  variant="solid"
                  type="button"
                  onClick={verify}
                >
                  Verify
                </Button>
                <Button variant="solid" type="button" onClick={resetSteps}>
                  Reset
                </Button>
              </Flex>
            </Stack>
          </Step>
        </Steps>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          Please connect you wallet
        </div>
      )}
      <Flex as="footer" py="8rem" alignItems="center" direction="column"></Flex>
    </MainContainer>
  );
};

export async function getStaticProps() {
  // zokrates artifacts
  const source = (await readFile("zkp/magic_square.zok")).toString();
  const program = (await readFile("zkp/magic_square")).toString("hex");
  const verificationKey = JSON.parse(
    (await readFile("zkp/verification.key")).toString()
  );
  const provingKey = (await readFile("zkp/proving.key")).toString("hex");

  // snarkjs artifacts
  const zkey = (await readFile("zkp/snarkjs/magic_square.zkey")).toString(
    "hex"
  );
  const vkey = JSON.parse(
    (await readFile("zkp/snarkjs/verification_key.json")).toString()
  );

  return {
    props: {
      source,
      program,
      verificationKey,
      provingKey,
      snarkjs: {
        zkey,
        vkey,
      },
    },
  };
}

export default Index;
