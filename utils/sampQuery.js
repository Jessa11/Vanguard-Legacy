const samp = require('samp-query');

async function checkServerStatus(ip, port) {
  return new Promise((resolve) => {
    samp({ host: ip, port, timeout: 2000 }, (error, response) => {
      if (error) {
        console.error('❌ SAMP Query Failed:', error.message);
        resolve(false);
      } else {
        console.log(`✅ SAMP Query Success: ${response.hostname} - ${response.online}/${response.max}`);
        resolve(true);
      }
    });
  });
}

module.exports = checkServerStatus;
