const solaceConfig = require('../config/solace');

const solace = require('solclientjs').debug; // logging supported

// Initialize factory with the most recent API defaults
var factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);

// enable logging to JavaScript console at WARN level
// NOTICE: works only with ('solclientjs').debug
solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);

const createSolaceSession = function (instanceName, sessionProperties) {
  const slc = {};
  slc.session = null;
  slc.connected = false;
  slc.subscribed = false;

  // Logger
  slc.log = function (line) {
    const now = new Date();
    const time = [
      ('0' + now.getHours()).slice(-2),
      ('0' + now.getMinutes()).slice(-2),
      ('0' + now.getSeconds()).slice(-2),
    ];
    const timestamp = '[' + time.join(':') + ']';
    console.log(`${timestamp} [SOLACE]`, `${instanceName}:`, line);
  };

  // make standard session instance
  try {
    const solaceCreds = {
      // solace.SessionProperties
      url: solaceConfig.host,
      vpnName: solaceConfig.vpn,
      userName: solaceConfig.user,
      password: solaceConfig.pass,
      ...sessionProperties,
    };
    // console.log(solaceCreds);
    slc.session = solace.SolclientFactory.createSession(solaceCreds);
  } catch (error) {
    slc.log(error.toString());
  }

  // define session event listeners
  slc.session.on(solace.SessionEventCode.UP_NOTICE, function (sessionEvent) {
    slc.log(
      '=== Successfully connected and ready to subscribe to request topic. ===',
    );
  });
  slc.session.on(
    solace.SessionEventCode.CONNECT_FAILED_ERROR,
    function (sessionEvent) {
      slc.log(
        'Connection failed to the message router: ' +
          sessionEvent.infoStr +
          ' - check correct parameter values and connectivity!',
      );
    },
  );
  slc.session.on(solace.SessionEventCode.DISCONNECTED, function (sessionEvent) {
    slc.log('Disconnected.');
    slc.subscribed = false;
    if (slc.connected) {
      slc.session.dispose();
      slc.connected = false;
    }
  });

  // NOTE: now it is the responsibility of the caller to customize slc.session,
  // e.g to add slc.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (event) => {})

  // main function
  slc.run = function () {
    slc.connect();
  };

  // Establishes connection to Solace PubSub+ Event Broker
  slc.connect = function () {
    if (slc.connected) {
      slc.log('Already connected and ready to ready to receive requests.');
      return;
    }

    // connect the session
    try {
      slc.session.connect();
      slc.connected = true;
    } catch (error) {
      slc.log(error.toString());
    }
  };

  // Gracefully disconnects from Solace PubSub+ Event Broker
  slc.disconnect = function () {
    slc.log('Disconnecting from Solace PubSub+ Event Broker...');
    if (slc.connected) {
      try {
        slc.session.disconnect();
      } catch (error) {
        slc.log(error.toString());
      }
    } else {
      slc.log('Not connected to Solace PubSub+ Event Broker.');
    }
  };

  slc.exit = function () {
    setTimeout(function () {
      slc.disconnect();
    }, 1000); // wait for 1 second to disconnect
  };

  /**
   * A shortcut function to execute the passed function if already connected,
   * else connect first then execute the passed function upon UP.
   */
  slc.exec = async function (fn) {
    return new Promise(function (resolve, reject) {
      try {
        if (slc.connected) {
          resolve(fn());
        } else {
          slc.run();
          slc.session.once(solace.SessionEventCode.UP_NOTICE, function () {
            resolve(fn());
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  return slc;
};

module.exports = {
  solace,
  createSolaceSession,
};
