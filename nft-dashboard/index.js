const serverUrl = "https://gppanowoee5f.usemoralis.com:2053/server";
const appId = "RRTVGl64FMS7Zh4t73WEwBUqhLR9o9vDZLb3Q05Y";
const CONTRACT_ADDRESS = "0xce6b4f3f56e3b001fbc994271c4e3ad0f78447b3";

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
      .then(async (res) => {
        /**
         * Returns an object with number of NFT transfers and an array with
         * all owners of NFT items within a given contract collection (asynchronous).
         * address = contract address =  nftArray[i].token_address
         */
        const options = {
          address: nftArray[i].token_address,
          token_id: nftId,
          chain: "mumbai",
        };
        // token == nft
        const tokenOwnerData = await Moralis.Web3API.token.getTokenIdOwners(
          options
        );
        console.log(
          `Previous owner(s) of nft with id ${nftId}: ${JSON.stringify(
            tokenOwnerData,
            null,
            2
          )}`
        );
        const tokenOwners = [];
        tokenOwnerData.result.forEach((token) => {
          tokenOwners.push(token.owner_of);
        });

        const parsedRes = JSON.parse(res.result);
        const newNftObj = {
          ...nftArray[i],
          metadata: parsedRes,
          owners: tokenOwners,
        };

        // console.log(`newNftObj: ${JSON.stringify(newNftObj, null, 2)}`);
        nftWithMetadata.push(newNftObj);
      })
      .catch((err) => {
        console.error(`Error getting nft metadata. Error: ${err.message}`);
      });
  }

  return nftWithMetadata;
}

function renderInventory(nftArray, numTokensUnderCurrentAccount) {
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
          <p class="card-text">Number of owners: ${nft.owners?.length}</p>
          <p class="card-text">Your balance: ${
            numTokensUnderCurrentAccount[nft.token_id]
          }</p>
          <p class="card-text">Tokens in circulation: ${nft.amount}</p>
          <a href="/nft-dashboard/mint.html?nftId=${
            nft.token_id
          }" class="btn btn-success">Mint</a>
          <a href="/nft-dashboard/transfer.html?nftId=${
            nft.token_id
          }" class="btn btn-warning">Transfer</a>
        </div>
      </div>
    `;
    const col = document.createElement("div");
    col.className = "col col-md-4";
    col.innerHTML = htmlString;

    parent.appendChild(col);
  }
}

async function moralisLogin() {
  let currentUser = Moralis.User.current();

  if (!currentUser) {
    // logs in user
    currentUser = await Moralis.Web3.authenticate();
  }
  console.log("User is signed in");
}

async function moralisLogout() {
  let currentUser = Moralis.User.current();

  if (currentUser) {
    // logs out user
    currentUser = await Moralis.User.logOut();
  }
  console.log("User is signed out");
}

async function getNumTokensUnderCurrentAccount() {
  const accounts = Moralis.User.current().get("accounts");

  // Just get the 1st account address
  const options = {
    chain: "mumbai",
    address: accounts[0],
    token_address: CONTRACT_ADDRESS,
  };
  return Moralis.Web3API.account.getNFTsForContract(options).then((res) => {
    console.log(`Contract found under owner account ${accounts[0]}: `);
    console.log(res);

    let result = res.result.reduce((obj, current) => {
      obj[current.token_id] = current.amount;
      return obj;
    }, {});
    return result;
  });
}

async function initialiseApp() {
  await moralisLogin();

  // address = contract address
  // chain = network it was deployed on. Tends to follow chain name
  // Ex Polygon has mumbai testnet and polygon mainnet. Hence, chain = "mumbai" for testnet
  // and "polygon" for mainnet
  const options = {
    address: CONTRACT_ADDRESS,
    chain: "mumbai",
  };
  let allNft = await Moralis.Web3API.token.getAllTokenIds(options);
  // console.log(`allNft obtained: ${JSON.stringify(allNft, null, 2)}`);

  const nftsWithMetadata = await fetchNftMetadata(allNft?.result);
  console.log(`nft obj after metadata obtained:`);
  console.log(nftsWithMetadata);

  const numTokensUnderCurrentAccount = await getNumTokensUnderCurrentAccount();
  console.log(
    `numTokensUnderCurrentAccount: ${JSON.stringify(
      numTokensUnderCurrentAccount,
      null,
      2
    )}`
  );

  renderInventory(nftsWithMetadata, numTokensUnderCurrentAccount);
}
// Have it run each time page is loaded
initialiseApp();
