//// VARIABLES

uploadedFiles = [];

BASE_URL = "https://bitsent.net/link.html";

TAKE_AUTHOR_FEE = true;
AUTHOR_FEE = "0.03";
AUTHOR_ID = "1471";

SIMULATE_MB_PRESSED = false;

SIZE_LIMIT = 99000;

//// CRYPTO

function generateSecurePassword(length) {
    var array = window.crypto.getRandomValues(new Uint8Array(length));
    return arrayToBase64(array);
}

function arrayToString(array) {
    return String.fromCharCode.apply(String.fromCharCode, array);
}

function arrayToBase64(array) {
    return window.btoa(arrayToString(array));
}

function stringToBase64(str) {
    return arrayToBase64(stringToArray(str));
}

function base64ToArray(base64) {
    return stringToArray(window.atob(base64));
}

function stringToArray(str) {
    uint = new Uint8Array(str.length);
    for (var i = 0, j = str.length; i < j; ++i) {
        uint[i] = str.charCodeAt(i);
    }
    return uint;
}

function getSaltedKey(passwordKey, salt, keyUsages) {
    return window.crypto.subtle.deriveKey({
        "name": "PBKDF2",
        "salt": salt,
        "iterations": 250000,
        "hash": {
            "name": "SHA-256"
        }
    }, passwordKey, {
            "name": "AES-GCM",
            "length": 256
        }, false, keyUsages);
}

async function encryptData(data, password, callback) {
    var dataAsBytes = stringToArray(data);
    var passAsBytes = stringToArray(password);
    var passwordKey = await crypto.subtle.importKey("raw", passAsBytes, "PBKDF2", false, ["deriveKey"])

    const salt = window.crypto.getRandomValues(new Uint8Array(32));
    var salt64 = arrayToBase64(salt);
    var saltedPasswordKey = await getSaltedKey(passwordKey, salt, ["encrypt"]);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    var iv64 = arrayToBase64(iv);
    var encryptedContent = await window.crypto.subtle.encrypt({
        "name": "AES-GCM",
        "iv": iv
    }, saltedPasswordKey, dataAsBytes);
        
    const encryptedContent64 = arrayToBase64(new Uint8Array(encryptedContent));
    var password64 = arrayToBase64(passAsBytes)
    callback(encryptedContent64, password64, salt64, iv64);
}

async function decryptData(encryptedData, password, salt, iv, callback) {
    password = base64ToArray(password);
    salt = base64ToArray(salt);
    iv = base64ToArray(iv);
    dataAsBytes = base64ToArray(encryptedData);

    try{
        passwordKey = await crypto.subtle.importKey("raw", password, "PBKDF2", false, ["deriveKey"]);
        passwordKey = await getSaltedKey(passwordKey, salt, ["decrypt"])
        encryptedContent = await window.crypto.subtle.decrypt({
            "name": "AES-GCM",
            "iv": iv
        }, passwordKey, dataAsBytes);
    
        const asString = arrayToBase64(new Uint8Array(encryptedContent));
        callback(asString);
    }catch(error){ alert(error); }

}

//// MAIN FUNCTIONALITY

function onDownloadBtnClick() {
    var txid = document.getElementById("txid").value;
    var pwd = document.getElementById("pwd").value;
    var fname = document.getElementById("fname").value;

    if (txid) {
        var data = downloadOpReturnOfTx(txid, data =>{
            fname = fname || data.n || generateFileName();

            if (!pwd) {
                if (data.mt == "application/encrypted-binary"){
                    alert("This is an encrypted file.\nPlease enter your password.");
                    return
                }
                downloadBinaryFile(fname, data.c, data.mt, "base64");
            }
            else {
                if (data.mt != "application/encrypted-binary"){
                    alert("File not encrypted.\nIgnoring password.");
                    downloadBinaryFile(fname, data.c, data.mt, data.f);
                    return;
                }
                decryptAndDownload(fname, data, pwd)
            }
        });
    }
}

function generateFileName(){
    return "bitsent-file-" + toFormattedString(new Date()) + ".data";
}

function onChooseFiles(files) {
    if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");

    files = filterFilesBySize(files, SIZE_LIMIT);

    clearUploadButton();
    readMultipleFiles(files, function (doneFiles, fileErrors) {
        if (fileErrors.some(i => i))
            throw fileErrors;
        addEncryptedTexts(doneFiles, function () {
            if (doneFiles.some(i => i))
                uploadedFiles = uploadedFiles.concat(doneFiles);
            generateUploadButtons();
            generateFileDataTable();
        });
    })
}

function filterFilesBySize(files, maxSize) {
    var results = []
    var filtered = []
    for (var i = 0; i < files.length; i++)
        if (files[i].size <= maxSize)
            results.push(files[i]);
        else
            filtered.push(files[i]);

    var flen = filtered.length
    if(flen > 0){
        var fileNames = filtered.map(i=>i.name).join('\n');

        var message = "Some files were too big."
            + "\nMaximum Size = " + maxSize + "B"
            + "\n" + flen + " file(s) skipped"
            + "\n--------------"
            + "\n" + fileNames;

        alert(message);
    }

    return results;
}

