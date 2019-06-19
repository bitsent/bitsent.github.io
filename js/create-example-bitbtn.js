btn = bitbtn.create(
    document.getElementById("bitbtn-container"),
    {
        label: "Pay!",
        address: "1CiesvEUNg9sVm8ekhMrGyATvEnH5YU9wh",
        amount: 1.99,
        currency: "USD",
        onError: function (error) { console.log(error); },
    });