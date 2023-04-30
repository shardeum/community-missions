export function CreateImage(data) {
  let board;
  if (data["data"]) {
    board = [
      [...data["data"][0]],
      [...data["data"][1]],
      [...data["data"][2]],
      [...data["data"][3]],
      [...data["data"][4]],
      [...data["data"][5]],
      [...data["data"][6]],
      [...data["data"][7]],
      [...data["data"][8]],
    ];
    console.log(board);
  } else {
    board = [
      [0, 0, 0, 0, 0, 0, 0, 0, 8],
      [1, 8, 0, 0, 0, 2, 3, 0, 0],
      [0, 6, 0, 0, 5, 7, 0, 0, 1],
      [0, 7, 0, 9, 6, 0, 0, 0, 0],
      [0, 9, 0, 7, 0, 4, 0, 1, 0],
      [0, 0, 0, 0, 8, 1, 0, 4, 0],
      [6, 0, 0, 2, 4, 0, 0, 8, 0],
      [0, 0, 4, 5, 0, 0, 0, 9, 3],
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
  }
  return (
    <div>
      <table className="border-collapse border border-gray-400">
        <tbody>
          {Array.from({ length: 9 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 9 }).map((_, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-10 h-10 text-center border ${
                    (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2
                      ? "bg-gray-100"
                      : "bg-gray-200"
                  }`}
                >
                  {`${board[rowIndex][colIndex]}`} {/* Dummy value */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
