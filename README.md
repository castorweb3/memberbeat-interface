# Memberbeat Interface

The `memberbeat-interface` project is a two-part application consisting of an Express.js backend and a React frontend. This project is designed to provide a seamless interface for interacting with the Memberbeat subscription management system.

## Project Structure

- **Backend**: Built with Express.js, the backend handles API requests and communicates with the mongodb database.
- **Frontend**: Built with React, the frontend provides a user-friendly interface for managing subscriptions and interacting with the Memberbeat smart contracts utilizing "castorweb3/memberbeat-sdk-js" library.

## Features

- User Authentication and Authorization
- Subscription Management
- Real-time Updates and Notifications
- Integration with Memberbeat Smart Contracts

## Installation

### General Setup

1. Install dependencies:
    ```bash
    npm install
    ```

2. Create a `.env` file based on the `.env.example`:
    ```bash
    cp .env.example .env
    ```

3. Set up the environment variables in the `.env` file.

    ```
    MONGO_URI=... # set the Mongo DB URI here
    PORT=5000 # set the backend port
    ```

### Frontend Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file based on the `.env.example`:
    ```bash
    cp .env.example .env
    ```

4. Set up the environment variables in the `.env` file.

    ```
    REACT_APP_MEMBERBEAT_CONTRACT_ADDRESS=... # set the Memberbeat smart contract address
    ```

## Usage

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2. Start the backend server:
    ```bash
    npm run dev
    ```
3. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

4. Start the frontend server:
    ```bash
    npm run dev
    ```

Once both the backend and frontend servers are running, you can access the application through the frontend interface. The frontend will communicate with the backend to manage subscriptions and interact with the Memberbeat smart contracts.

## Contributing

We welcome contributions to the Memberbeat Interface project. If you have any issues, bug reports, or feature requests, please open an issue on GitHub or submit a pull request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
