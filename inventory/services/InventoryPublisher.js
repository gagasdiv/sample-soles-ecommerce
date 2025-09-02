const { solace, createSolaceSession } = require('../integrations/solaceClient');

const inventoryPublisher = createSolaceSession('InventoryPublisher', {
  publisherProperties: {
    acknowledgeMode: solace.MessagePublisherAcknowledgeMode.PER_MESSAGE,
  },
});

inventoryPublisher.session.on(
  solace.SessionEventCode.ACKNOWLEDGED_MESSAGE,
  function (sessionEvent) {
    inventoryPublisher.log(
      'Delivery of message to PubSub+ Broker with correlation key = ' +
        sessionEvent.correlationKey.id +
        ' confirmed.',
    );
  },
);
inventoryPublisher.session.on(
  solace.SessionEventCode.REJECTED_MESSAGE_ERROR,
  function (sessionEvent) {
    inventoryPublisher.log(
      'Delivery of message to PubSub+ Broker with correlation key = ' +
        sessionEvent.correlationKey.id +
        ' rejected, info: ' +
        sessionEvent.infoStr,
    );
  },
);

const queueName = 'q.sample-ecommerce.inventory';

const buildTopic = function (event, inv) {
  // return `sample-ecommerce/inventory/${event}/${inv.orderId}`;
  return `sample-ecommerce/inventory/${event}`;
};

const sendInventoryEvent = async (event, inv) => {
  await inventoryPublisher.exec(function () {
    const eventName = `inventory:${event}`;
    const message = solace.SolclientFactory.createMessage();
    const topic = buildTopic(event, inv);
    inventoryPublisher.log('Sending message to topic "' + topic + '"...');
    message.setDestination(
      // solace.SolclientFactory.createDurableQueueDestination(queueName),
      solace.SolclientFactory.createTopicDestination(topic),
    );
    message.setBinaryAttachment(
      JSON.stringify({
        ...inv,
        event: eventName,
      }),
    );
    message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
    // OPTIONAL: You can set a correlation key on the message and check for the correlation
    // in the ACKNOWLEDGE_MESSAGE callback. Define a correlation key object
    const correlationKey = {
      name: 'MESSAGE_CORRELATIONKEY',
      id: `inventory:${event}:${Date.now()}`,
    };
    message.setCorrelationKey(correlationKey);

    try {
      // Delivery not yet confirmed.
      inventoryPublisher.session.send(message);
      inventoryPublisher.log(
        'Message sent with correlation key=' + correlationKey.id,
      );
    } catch (error) {
      inventoryPublisher.log(error.toString());
    }
  });
};

const sendArbitraryEvent = async (event, payload) => {
  await inventoryPublisher.exec(function () {
    const eventName = event;
    const message = solace.SolclientFactory.createMessage();
    const topic = `sample-ecommerce/${event}`;
    inventoryPublisher.log('Sending message to topic "' + topic + '"...');
    message.setDestination(
      // solace.SolclientFactory.createDurableQueueDestination(queueName),
      solace.SolclientFactory.createTopicDestination(topic),
    );
    message.setBinaryAttachment(
      JSON.stringify({
        ...payload,
        event: eventName,
      }),
    );
    message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
    // OPTIONAL: You can set a correlation key on the message and check for the correlation
    // in the ACKNOWLEDGE_MESSAGE callback. Define a correlation key object
    const correlationKey = {
      name: 'MESSAGE_CORRELATIONKEY',
      id: `${event}:${Date.now()}`,
    };
    message.setCorrelationKey(correlationKey);

    try {
      // Delivery not yet confirmed.
      inventoryPublisher.session.send(message);
      inventoryPublisher.log(
        'Message sent with correlation key=' + correlationKey.id,
      );
    } catch (error) {
      inventoryPublisher.log(error.toString());
    }
  });
};

// Because the solace client is old, it doesnt have promises/async things, so we can't really wait for it.
// That's why we can't dynamically connect upon needing to send a message. There's a way to wait for it with
// on(connect) or once(connect), but it's kinda unreliable because if two requests are trying to send a message
// at the same time, we'd connect twice... which is not what we want.

// Start this immediately (upon app run)
// inventoryPublisher.run();

module.exports = {
  ...inventoryPublisher,
  queueName,
  sendInventoryEvent,
  sendArbitraryEvent,
};
