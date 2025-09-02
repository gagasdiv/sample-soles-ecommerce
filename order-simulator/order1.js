require('dotenv').config();
require('util').inspect.defaultOptions = {
  depth: 10, // Set default depth
  colors: true, // Enable colors for better readability
};

async function main() {
  const payloads = [];
  const requestFns = [];

  const apiUrl = `${process.env.ORDER_SERVICE_URL}/order`;
  console.log('Order Service url: ', apiUrl);

  // Prepare executor functions (code inside function is not executed yet --
  // so fetches dont run yet)
  for (let i = 0; i < 10; i++) {
    const data = {
      customerName: `cust-${i}`,
      items: [
        {
          productId: 3,
          quantity: 6,
        },
      ],
    };

    requestFns.push(async () =>
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(async res => {
          console.log(
            `SUCCESS: Order of ${data.customerName} sent.`,
            await res.text(),
          );
        })
        .catch(err => {
          console.error(`ERROR: Order of ${data.customerName} failed.`, err);
        }),
    );

    payloads.push(data);
  }

  console.log('--- Sending all at once... ---');

  // Execute all functions
  const promises = requestFns.map(fn => fn());

  await Promise.allSettled(promises);

  console.log('--- All sent ---');

  console.log('Sent payloads:', payloads);
}

main();
