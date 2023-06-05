import { ethers } from "ethers";
import { useEffect, useState } from "react";
import verifyAbi from "../../contract/verify.json";
import ChipInput from "material-ui-chip-input";
export default function Body(props: any) {
  const { accounts } = props;
  const [target, setTarget] = useState("");
  const [wordsList, setWordsList] = useState<string[]>([]);
  const [check, setCheck] = useState();
  const [render, setRender] = useState(false);

  const addressContract = "0x3123925aCb2257fb39fA8504953246aF66252E2e";

  useEffect(() => {
    console.log("render");
  }, [check]);

  const getValidate = async () => {
    if (accounts && typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        addressContract,
        verifyAbi,
        provider
      );
      const result = await contract.verify(target, wordsList);
      setCheck(result);
      setRender(true);
    } else {
      alert("You need to connect Metamask");
    }
  };

  const handleAdd = (word: any) => setWordsList([...wordsList, word]);

  const handleDelete = (wordToDelete: any) =>
    setWordsList(wordsList.filter((word) => word !== wordToDelete));

  return (
    <div>
      <section className="relative my-14 md:my-28 md:grid md:grid-cols-3 md:items-center">
        <div className="text-center md:col-span-1 md:col-start-2">
          {render ? (
            <p className="text-32">Result: {check ? "true" : "false"}</p>
          ) : (
            <></>
          )}
          <div className="mb-4 mt-8">
            <input
              placeholder="Starget string"
              type="text"
              id="amount2"
              className="border rounded px-2 py-1 text-black text-20"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="mb-4 mt-4">
            <ChipInput
              value={wordsList}
              onAdd={handleAdd}
              onDelete={handleDelete}
              label="Words list"
              variant="outlined"
            />
          </div>
          <span>Enter to add more word to word list</span>
          <button
            onClick={() => {
              getValidate();
            }}
            className="text-white text-20 px-6 py-[6px] font-bold mt-[25px] bg-purple-500 rounded-[14px] hover:bg-pink-500 transition-all duration-300 md:text-25 md:px-8 md:py-[8px]"
          >
            Validate
          </button>
        </div>
      </section>
    </div>
  );
}
