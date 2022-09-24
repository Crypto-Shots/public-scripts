

const fetch = require('node-fetch');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextEncoder, TextDecoder } = require('util');


// INPUT

const toAccount = 'crypto5shots';
const collectionName = 'crypto4shots';
const schemaName = 'cs.gameitems';
const templateId = '403690';


// CONFIG

require('dotenv').config();
const { waxTokenSender, waxActiveKey } = process.env;
const signatureProvider = new JsSignatureProvider([waxActiveKey]);

const rpcEndpointsList = {
  mainnet: [
    'https://wax.greymass.com',
    'https://wax.eosrio.io',
  ],
  testnet: [
    'https://testnet.waxsweden.org',
    'https://waxtestnet.greymass.com',
  ],
};
const waxEndpoint = rpcEndpointsList.mainnet[0];


console.log('NFT transfer info:', {
  waxTokenSender, key: `${waxActiveKey.substr(0, 5)}${'*'.repeat(10)}`,
  toAccount, collectionName, schemaName, templateId,
});


// CORE LOGIC

const rpcCall = async (data) => {
  try {
    const rpc = new JsonRpc(waxEndpoint, { fetch });
    const api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
    const result = await api.transact(data, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    console.log('RPC call result:', waxEndpoint, result);
  } catch (error) {
    console.error('Caught RPC error:', waxEndpoint, error);
    return ({ err: error });
  }
};

const mintAndTransferWaxNft = async () => {
  const actionParams = {
    actions: [{
      account: 'atomicassets',
      name: 'mintasset',
      authorization: [{
        actor: waxTokenSender,
        permission: 'active',
      }],
      data: {
        authorized_minter: waxTokenSender,
        collection_name: collectionName,
        schema_name: schemaName,
        template_id: templateId,
        new_asset_owner: toAccount,
        immutable_data: [],
        mutable_data: [],
        tokens_to_back: [],
      },
    }],
  };
  try {
    const { err, result } = await rpcCall(actionParams);
    if (err) return console.error('Soemething went wrong during the mint:', err);
    console.log('Mint success!', { toAccount, transaction_id: result.transaction_id });
  } catch (error) {
    console.log('Caught mint error: ', error, { toAccount, amount, symbol, memo });
  }
};
mintAndTransferWaxNft();
