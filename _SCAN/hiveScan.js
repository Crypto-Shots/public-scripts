const dhive = require('@hiveio/dhive');

const hiveNodes = [
  'https://api.openhive.network',
  'https://anyx.io',
  'https://rpc.ecency.com',
];

const pickHiveNode = () => {
  const randId = Math.floor(Math.random() * hiveNodes.length);
  const pickedNode = hiveNodes[randId];
  return pickedNode;
};

const client = new dhive.Client(pickHiveNode());
const SCAN_TIMEOUT = 30 * 1000; // stop after 10 seconds. Set to null for no timeout.
let stream;


const streamHive = () => {
  // ## Timeout
  SCAN_TIMEOUT && setTimeout(() => stream && stream.pause(), SCAN_TIMEOUT);
  // ## Active Streaming
  try {
    if (stream) stream.resume();
    else {
      stream = client.blockchain.getBlockStream();
    }
    stream
      .on('data', async (block = { transactions: [] }) => {
        console.log(new Date(), 'Received block:', block);
      })
      .on('error', async (err) => {
        console.log('Stream error:', err);
      })
      .on('end', (arg) => console.log('Done streaming', arg));
  } catch (err) {
    console.error('Caught error starting stream:', err);
  }
};
streamHive();
