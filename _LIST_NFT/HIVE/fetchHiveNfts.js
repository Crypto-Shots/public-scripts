const fetch = require('node-fetch');


// CONFIG

const targetUser = 'cryptoshots.nft';
const nftSymbol = 'CSHOTS';


// FETCH

const fetchUrl = 'https://engine.rishipanthee.com/contracts';
// For HE testnet use: https://enginetestnet.rishipanthee.com/contracts

const fetchNfts = () => {
  console.log('Fetching NFTs for user', targetUser);
  fetch(
    fetchUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify([{
        method: "find",
        jsonrpc: "2.0",
        params: {
          contract: "nft",
          table: `${nftSymbol}instances`,
          query: { account: targetUser },
          limit: 1000,
          offset: 0,
          indexes: []
        },
        id: 1
      }]),
    }
  )
    .then(res => res.json())
    .then(data => console.log(`${targetUser}'s NFTs for symbol ${nftSymbol}:\n${JSON.stringify(data, null, 2)}`));
};
fetchNfts();
