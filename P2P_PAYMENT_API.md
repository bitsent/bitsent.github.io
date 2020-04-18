---
layout: page
title: "P2P Payment API"
permalink: /p2pPaymentApi.html
subtitle: "Peer To Peer Payments made easy"
---

# Simplified Payment API

## A simple and lighweight NodeJS Express API, for BIP-0270 payments and for resolving BSV PayMail handles.
It is technically a PayMail server too, but it only manages 1 single paymail.

## Git
[https://github.com/bitsent/simplified-payment-api/](https://github.com/bitsent/simplified-payment-api/)

## Api Endpoints

- **GET /paymail/{paymail}**
    - Returns an output script for sending to the specidied paymail.

- **GET /payment/address/{addr}/{amount}**
    - Returns a bip270 payment request object, for sending the specified amount to the specified bitcoin address.

- **GET /payment/paymail/{paymail}/{amount}**
    - Returns a bip270 payment request object, for sending the specified amount to the specified paymail.

- **POST /payment/pay**
    - Endpoint for receiving payment messages.

## IFRAME of [https://api.bitsent.net/](https://api.bitsent.net/)

<div>
    <style>
        #apiIframe{
            width:100%;
            height: 70vh;
        }
    </style>
    <iframe src="https://api.bitsent.net/" id="apiIframe" ></iframe>
</div>