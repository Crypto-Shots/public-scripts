const fetch = require('node-fetch');
const { Client, Blockchain } = require('@hiveio/dhive');

const fetchHealthyHiveNode = () => fetch(
  'https://beacon.peakd.com/api/nodes',
  {
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    method: 'GET',
  },
)
  .then((res) => res.json())
  .then((allNodes) => {
    const healthyNodes = allNodes.filter(({ score } = {}) => score === 100);
    return ({ hiveNode: healthyNodes[0].endpoint });
  })
  .catch((fetchErr) => ({ err: `Url fetch failed: ${fetchErr}` }));

const streamBlocks = async () => {
  const { err, hiveNode } = await fetchHealthyHiveNode();
  if (err) return;
  const client = new Client(hiveNode);
  const blockchain = new Blockchain(client);
  console.log('Streaming blocks from', hiveNode);
  blockchain.getBlockStream()
    .on('data', (block) => {
      console.log(`Received block #${block.block_id} containing ${block.transactions.length} transactions`);
      block.transactions.forEach(
        tx => tx.operations.forEach(
          op => op[0] === 'custom_json' && console.log(op[1]),
        )
      );
    })
    .on('error', console.error);
};
streamBlocks();
