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
  SendTon: async function (args) {
    var returnStr = await plugin.sendTon(UTF8ToString(args));
    var bufferSize = lengthBytesUTF8(returnStr) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(returnStr, buffer, bufferSize);
    return buffer;
  },
});
