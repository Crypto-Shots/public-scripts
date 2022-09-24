

const fetch = require('node-fetch');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextEncoder, TextDecoder } = require('util');


// INPUT

const tokenContract = 'csboomcsboom';
const toAccount = 'crypto5shots';
const amount = 0.0001;
const memo = 'transfer script';
const symbol = 'BOOM';


// CONFIG

const precision = symbol === 'WAX' ? 8 : 4;
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


console.log('Token transfer info:', {
  waxTokenSender, key: `${waxActiveKey.substr(0, 5)}${'*'.repeat(10)}`,
  tokenContract, toAccount, amount, symbol, memo,
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

const transferWaxToken = async () => {
  const amountToTransfer = Number(amount);
  const actionParams = {
    actions: [{
      account: symbol === 'WAX' ? 'eosio.token' : tokenContract,
      name: 'transfer',
      authorization: [{
        actor: waxTokenSender,
        permission: 'active',
      }],
      data: {
        from: waxTokenSender,
        to: toAccount,
        quantity: `${amountToTransfer.toFixed(precision)} ${symbol}`,
        memo,
      },
    }],
  };
  try {
    const { err, result } = await rpcCall(actionParams);
    if (err) return console.error('Soemething went wrong during the transfer:', err);
    console.log('Transfer success!', { toAccount, transaction_id: result.transaction_id });
  } catch (error) {
    console.log('Caught transfer error: ', error, { toAccount, amount, symbol, memo });
  }
};
transferWaxToken();