function addEncryptedTexts(files, callback) {
    function addEncryptedText(i) {
        if (i >= files.length) {
            callback();
            return;
        }
        fileItem = files[i]
        encryptData(fileItem.text, generateSecurePassword(16),
            function (encryptedText, password, salt, iv) {
                fileItem.encryptedText = encryptedText;
                fileItem.pwd = password + '.' + salt + '.' + iv;
                addEncryptedText(i + 1);
            });
    }
    addEncryptedText(0);
}

function readMultipleFiles(files, callbackWhenDone) {
    var reader = new FileReader();
    fileErrors = []
    doneFiles = []
    function readFile(i) {
        if (i >= files.length) {
            callbackWhenDone(doneFiles, fileErrors);
            return;
        }
        var file = files[i];
        reader.onload = function (e) {
            doneFiles.push({
                file: file,
                text: e.target.result
            });
            readFile(i + 1);
        }
        reader.onerror = function (e) {
            fileErrors.push({
                file: file,
                error: e
            });
            readFile(i + 1);
        }
        reader.readAsBinaryString(file, "utf-8");
    }
    readFile(0);
}

function clearUploadButton() {
    var div = document.getElementById("uploadButtonContainer");
    div.innerHTML = "";
    msg = document.createElement("p");
    msg.append("Loading...");
    msg.classList.add("message");
    div.appendChild(msg);
}
String.prototype.hexEncode = function () {
    var hex, i;
    var result = "";
    for (i = 0; i < this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("0" + hex).slice(-2);
    }
    return result
}
String.prototype.hexDecode = function () {
    var j;
    var hexes = this.match(/.{1,2}/g) || [];
    var back = "";
    for (j = 0; j < hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }
    return back;
}

function reloadMB() {
    clearUploadButton();
    generateUploadButtons();
}

function generateUploadButtons() {
    
    var div = document.getElementById("uploadButtonContainer");
    div.innerHTML = "";
    var doEncrypt = document.getElementById("encryptCheckbox").checked;

    function generateButton(file, doEncrypt, divChild){
        
        // B:// Protocol:
        //
        // OP_RETURN
        //   19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut
        //   [Data]
        //   application/encrypted-binary
        //   base64
        //   [(optional) Name]

        if (doEncrypt)
            script = [
                'OP_RETURN',
                "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut".hexEncode(),
                file.encryptedText.hexEncode(),
                "application/encrypted-binary".hexEncode(),
                "base64".hexEncode()
            ]
        else
            script = [
                'OP_RETURN',
                "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut".hexEncode(),
                file.text.hexEncode(),
                (file.file.type || "application/binary").hexEncode(),
                "base64".hexEncode(),
                file.file.name.hexEncode()
            ]

        function onPayment(payment) {
            divChild.innerHTML = '';

            var url = [ BASE_URL,
                '#fname=', file.file.name,
                '&txid=', payment.txid,
                (doEncrypt? '&pwd='+ file.pwd: ''),
                
            ].join('')

            var input = document.createElement('input');
            input.type = 'text';
            input.value = url;
            input.onchange = function(){input.value = url;}

            var copyBtn = document.createElement('button');
            copyBtn.innerHTML = "Copy"
            copyBtn.onclick = function(){
                input.select();
                document.execCommand("copy");
                copyBtn.innerHTML = "Done";
                copyBtn.style = "background-color:limegreen; border-radius:1em;"
                setTimeout(function(){
                    copyBtn.innerHTML = "Copy";
                    copyBtn.style = ""
                }, 500);
            }

            var openBtn = document.createElement('button');
            openBtn.innerHTML = "Open"
            openBtn.onclick = function(){
                var win = window.open(url, '_blank');
                win.focus()
            }

            divChild.appendChild(input);
            divChild.appendChild(copyBtn);
            divChild.appendChild(openBtn);
            divChild.appendChild(textContainer);
            document.getElementById("uploadedFiles").appendChild(divChild);
        }

        function onError(payment) {
            console.log(`An error has occurred: ${error}`);
        }
        
        var btnContainer = document.createElement("div");
        divChild.appendChild(btnContainer);

        if (SIMULATE_MB_PRESSED){
            function testClick(){
                if (doEncrypt) {
                    file.pwd = "MHZjYXJkR1QweXZNVEFIcXFocVpIUT09.2A9LXJmVaznZeF3pX4JfeIsEIMjnIH9nOUjoN7fKsII=.WHChRYdFcA6AiAjQ";
                    onPayment({txid:"59c960097737fb3937398e92a17c8ae27c5df56f64a12309847400f9c7026135"});
                }
                else {
                    onPayment({txid:"46d644282c3f8c80a6228ec00c9871bffe0b00c4894922ca302738a41f4012d3"});
                }
            }

            simBtn = document.createElement('button');
            simBtn.onclick = testClick;
            simBtn.append("Tests")
            btnContainer.appendChild(simBtn);
        }

        var outputs = [
            {
                type: 'SCRIPT',
                script: script.join(' '),
                amount: "0.00",
                currency: "USD",
            },
            {
                type: 'USER',
                userId: AUTHOR_ID,
                amount: AUTHOR_FEE,
                currency: "USD",
            },
        ]
        outputs = (TAKE_AUTHOR_FEE? outputs : [outputs[0]]);

        moneyButton.render(btnContainer, {
            outputs: outputs,
            onPayment: onPayment,
            onError: onError
        }) 
    }

    for (var i in uploadedFiles) {
        var file = uploadedFiles[i];

        var divChild = document.createElement('div');
        divChild.classList.add('mb')

        var textContainer = document.createElement('div');
        textContainer.style = "width:70%; overflow:hidden;"
        textContainer.innerHTML =
            ("<div>" + file.file.name + "</div>") +
            ("<div>" + parseInt(file.file.size / 1000) + " KB</div>");
        
        div.appendChild(divChild);
        divChild.appendChild(textContainer);
        generateButton(file, doEncrypt, divChild);
    }
}

