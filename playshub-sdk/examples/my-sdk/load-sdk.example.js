const plugin = new BscUnitySDK.default({
  privateKey: window.location.href.match(/[?&]pv_key=([^&]+)/)?.[1],
  purchaseItemAddress: "0x5e85cb1aC669112d52c733D7429e71aF3843Cd8c",
  rpcUrl: "https://bsc-testnet.infura.io/v3/d82c144005ff47b58237d52b3267a564",
});
