const { solace, createSolaceSession } = require('../integrations/solaceClient');

const productPublisher = createSolaceSession('ProductPublisher', {
  publisherProperties: {
    acknowledgeMode: solace.MessagePublisherAcknowledgeMode.PER_MESSAGE,
  },
});

productPublisher.session.on(
  solace.SessionEventCode.ACKNOWLEDGED_MESSAGE,
  function (sessionEvent) {
    productPublisher.log(
      'Delivery of message to PubSub+ Broker with correlation key = ' +
        sessionEvent.correlationKey.id +
        ' confirmed.',
    );
  },
);
productPublisher.session.on(
  solace.SessionEventCode.REJECTED_MESSAGE_ERROR,
  function (sessionEvent) {
    productPublisher.log(
      'Delivery of message to PubSub+ Broker with correlation key = ' +
        sessionEvent.correlationKey.id +
        ' rejected, info: ' +
        sessionEvent.infoStr,
    );
  },
);

const queueName = 'q.sample-ecommerce.product';

const buildTopic = function (event, product) {
  // return `sample-ecommerce/products/${event}/${product.orderId}`;
  return `sample-ecommerce/products/${event}`;
};

const sendProductEvent = async (event, product) => {
  await productPublisher.exec(function () {
    const eventName = `product:${event}`;
    const message = solace.SolclientFactory.createMessage();
    const topic = buildTopic(event, product);
    productPublisher.log('Sending message to topic "' + topic + '"...');
    message.setDestination(
      // solace.SolclientFactory.createDurableQueueDestination(queueName),
      solace.SolclientFactory.createTopicDestination(topic),
    );
    message.setBinaryAttachment(
      JSON.stringify({
        ...product,
        event: eventName,
      }),
    );
    message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
    // OPTIONAL: You can set a correlation key on the message and check for the correlation
    // in the ACKNOWLEDGE_MESSAGE callback. Define a correlation key object
    const correlationKey = {
      name: 'MESSAGE_CORRELATIONKEY',
      id: `product:${event}:${Date.now()}`,
    };
    message.setCorrelationKey(correlationKey);

    try {
      // Delivery not yet confirmed.
      productPublisher.session.send(message);
      productPublisher.log(
        'Message sent with correlation key=' + correlationKey.id,
      );
    } catch (error) {
      productPublisher.log(error.toString());
    }
  });
};

// Because the solace client is old, it doesnt have promises/async things, so we can't really wait for it.
// That's why we can't dynamically connect upon needing to send a message. There's a way to wait for it with
// on(connect) or once(connect), but it's kinda unreliable because if two requests are trying to send a message
// at the same time, we'd connect twice... which is not what we want.

// Start this immediately (upon app run)
// productPublisher.run();

module.exports = {
  ...productPublisher,
  queueName,
  sendProductEvent,
};
