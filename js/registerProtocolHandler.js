try {
    navigator.registerProtocolHandler(
      "bitcoin-req",
      "https://bitsent.net/bip275.html?req=%s",
      "BitSent"
    );
  } catch (error) {
    console.log("'bitcoin-req' is not a whitelisted URI scheme", error);
  }

  try {
    navigator.registerProtocolHandler(
      "bitcoin",
      "https://bitsent.net/bitcoin-uri.html?req=%s",
      "BitSent"
    );
  } catch (error) {
    console.error(error);
  }
    