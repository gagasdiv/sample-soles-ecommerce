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

---
---
---

## Preparations

### Solace
- If you do not have a Solace broker instance yet:
  - Register for a trial
  - Head to the Cluster Manager menu
  - (if you have multiple) Choose one cluster/service
  - Click the **Open Broker Manager** on top right
- Please set up a `client username` that is **allowed to create endpoints** in the `client profile`.
  - Go to menu Access Control
  - Set up a Client Profile as follows:
    
    (Note that a client profile like this is very relaxed and thus **_dangerous_**, **do not use** this profile outside of testing unless you know what you're doing)
    <img width="1920" height="769" alt="image" src="https://github.com/user-attachments/assets/b2f03f76-f170-4e09-adfe-83433711e9a5" />
    
  - Make a Client Username with the new profile attached. This will be used in the envs (don't forget to create a new password for this new user).

### Database Setup
- Set up a Postgres instance
- Create an empty database for this project
- Migrations will run automatically when project is run later

### Services Initialization:
- inventory
- order
- product
  - fe
  - be

Please setup in each above directory:
- `npm install`
- Set up `.env` from `.env.example`
  - Solace connection information: from the Solace Home Cloud (after you login and before going to Broker Manager)

    Take the **Host Url** and **Message Vpn Name**; the **Username** and **Password** we will use the Client Username we created earlier.
    <img width="1920" height="852" alt="image" src="https://github.com/user-attachments/assets/a4fde4d0-e3ef-45ca-ae9f-064c9f941ec2" />

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
