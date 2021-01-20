const ws = require('ws');

const client = new ws('ws://localhost:3000');

client.on('open', () => {
  // Causes the server to print "Hello"
  client.send('0Hello');

  client.onmessage = ({data}) => console.log(JSON.parse(data));
});

