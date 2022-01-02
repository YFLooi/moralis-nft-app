const serverUrl = "https://gppanowoee5f.usemoralis.com:2053/server";
const appId = "RRTVGl64FMS7Zh4t73WEwBUqhLR9o9vDZLb3Q05Y";
const CONTRACT_ADDRESS = "0xce6b4f3f56e3b001fbc994271c4e3ad0f78447b3";
let web3;

// uses application id from moralis server
// uses serverUrl from moralis server
Moralis.start({
  serverUrl,
  appId,
});

async function mint() {
  // int expected by smart contract for tokenid and amount. Address should be string
  const tokenId = parseInt(document.getElementById("token_id_input").value);
  const amount = parseInt(document.getElementById("amount_input").value);
  const address = document.getElementById("address_input").value;

  /**
   * Old way to send with web3. I'll need my smart contract's ABI to do this
   * Contract ABI = specified interface of smart contract which tell JS
   * what functions are available, its arguments, and what it returns
   */
  const accounts = await web3.eth.getAccounts();
  const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);

  contract.methods
    // mint() is a method defined in the smart contract
    .mint(address, tokenId, amount)
    // value: 0 (gas fee) since minting is free
    .send({ from: accounts[0], value: 0 })
    .on("receipt", () => {
      // Runs after blockchain confirms mint
      alert(
        `Minting of ${amount} token for tokenId ${tokenId} to account ${accounts[0]} complete`
      );
    });

  // Moralis docs on transferring tokens:
  // https://docs.moralis.io/moralis-server/sending-assets
  // const options = {
  //   type: "erc1155",
  //   receiver: address,
  //   contractAddress: CONTRACT_ADDRESS,
  //   tokenId: tokenId,
  //   amount: amount,
  // };
  // let result = await Moralis.transfer(options);
}

async function moralisLogin() {
  let currentUser = Moralis.User.current();

  if (!currentUser) {
    console.log("User not yet signed in. Redirecting to index.html");
    currentUser = window.location.pathname = "/nft-dashboard/index.html";
  }
}

async function initialiseApp() {
  web3 = await Moralis.Web3.enable();
  await moralisLogin();

  const accounts = await web3.eth.getAccounts();
  console.log(`accounts available:`);
  console.log(accounts);

  // works similar to req.params in Express
  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get("nftId");
  console.log(`nftId provided: ${nftId}`);

  // auto-fill token address and current logged-in user's address
  document.getElementById("token_id_input").value = nftId;
  document.getElementById("address_input").value = accounts[0];
}

// Listeners
document.getElementById("submit_mint").onclick = mint;

// Have it run each time page is loaded
initialiseApp();
