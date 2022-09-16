const dhive = require('@hiveio/dhive');
const client = new dhive.Client('https://anyx.io');

require('dotenv').config();
const { activeKey, tokenSender } = process.env;


// CONFIG
const usersToAirdropTo = require('./input/usersAndAmount.json');
const chainID = 'ssc-mainnet-hive';
const symbolName = 'DOOM'; // PUT YOUR TOKEN NAME HERE

const users = Object.keys(usersToAirdropTo);
console.log('Token AIRDOP init:', {
  usersCount: users.length,
  tokenSender, privateKey: activeKey.substr(0, 10) + '***..',
});


// UTILS
const nap = ms => new Promise(resolve => setTimeout(resolve, ms));


// TRANSFERS
const transferDoom = ({ id, account, amount  }) => new Promise((resolve) => { 
  const privateKey = dhive.PrivateKey.fromString(activeKey);
  const payload = {
    contractName: 'tokens',
    contractAction: 'transfer',
    contractPayload: {
      symbol: symbolName,
      to: account,
      quantity: amount, // eg. '1.0000'
    }
  };
  const new_json = {
    required_auths: [tokenSender],
    required_posting_auths: [],
    id: chainID,
    json: JSON.stringify(payload)
  };
  console.log(id, ') Sending', { amount, symbolName, account });
  client.broadcast.json(new_json, privateKey)
    .then(
      (result) => {
        // console.log('result', result);
        resolve();
      },
      (error) => {
        console.error('Returned err:', error);
        resolve(error);
      },
    )
    .catch((error) => {
      console.error('Caught err:', error);
      resolve(error);
    });
});

const startAirdrop = async () => {
  let sentCount = 0;
  let totSent = 0;
  const errors = [];
  console.log(`Starting ${users.length} transfers..`);
  for (let id = 0; id < users.length; id++) {
    const account = users[id];
    const amount = usersToAirdropTo[account].toFixed(4);
    const err = await transferDoom({ id, account, amount });
    if (err) {
      errors.push({ account, amount, err });
      continue;
    }
    sentCount++;
    totSent += +amount;
    await nap(1000);
  }
  console.log('ALL DONE.',
    { totalRecords: users.length, sentCount, totSent },
    { errors },
    `\nhttps://hiveblocks.com/@${tokenSender}`,
  );
};
startAirdrop();
