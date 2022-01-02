Moralis.Cloud.define("getNft", async function (request) {
  // works similar to Winston logging...
  const logger = Moralis.Cloud.getLogger();

  const nftId = request.params.nftId;
  // incoming id is a string. toString(16) converts to hex (base 16)
  const hexId = parseInt(nftId).toString(16);
  // "-64" will remove all but the last 64 digits. This accounts for hexId of any length up to 64 characters
  const paddedHex = (
    "0000000000000000000000000000000000000000000000000000000000000000" + hexId
  ).slice(-64);
  logger.info("Padded hex generated: " + paddedHex);

  // Call to deployed Moralis app
  return Moralis.Cloud.httpRequest({
    url:
      "https://gppanowoee5f.usemoralis.com/public/metadata/" +
      paddedHex +
      ".json",
  })
    .then((res) => {
      logger.info("Metadata obtained:");
      logger.info(res.text);
      return res.text;
    })
    .catch((err) => {
      logger.error("Unable to get NFT metadata. Error: " + err.message);
      throw new Error("Unable to get NFT metadata. Error: " + err.message);
    });
});
