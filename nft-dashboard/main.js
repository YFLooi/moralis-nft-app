const serverUrl = "https://gppanowoee5f.usemoralis.com:2053/server";
const appId = "RRTVGl64FMS7Zh4t73WEwBUqhLR9o9vDZLb3Q05Y";

// uses application id from moralis server
// uses serverUrl from moralis server
Moralis.start({
  serverUrl,
  appId,
});

// populates metadata for all retrieved nfts
async function fetchNftMetadata(nftArray) {
  const nftWithMetadata = [];
  for (let i = 0; i < nftArray.length; ++i) {
    const nftId = nftArray[i].token_id;

    // Call Moralis server cloud function to retrieve
    // metadata in static json file
    // Structure: cloud-function-url/functionName?id=someid
    // nftId is a request param
    await fetch(
      `${serverUrl}/functions/getNft?_ApplicationId=${appId}&nftId=${nftId}`
    )
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const parsedRes = JSON.parse(res.result);
        const newNftObj = { ...nftArray[i], metadata: parsedRes };

        console.log(`newNftObj: ${JSON.stringify(newNftObj, null, 2)}`);
        nftWithMetadata.push(newNftObj);
      })
      .catch((err) => {
        console.error(`Error getting nft metadata. Error: ${err.message}`);
      });
  }

  return nftWithMetadata;
}

function renderInventory(nftArray) {
  const parent = document.getElementById("inventory-display");

  for (let i = 0; i < nftArray.length; ++i) {
    const nft = nftArray[i];
    const htmlString = `
      <div class="card text-white bg-primary mb-3">
        <img class="card-img-top" src="${
          nft.metadata.image
        }" alt="Card image cap">
        <div class="card-header">Exhibit ${i + 1}</div>
        <div class="card-body">
          <h5 class="card-title">${nft.metadata.name}</h5>
          <p class="card-text">${nft.metadata.description}</p>
        </div>
      </div>
    `;
    const col = document.createElement("div");
    col.className = "col col-md-4";
    col.innerHTML = htmlString;

    parent.appendChild(col);
  }
}

async function initialiseApp() {
  let currentUser = Moralis.User.current();

  if (!currentUser) {
    // logs in user
    currentUser = await Moralis.Web3.authenticate();
  }

  console.log("User is signed in");

  // address = contract address
  // chain = network it was deployed on. Tends to follow chain name
  // Ex Polygon has mumbai testnet and polygon mainnet. Hence, chain = "mumbai" for testnet
  // and "polygon" for mainnet
  const options = {
    address: "0xce6b4f3f56e3b001fbc994271c4e3ad0f78447b3",
    chain: "mumbai",
  };
  let allNft = await Moralis.Web3API.token.getAllTokenIds(options);
  console.log(`allNft obtained: ${JSON.stringify(allNft, null, 2)}`);

  const nftsWithMetadata = await fetchNftMetadata(allNft?.result);
  console.log(`nft obj after metadata obtained:`);
  console.log(nftsWithMetadata);

  renderInventory(nftsWithMetadata);
}
// Have it run each time page is loaded
initialiseApp();
