const { solace, createSolaceSession } = require('../integrations/solaceClient');

const productConsumer = createSolaceSession('ProductConsumer');

const queueName = 'q.sample-ecommerce.inventory.product';
const topicName = 'sample-ecommerce/product/>';

productConsumer.consuming = false;
productConsumer.subscribed = false;

function createSubscriber() {
  productConsumer.log('Starting subscriber for queue: ' + queueName);
  try {
    // Create a message subscriber
    productConsumer.messageSubscriber =
      productConsumer.session.createMessageConsumer({
        // solace.MessageConsumerProperties
        queueDescriptor: { name: queueName, type: solace.QueueType.QUEUE },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT, // Enabling Client ack
        createIfMissing: true, // Create queue if not exists
      });

    productConsumer.messageSubscriber.subscribeTo = function (topicName) {
      productConsumer.log('Subscribing to topic: ' + topicName);
      try {
        productConsumer.messageSubscriber.addSubscription(
          solace.SolclientFactory.createTopicDestination(topicName),
          topicName, // correlation key as topic name
          10000, // 10 seconds timeout for this operation
        );
      } catch (error) {
        productConsumer.log(error.toString());
      }
    };

    // Define message subscriber event listeners
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.UP,
      function () {
        if (productConsumer.subscribed) {
          productConsumer.log(
            'Already subscribed to "' +
              topicName +
              '" and ready to receive messages.',
          );
        } /*  else {
          productConsumer.messageSubscriber.subscribeTo('sample-ecommerce/products/>');
        } */

        productConsumer.consuming = true;
        productConsumer.log('=== Ready to receive messages. ===');
      },
    );
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
      function () {
        productConsumer.consuming = false;
        productConsumer.log(
          '=== Error: the message subscriber could not bind to queue "' +
            queueName +
            '" ===\n   Ensure this queue exists on the message router vpn',
        );
        productConsumer.exit();
      },
    );
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN,
      function () {
        productConsumer.consuming = false;
        productConsumer.log('=== The message subscriber is now down ===');
      },
    );
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN_ERROR,
      function () {
        productConsumer.consuming = false;
        productConsumer.log(
          '=== An error happened, the message subscriber is down ===',
        );
      },
    );
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_ERROR,
      function (sessionEvent) {
        productConsumer.log('Cannot subscribe to topic ' + sessionEvent.reason);
      },
    );
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_OK,
      function (sessionEvent) {
        if (productConsumer.subscribed) {
          productConsumer.subscribed = false;
          productConsumer.log(
            'Successfully unsubscribed from topic: ' +
              sessionEvent.correlationKey,
          );
        } else {
          productConsumer.subscribed = true;
          productConsumer.log(
            'Successfully subscribed to topic: ' + sessionEvent.correlationKey,
          );
          productConsumer.log('=== Ready to receive messages. ===');
        }
      },
    );
    // Define message received event listener
    productConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.MESSAGE,
      function (message) {
        productConsumer.log(
          'Received message: "' +
            message.getBinaryAttachment() +
            '",' +
            ' details:\n' +
            message.dump(),
        );
        // Need to explicitly ack otherwise it will not be deleted from the message router
        message.acknowledge();
      },
    );

    // Connect the message subscriber
    productConsumer.exec(function () {
      productConsumer.messageSubscriber.connect();
    });
  } catch (error) {
    productConsumer.log(error.toString());
  }
}

const onMessage = function (callback) {
  productConsumer.messageSubscriber.on(
    solace.MessageConsumerEventName.MESSAGE,
    callback,
  );
};

// Because the solace client is old, it doesnt have promises/async things, so we can't really wait for it.
// That's why we can't dynamically connect upon needing to send a message. There's a way to wait for it with
// on(connect) or once(connect), but it's kinda unreliable because if two requests are trying to send a message
// at the same time, we'd connect twice... which is not what we want.

// Start this immediately (upon app run)
createSubscriber();
productConsumer.run();

module.exports = {
  ...productConsumer,
  queueName,
  topicName,
  onMessage,
};
