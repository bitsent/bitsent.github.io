console.log("registerProtocolHandler - start");
navigator.registerProtocolHandler(
  "bitcoin-req",
  "https://bitsent.net/bip275.html?req=%s",
  "BitSent"
);
console.log("registerProtocolHandler - done");
