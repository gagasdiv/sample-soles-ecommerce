const solaceConfig = {
  host: process.env.SOLACE_HOST || '',
  vpn: process.env.SOLACE_VPN || '',
  user: process.env.SOLACE_USER || '',
  pass: process.env.SOLACE_PASS || '',
};

module.exports = solaceConfig;
