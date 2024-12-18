# Cat Battle Ton SDK

## Features

- Support connect your app to injected wallet (e.g Metamask)
- Support purchase item on cat-battle shop

## Technique

- @wagmi/core: VanillaJS library for Ethereum.

# Getting Started

## Install with CDN

- Add the script to your HTML file:

```html
<script src="https://unpkg.com/@cuonghx.ngen/cat-battle-evm-sdk@latest"></script>
```

- ℹ️ If you don't want auto-update the library, pass concrete version instead of latest, e.g.

<script src="https://unpkg.com/@cuonghx.ngen/cat-battle-evm-sdk@1.0.0"></script>

- Add `load-sdk.js` scripts

```html
<script src="./load-sdk.js"></script>
```

- Prepare `load-sdk.js` file

```js
const plugin = new CatBattleEvmSdk.default({
  shopAddress: "CAT_BATTLE_SHOP_ADDRESS", // should support same address all chains (create2)
});
```

## Install with npm

```shell
npm i @cuonghx.ngen/cat-battle-evm-sdk
```

# Usage

- Using with Unity throw `jslib` plugin

```jslib
mergeInto(LibraryManager.library, {
  Connect: function () {
    plugin.connect();
  },
  Disconnect: function () {
    plugin.disconnect();
  },
  IsConnected: function () {
    return plugin.isConnected();
  },
  GetAccount: function () {
    var returnStr = plugin.getAccount();
    var bufferSize = lengthBytesUTF8(returnStr) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(returnStr, buffer, bufferSize);
    return buffer;
  },
  PurchaseItem: async function (args) {
    var returnStr = await plugin.purchaseItem(UTF8ToString(args));
    var bufferSize = lengthBytesUTF8(returnStr) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(returnStr, buffer, bufferSize);
    return buffer;
  },
});
```

| Function              | Description                           |
| --------------------- | ------------------------------------- |
| plugin.connect()      | Connect your app to web3 wallets      |
| plugin.disconnect()   | Disconnect your app from web3 wallets |
| plugin.isConnected()  | Return connected status               |
| plugin.getAccount()   | Return account connected address      |
| plugin.switchChain()  | Switch to supported chain             |
| plugin.purchaseItem() | Purchase item on cat-battle shop      |
| plugin.getBalance()   | Get balance of connected address      |

## Examples

- GetAccount

```js
plugin.getAccount();
{
  account: "UQAbB+ykyJKBtL17EUxDOyL2H55aakn05uDVW06aH0wJNLJB";
  chain: "BSC-TESTNET"; // bsc-testnet or unknown
}
```

- GetBalance

```js
plugin.getBalance();
{
  balance:"240402714075310000",
  formatter:"0.24040271407531"
}
```

- Purchase Item
  - ℹ️ Switch correct chain before purchasing

```js
plugin.switchChain();
```

```js
plugin.purchaseItem(
  JSON.stringify({
    id: <CAT_BATTLE_ITEM_ID>,
    buyerId: <CAT_BATTLE_BUYER_ID>,
    value: <CAT_BATTLE_ITEM_PRICE>,
  })
);
```

- Complete example via [Examples](./examples/)

## Authors and acknowledgment

Cat Battle Team

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Project status

We are still developing this project following the roadmap in here: https://catb.io/
