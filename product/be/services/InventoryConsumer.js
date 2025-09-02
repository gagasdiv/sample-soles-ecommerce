const { solace, createSolaceSession } = require('../integrations/solaceClient');

const inventoryConsumer = createSolaceSession('InventoryConsumer');

const queueName = 'q.sample-ecommerce.product';
const topicName = 'sample-ecommerce/inventory/stock-updated/>';

inventoryConsumer.consuming = false;
inventoryConsumer.subscribed = false;

function createSubscriber() {
  inventoryConsumer.log('Starting subscriber for queue: ' + queueName);
  try {
    // Create a message subscriber
    inventoryConsumer.messageSubscriber =
      inventoryConsumer.session.createMessageConsumer({
        // solace.MessageConsumerProperties
        queueDescriptor: { name: queueName, type: solace.QueueType.QUEUE },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT, // Enabling Client ack
        createIfMissing: true, // Create queue if not exists
      });

    inventoryConsumer.messageSubscriber.subscribeTo = function (topicName) {
      inventoryConsumer.log('Subscribing to topic: ' + topicName);
      try {
        inventoryConsumer.messageSubscriber.addSubscription(
          solace.SolclientFactory.createTopicDestination(topicName),
          topicName, // correlation key as topic name
          10000, // 10 seconds timeout for this operation
        );
      } catch (error) {
        inventoryConsumer.log(error.toString());
      }
    };

    // Define message subscriber event listeners
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.UP,
      function () {
        if (inventoryConsumer.subscribed) {
          inventoryConsumer.log(
            'Already subscribed to "' +
              topicName +
              '" and ready to receive messages.',
          );
        } else {
          inventoryConsumer.messageSubscriber.subscribeTo(topicName);
        }

        inventoryConsumer.consuming = true;
        inventoryConsumer.log('=== Ready to receive messages. ===');
      },
    );
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
      function () {
        inventoryConsumer.consuming = false;
        inventoryConsumer.log(
          '=== Error: the message subscriber could not bind to queue "' +
            queueName +
            '" ===\n   Ensure this queue exists on the message router vpn',
        );
        inventoryConsumer.exit();
      },
    );
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN,
      function () {
        inventoryConsumer.consuming = false;
        inventoryConsumer.log('=== The message subscriber is now down ===');
      },
    );
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.DOWN_ERROR,
      function () {
        inventoryConsumer.consuming = false;
        inventoryConsumer.log(
          '=== An error happened, the message subscriber is down ===',
        );
      },
    );
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_ERROR,
      function (sessionEvent) {
        inventoryConsumer.log(
          'Cannot subscribe to topic ' + sessionEvent.reason,
        );
      },
    );
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.SUBSCRIPTION_OK,
      function (sessionEvent) {
        if (inventoryConsumer.subscribed) {
          inventoryConsumer.subscribed = false;
          inventoryConsumer.log(
            'Successfully unsubscribed from topic: ' +
              sessionEvent.correlationKey,
          );
        } else {
          inventoryConsumer.subscribed = true;
          inventoryConsumer.log(
            'Successfully subscribed to topic: ' + sessionEvent.correlationKey,
          );
          inventoryConsumer.log('=== Ready to receive messages. ===');
        }
      },
    );
    // Define message received event listener
    inventoryConsumer.messageSubscriber.on(
      solace.MessageConsumerEventName.MESSAGE,
      function (message) {
        inventoryConsumer.log(
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
    inventoryConsumer.exec(function () {
      inventoryConsumer.messageSubscriber.connect();
    });
  } catch (error) {
    inventoryConsumer.log(error.toString());
  }
}

const onMessage = function (callback) {
  inventoryConsumer.messageSubscriber.on(
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
inventoryConsumer.run();

module.exports = {
  ...inventoryConsumer,
  queueName,
  topicName,
  onMessage,
};
