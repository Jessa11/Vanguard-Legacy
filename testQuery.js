const samp = require('samp-query');

const options = {
    host: '154.26.137.65',
    port: 7024,
    timeout: 2000
};

samp(options, (error, response) => {
    if (error) {
        console.error('❌ Query failed:', error);
    } else {
        console.log('✅ Query success:', response);
    }
});