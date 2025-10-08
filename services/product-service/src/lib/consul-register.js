const Consul = require('consul');

module.exports = async function register({ name, host = 'consul', port = 4000 }) {
    try {
        const consul = new Consul({ host });
        await new Promise((resolve, reject) => {
            consul.agent.service.register({ name, address: name, port: parseInt(port, 10) }, (err) => {
                if (err) return reject(err);
                console.log(`Registered ${name} with Consul`);
                resolve();
            });
        });
    } catch (e) {
        console.warn('Consul registration error (ignored):', e.message || e);
    }
};