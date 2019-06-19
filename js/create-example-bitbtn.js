btn = bitbtn.create(
    document.getElementById("bitbtn-container"),
    {
        label: "Pay!",
        address: "1CiesvEUNg9sVm8ekhMrGyATvEnH5YU9wh",
        amount: 0.1111111111111111111111,
        currency: "USD",
        onError: function (error) { console.log(error); },
    });