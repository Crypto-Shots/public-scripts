const dhive = require('@hiveio/dhive');

require('dotenv').config();
const { activeKey, tokenSender } = process.env;

// CONFIG
const nftSymbol = 'CSHOTS'; // SET YOUR NFT SYMBOL HERE
const chainID = 'ssc-mainnet-hive';
const usersToSendNFtTo = require('./input/users.json');

console.log('NFT AIRDOP init:', {
  usersCount: usersToSendNFtTo.length,
  tokenSender, privateKey: activeKey.substr(0, 10) + '***..',
});

const client = new dhive.Client('https://anyx.io');


// UTILS
const nap = ms => new Promise(resolve => setTimeout(resolve, ms));


// TRANSFERS
const transferNft = async ({ id, account, mintNumber }) => {
  console.log(id, ') NFT transfer', { account, mintNumber });
  const payload = {
    contractName: 'nft',
    contractAction: 'transfer',
    contractPayload: {
      to: account,
      nfts: [
        {
          symbol: nftSymbol,
          ids: [mintNumber].map(String), // Sent in order of mint number
        },
      ],
    },
  };
  const customJsonData = {
    required_auths: [tokenSender],
    required_posting_auths: [],
    id: chainID,
    json: JSON.stringify(payload),
  };
  try {
    const privateKey = dhive.PrivateKey.fromString(activeKey);
    console.log('Broadcasting json:', customJsonData);
    const result = await client.broadcast.json(customJsonData, privateKey);
    console.log('Broadcasted successfully', result);
  } catch (err) {
    console.error('[debug] NFT transfer error: ', id, account, nftSymbol, mintNumber, err);
    process.exit(1);
  }
};

const startNftTransfers = async () => {
  let sentCount = 0;
  const errors = [];
  console.log(`Starting ${usersToSendNFtTo.length} transfers..`);
  for (let id = 0; id < usersToSendNFtTo.length; id++) {
    const account = usersToSendNFtTo[id];
    const err = await transferNft({ id, account, mintNumber: sentCount + 1 });
    if (err) {
      errors.push({ account, err });
      continue;
    }
    sentCount++;
    await nap(1000);
  }
  console.log('ALL DONE.',
    { totalRecords: usersToSendNFtTo.length, sentCount },
    { errors },
    `\nhttps://hiveblocks.com/@${tokenSender}`,
  );
};
startNftTransfers();
