export const getTokenLogoURL = (address) => {
  const logoExtensions = ['.png', '.webp', '.jpeg', '.jpg', '.svg'];
  return logoExtensions.map((ext) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const image = require(`../assets/tokenLogo/${address.toLowerCase()}${ext}`)
        .default;
      return image;
    } catch (e) {
      return 'error';
    }
  });
};
