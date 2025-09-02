const { solace, createSolaceSession } = require('../integrations/solaceClient');

const orderStatusConsumer = createSolaceSession('OrderStatusConsumer');

const queueName = 'q.sample-ecommerce.order.status';
const topicNames = [
  'sample-ecommerce/inventory/checked',
  'sample-ecommerce/inventory/checked/>',
  'sample-ecommerce/inventory/rejected',
  'sample-ecommerce/inventory/rejected/>',
  'sample-ecommerce/payment/processed',
  'sample-ecommerce/payment/processed/>',
  'sample-ecommerce/payment/failed',
  'sample-ecommerce/payment/failed/>',
  'sample-ecommerce/shipping/started',
  'sample-ecommerce/shipping/started/>',
  'sample-ecommerce/shipping/arrived',
  'sample-ecommerce/shipping/arrived/>',
];

orderStatusConsumer.consuming = false;
orderStatusConsumer.subscribed = false;

function createSubscriber() {
  orderStatusConsumer.log('Starting subscriber for queue: ' + queueName);
  try {
    // Create a message subscriber
    orderStatusConsumer.messageSubscriber =
      orderStatusConsumer.session.createMessageConsumer({
        // solace.MessageConsumerProperties
        queueDescriptor: { name: queueName, type: solace.QueueType.QUEUE },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT, // Enabling Client ack
        createIfMissing: true, // Create queue if not exists
      });

    orderStatusConsumer.messageSubscriber.subscribeTo = function (topicName) {
      orderStatusConsumer.log('Subscribing to topic: ' + topicName);
      try {
        orderStatusConsumer.messageSubscriber.addSubscription(
          solace.SolclientFactory.createTopicDestination(topicName),
          topicName, // correlation key as topic name
          10000, // 10 seconds timeout for this operation
        );
      } catch (error) {
        orderStatusConsumer.log(error.toString());
      }
    };

    // Define message subscriber event listeners
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.UP,
      function () {
        if (orderStatusConsumer.subscribed) {
          orderStatusConsumer.log(
            'Already subscribed to "' +
              topicNames +
              '" and ready to receive messages.',
          );
        } else {
          // Should already be set in admin (so we're not dynamically subscribing)
          console.log('Subscribing to topics:', topicNames.join(','));
          topicNames.map(t =>
            orderStatusConsumer.messageSubscriber.subscribeTo(t),
          );
        }

        orderStatusConsumer.consuming = true;
        orderStatusConsumer.log('=== Ready to receive messages. ===');
      },
    );
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
      function () {
        orderStatusConsumer.consuming = false;
        orderStatusConsumer.log(
          '=== Error: the message subscriber could not bind to queue "' +
            queueName +
            '" ===\n   Ensure this queue exists on the message router vpn',
        );
        orderStatusConsumer.exit();
      },
    );
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN,
      function () {
        orderStatusConsumer.consuming = false;
        orderStatusConsumer.log('=== The message subscriber is now down ===');
      },
    );
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN_ERROR,
      function () {
        orderStatusConsumer.consuming = false;
        orderStatusConsumer.log(
          '=== An error happened, the message subscriber is down ===',
        );
      },
    );
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_ERROR,
      function (sessionEvent) {
        orderStatusConsumer.log(
          'Cannot subscribe to topic ' + sessionEvent.reason,
        );
      },
    );
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_OK,
      function (sessionEvent) {
        orderStatusConsumer.subscribed = true;
        orderStatusConsumer.log(
          'Successfully subscribed to topic: ' + sessionEvent.correlationKey,
        );
        // orderStatusConsumer.log('=== Ready to receive messages. ===');
      },
    );
    // Define message received event listener
    orderStatusConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.MESSAGE,
      function (message) {
        orderStatusConsumer.log(
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
    orderStatusConsumer.exec(function () {
      orderStatusConsumer.messageSubscriber.connect();
    });
  } catch (error) {
    orderStatusConsumer.log(error.toString());
  }
}

const onMessage = function (callback) {
  orderStatusConsumer.messageSubscriber.on(
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
orderStatusConsumer.run();

module.exports = {
  ...orderStatusConsumer,
  queueName,
  topicName: topicNames,
  onMessage,
};
