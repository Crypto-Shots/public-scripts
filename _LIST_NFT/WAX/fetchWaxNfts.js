const fetch = require('node-fetch');

// INPUT

const collectionName = 'crypto4shots';
const waxAccountName = 'csteknopolly';
const pageNumber = 1;
const pageSize = 100; // max 100


// LOGIC

const fetchPlayerNfts = async () => {
  try {
    return fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=${collectionName
      }&owner=${waxAccountName}&page=${pageNumber}&limit=${pageSize}&order=desc&sort=asset_id`,
      {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-gpc': '1',
        },
        referrer: 'https://wax.bloks.io/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      })
        .then(res => res.json())
        .then(async (result) => {
          let nftsArr = result.data;
          if (nftsArr.length === 0) {
            return console.log('No NFTs found!');
          }
          const responseOwner = result.data[0]?.owner;
          if (responseOwner && responseOwner !== waxAccountName) {
            return console.error('Account mismatch:', responseOwner, waxAccountName);
          }
          console.debug(`> ${nftsArr.length} ${collectionName} NFTs for ${waxAccountName}:`, nftsArr);
          if (nftsArr.length === 100) {
            console.log('\nMore NFTs available on the next page!\n');
          }
        })
        .catch((err) => {
          console.error('Error fetching NFT list:', err);
        });
  } catch (err) {
    console.error('Caught error fetching NFTs:', err);
  }
};
fetchPlayerNfts();
