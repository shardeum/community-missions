export const formatEthAddress = (account: string) => {
  const address = account;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const CANVAS_SIZES = [
  { width: 700, height: 700 },
  { width: 450, height: 450 },
  { width: 300, height: 300 },
];



export function getBase64FromUri(uri) {
  return uri.replace("data:", "").replace(/^.+,/, "");

}
