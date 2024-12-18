import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PlayshubShopModule = buildModule("PlayshubShopModule", (m) => {
  // TODO: Hardhat Ignition module haven't support yet UUPS proxies. https://github.com/NomicFoundation/hardhat-ignition/issues/788
});

export default PlayshubShopModule;
