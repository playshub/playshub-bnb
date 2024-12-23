# Unity SDK

SDK for seamless integration with the BSC network (sending sol, purchasing item, get balance) in pure JavaScript, making it easy to embed within Unity. (JS, Unity)

## Features

- Interact with BSC wallet
- Purchasing item by sending BSC transactions

## Payment process

- The user sends a transaction with an attached memo containing userId and itemId.
- The indexer service polls via RPC to confirm the purchase.
- Upon successful confirmation, the indexer service notifies the game server to update the purchased resources.

## Technique

- viem: a JavaScript library that provides tools for interacting with the BSC blockchain
- webpack: a powerful JavaScript bundler that compiles and packages modules, assets, and dependencies into optimized bundles for use in Unity HTML5.

# Getting Started

## Install with CDN

- Add the script to your HTML file:

```html
<script src="https://unpkg.com/@cuonghx.ngen/bsc-unity-sdk@latest"></script>
```

- ℹ️ If you don't want auto-update the library, pass concrete version instead of latest, e.g.

```html
<script src="https://unpkg.com/@cuonghx.ngen/bsc-unity-sdk@0.0.1"></script>
```

- Add `load-sdk.js` scripts

```html
<script src="./load-sdk.js"></script>
```

- Prepare `load-sdk.js` file

```js
const plugin = new BscUnitySDK.default({
  privateKey: "xxx",
  purchaseItemAddress: "xxx",
});
```

## Install with npm

```shell
npm i @cuonghx.ngen/bsc-unity-sdk
```

# Usage

- Using with Unity throw `jslib` plugin

```jslib
mergeInto(LibraryManager.library, {
  GetPublicAddress: function () {
    var returnStr = plugin.getPublicAddress();
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
| plugin.getPublicKey() | Return account connected address      |
| plugin.purchaseItem() | Send transaction form purchasing item |
| plugin.getBalance()   | Get balance of connected address      |

## Examples

- Complete example via [Examples](./examples/)

## Authors and acknowledgment

Playshub Team

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Project status

We are still developing this project following the roadmap in here: https://playshub.io/
