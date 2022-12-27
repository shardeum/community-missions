import React, { useState } from "react";

type Props = {};

function TokenSelectionModal({
  selectedToken,
  tokenList,
  onSelect,
  onClose,
  secondToken,
}) {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query?.trim() === ""
      ? tokenList
      : tokenList.filter(
          (token) =>
            token.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, "")) ||
            token.address
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, "")) ||
            token?.symbol
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <>
      <label
        htmlFor={`my-modal-${selectedToken?.symbol}`}
        className="flex gap-3 my-1 btn w-fit"
      >
        <img src={selectedToken?.logoURI} alt="" width={20} height={20} />{" "}
        {selectedToken?.symbol}
      </label>

      {/* Put this part before </body> tag */}
      <input
        type="checkbox"
        id={`my-modal-${selectedToken?.symbol}`}
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Token Select</h3>
          <input
            type="text"
            placeholder="Type here"
            className="w-full max-w-xs p-3 m-3 input input-bordered "
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="">
            {filteredOptions?.map((t) => {
              return (
                <label
                  className={`flex items-center gap-5 p-3 m-3 cursor-pointer rounded-xl hover:bg-base-200 ${
                    selectedToken?.symbol == t?.symbol ||
                    secondToken?.symbol == t?.symbol
                      ? "bg-base-200"
                      : "bg-base-100"
                  }`}
                  onClick={() => {
                    if (secondToken?.symbol == t?.symbol) {
                      alert("Same token selected");
                      return;
                    }

                    onSelect(t);
                    setQuery("");
                  }}
                  htmlFor={`my-modal-${selectedToken?.symbol}`}
                >
                  <img src={t?.logoURI} alt="" width={50} height={50} />
                  <p>{t?.symbol}</p>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default TokenSelectionModal;
