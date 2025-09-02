# Sample E-Commerce Project using Express.js Solace

This project will dynamically make the queues, so it requires a Solace user that is `allowed to make endpoints`.

## Services in this project:

- Product Commerce Service `/product`
  
  This is the frontend `/product/fe` and backend `/product/be` of the e-commerce that gets accessed from the web.

  The backend of this service accesses the Order Service.

- Order Service `/order`
  
  This is the backend service which handles orders coming in.

- Inventory Service `/inventory`
  
  This service handles changes in the inventory stock.
  
  For simplicity of this scenario, this service also simulates `payment` and `delivery` events.

Each service contains code for publisher and subscriber services.

## Postgres Database
This project requires **one Postgres database**. Please set it up.

The project uses the **Sequelize** library to migrate tables, so you don't need to make the tables yourself.

Seeders are also automatically run, it will populate products and its stocks.

Bit of history: it used to use local **Sqlite** to quickly spin up its own database, but then it couldn't share data, so a proper dbms was needed.

## Scripts/tools

- Order Simulator tool `/order-simulator`
  
  This is a CLI tool for simulating concurrent orders arriving together.

  Orders are indexed (e.g 1 to 10), sequential using a loop, but the order of sending/arriving is **not guaranteed**, so there can be some inherent (not artificial) randomness involved depending on the internal processing of async functions by Node.js. For example: Order 3 can be sent before Order 1, but then the request arriving first on the destination is Order 8?? Something like that.

  The randomness is a quirk from using `Promise.all([...])`, where it does not guarantee the order of processing the async functions in the array, i.e the first array element (`index [0]`) _may not_ be the first one processed.


## Initialization:
- inventory
- order
- product
  - fe
  - be

Please setup in each above directory:
- `npm install`
- Set up `.env` from `.env.example`

## Running
To run a service/tool, go to the directory and run:
```bash
npm run dev
# or
npm run start
```

Especially for **Product Service**, since it's a backend-frontend pair, you can just go to `/product` (where it contains `fe` and `be`) and run:
```bash
# Prep directory
cd ./product
npm install

# Both services (fe be) will be run together using the `concurrently` library
npm run dev
```
