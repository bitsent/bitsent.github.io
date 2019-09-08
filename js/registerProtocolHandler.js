console.log("registerProtocolHandler - start");
navigator.registerProtocolHandler(
  "bitcoin-req",
  "https://bitsent.net/bip275.html?data=%s",
  "BitSent BIP-275"
);
console.log("registerProtocolHandler - done");
