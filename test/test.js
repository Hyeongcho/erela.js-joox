const { Manager } = require('erela.js');
const Joox = require('../dist');

const manager = new Manager({
    nodes: [{
        host: 'localhost',
        port: 8080
    }],
    send(id, packet) {
        return true;
    },
    plugins: [new Joox()]
});

manager.init('725067926457155706').search('https://www.joox.com/id/album/Ug+JezWdJTUMWMjdWruuCw==', null).then(console.log)
