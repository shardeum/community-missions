export function CreateImage(data) {
  let color = [
    "",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-gray-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-lime-500",
  ];
  let array1;
  console.log("data", data["data"]);
  if (data["data"]) {
    array1 = [...data["data"][0], ...data["data"][1], ...data["data"][2]];
  } else {
    array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  array1 = array1.map(Number);
  if (array1[0] === 0) {
    array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-4">
      {/* First Row */}
      <div
        className={`${
          color[array1[0]]
        } h-24 w-24 transition duration-500 ease-in-out transform hover:bg-red-500`}
      >
        {array1[0]}
      </div>
      <div
        className={`${
          color[array1[1]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-yellow-500`}
      >
        {array1[1]}
      </div>
      <div
        className={`${
          color[array1[2]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-green-500`}
      >
        {array1[2]}
      </div>
      <div
        className={`${
          color[array1[3]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-orange-500`}
      >
        {array1[3]}
      </div>

      {/* Second Row */}
      <div
        className={`${
          color[array1[4]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-blue-500`}
      >
        {array1[4]}
      </div>
      <div
        className={`${
          color[array1[5]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-purple-500`}
      >
        {array1[5]}
      </div>
      <div
        className={`${
          color[array1[6]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-pink-500`}
      >
        {array1[6]}
      </div>
      <div
        className={`${
          color[array1[7]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-gray-500`}
      >
        {array1[7]}
      </div>

      {/* Third Row */}
      <div
        className={`${
          color[array1[8]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-teal-500`}
      >
        {array1[8]}
      </div>
      <div
        className={`${
          color[array1[9]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-teal-500`}
      >
        {array1[9]}
      </div>
      <div
        className={`${
          color[array1[10]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-teal-500`}
      >
        {array1[10]}
      </div>
      <div
        className={`${
          color[array1[11]]
        } h-24 transition duration-500 ease-in-out transform hover:bg-teal-500`}
      >
        {array1[11]}
      </div>
    </div>
  );
}
