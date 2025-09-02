const { solace, createSolaceSession } = require('../integrations/solaceClient');

const orderConsumer = createSolaceSession('OrderConsumer');

const queueName = 'q.sample-ecommerce.inventory.orders';
const topicNames = [
  'sample-ecommerce/orders/created',
  'sample-ecommerce/orders/created/>',
];

orderConsumer.consuming = false;
orderConsumer.subscribed = false;

function createSubscriber() {
  orderConsumer.log('Starting subscriber for queue: ' + queueName);
  try {
    // Create a message subscriber
    orderConsumer.messageSubscriber =
      orderConsumer.session.createMessageConsumer({
        // solace.MessageConsumerProperties
        queueDescriptor: { name: queueName, type: solace.QueueType.QUEUE },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT, // Enabling Client ack
        createIfMissing: true, // Create queue if not exists
      });

    orderConsumer.messageSubscriber.subscribeTo = function (topicName) {
      orderConsumer.log('Subscribing to topic: ' + topicName);
      try {
        orderConsumer.messageSubscriber.addSubscription(
          solace.SolclientFactory.createTopicDestination(topicName),
          topicName, // correlation key as topic name
          10000, // 10 seconds timeout for this operation
        );
      } catch (error) {
        orderConsumer.log(error.toString());
      }
    };

    // Define message subscriber event listeners
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.UP,
      function () {
        if (orderConsumer.subscribed) {
          orderConsumer.log(
            'Already subscribed to "' +
              topicNames +
              '" and ready to receive messages.',
          );
        } else {
          // Should already be set in admin (so we're not dynamically subscribing)
          console.log('Subscribing to topics:', topicNames.join(','));
          topicNames.map(t => orderConsumer.messageSubscriber.subscribeTo(t));
        }

        orderConsumer.consuming = true;
        orderConsumer.log('=== Ready to receive messages. ===');
      },
    );
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
      function () {
        orderConsumer.consuming = false;
        orderConsumer.log(
          '=== Error: the message subscriber could not bind to queue "' +
            queueName +
            '" ===\n   Ensure this queue exists on the message router vpn',
        );
        orderConsumer.exit();
      },
    );
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN,
      function () {
        orderConsumer.consuming = false;
        orderConsumer.log('=== The message subscriber is now down ===');
      },
    );
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN_ERROR,
      function () {
        orderConsumer.consuming = false;
        orderConsumer.log(
          '=== An error happened, the message subscriber is down ===',
        );
      },
    );
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_ERROR,
      function (sessionEvent) {
        orderConsumer.log('Cannot subscribe to topic ' + sessionEvent.reason);
      },
    );
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_OK,
      function (sessionEvent) {
        orderConsumer.subscribed = true;
        orderConsumer.log(
          'Successfully subscribed to topic: ' + sessionEvent.correlationKey,
        );
        // orderConsumer.log('=== Ready to receive messages. ===');
      },
    );
    // Define message received event listener
    orderConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.MESSAGE,
      function (message) {
        orderConsumer.log(
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
    orderConsumer.exec(function () {
      orderConsumer.messageSubscriber.connect();
    });
  } catch (error) {
    orderConsumer.log(error.toString());
  }
}

const onMessage = function (callback) {
  orderConsumer.messageSubscriber.on(
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
orderConsumer.run();

module.exports = {
  ...orderConsumer,
  queueName,
  topicName: topicNames,
  onMessage,
};