function decryptAndDownload(filename, data, pwd) {
    pwd = pwd.split(".");
    if (pwd.length < 3)
        return alert("Invalid Password:\n" + pwd.join("\n"))
    encryptText = data.bc;
    decryptData(encryptText, pwd[0], pwd[1], pwd[2],
        function callback(text) {
            downloadBinaryFile(filename, text, data.md, data.f);
        });
}

function generateFileDataTable() {
    var div = document.getElementById("uploadTableContainer");
    div.innerHTML = ""
    div.appendChild(
        generateTableFromDictionary({
            "Count": uploadedFiles.length
        }, "File(s) Selected"));
}

function parseHashQuery() {
    var search = window.location.hash;
    params = []
    if (search !== undefined) {
        search = search.substring(1) // remove the "#"
        var params = search.split('&');
    }
    paramsDict = {};
    for (var i in params) {
        p = params[i].indexOf('=');
        key = params[i].substring(0, p);
        val = params[i].substring(p + 1)
        paramsDict[key] = val;
    }
    return paramsDict;
}

function generateTableFromDictionary(paramsDict, title) {
    var table = document.createElement('table');
    var columnHeadings = ["", title]
    var header = table.createTHead();
    var row = header.insertRow(-1);
    for (var i = 0; i < columnHeadings.length; i++) {
        var headerCell = document.createElement('th');
        headerCell.innerText = columnHeadings[i].toUpperCase();
        row.appendChild(headerCell);
    }
    var tBody = document.createElement('tbody');
    table.appendChild(tBody);
    for (var i in paramsDict) { // each row
        var row = tBody.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerText = i;
        var cell = row.insertCell(-1);
        cell.innerText = paramsDict[i];
    }
    return table;
}

function downloadBinaryFile(filename, text, mimeType, format) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:'
        + (mimeType || 'application/binary')
        + ';'
        + (format || 'binary')
        + ','
        + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

async function downloadOpReturnOfTx(tx, callback) {
    q = { "v": 3, "q": { "find": { "tx.h": tx }, "limit": 1 } }

    var b64 = btoa(JSON.stringify(q));
    var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/" + b64;

    var header = { headers: { key: "1KJPjd3p8khnWZTkjhDYnywLB2yE1w5BmU" } };

    var r = await fetch(url, header)
    var rJson = await r.json();
    var tx = rJson.c[0] || rJson.u[0];
    var result =  {
        "p": tx.out[0].s1,
        "c": tx.out[0].lb2 || tx.out[0].b2,
        "bc": tx.out[0].ls2 || tx.out[0].s2,
        "mt": tx.out[0].s3,
        "f": tx.out[0].s4,
        "n": tx.out[0].s5
    };
    callback(result)
}

function toFormattedString(date) {
    var MM = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    return [
        date.getFullYear(),
        (MM > 9 ? '' : '0') + MM,
        (dd > 9 ? '' : '0') + dd,
        "_",
        (hh > 9 ? '' : '0') + hh,
        (mm > 9 ? '' : '0') + mm
    ].join('');
}

//// AUTO RUN

if (crypto == undefined || crypto.subtle == undefined){
    alert("The WebCrypto API is not avalable."
        + "\nPossible reasons:"
        + "\n"
        + "\n - Not using HTTP over SSL?"
        + "\n       (Check the website address - it must start with 'https://')"
        + "\n"
        + "\n - Unsupported browser?"
        + "\n       (Not all browsers support WebCrypto API. We reccomend Firefox or Chrome.)"
        + "\n"
        + "\n - Old browser version?"
        + "\n       (Consider updating your browser. Newer versions might support WebCrypto API)"
        + "\n");
}
else {
    var paramsDict = parseHashQuery()
    if (Object.keys(paramsDict).some(i => i)) {
        document.getElementById("txid").value = paramsDict.txid || "";
        document.getElementById("pwd").value = paramsDict.pwd || "";
        document.getElementById("fname").value = paramsDict.fname || "";
        if (paramsDict.txid != undefined)
            document.getElementById("dwnBtn").click();
    }
}