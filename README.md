# Vesting-Project

This is the first project in Solidity-Advanced, in this project I created a simple vesting application. This implements a vesting mechanism that gradually disburses tokens to stakeholders within a defined timeframe. It empowers organizations to establish stakeholders, define vesting durations, and authorize specific addresses for token retrievals.

## Getting Started

### Requirement

MetaMask

### Executing program

Download the codes by downloading the entire repository which will give you access to other contencts of the repository.In the project directory,  run:

```shell

 yarn install

```

After installing the dependences, setup your wallet private key in an `.env` file, then run:

```shell
yarn hardhat run scripts/deploy.js --network polygon_mumbai
```

Start the project by runnning the following command:

```shell
npm run dev
```

This runs the app frontend in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Author

[Benjamin Faruna](https://github.com/BenFaruna/)

## License

This project is licensed under the [MIT License](LICENSE).
