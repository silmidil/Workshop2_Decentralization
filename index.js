const core vic= require('@actions/core');
const pinataSDK = require('@pinata/sdk');
const fsPath = require('path');

// Getting all inputs
const path = "./index.html";
const pinName = "index.html";
const pinataApiKey = "848c4b8dba99cf5ceb8b"
const pinataSecretApiKey = "3bfe3c367c855e5577a98a9354bbd45c4e0df99386f9ed86831c215370f8a616"
const verbose = true;
const removeOld = true;

// Getting workspace directory
const workspace = './';

if(verbose) {
    console.log("workspace: " + workspace);

    const env = JSON.stringify(process.env);
    console.log("env: " + env);
}

// If path is absolute use it
let sourcePath = path;

// Otherwise combine it using workspace and provided path
if(!fsPath.isAbsolute(path)) {
    sourcePath = fsPath.join(workspace, path);
}

if(verbose) {
    console.log("path: " + path);
    console.log("sourcePath: " + sourcePath);
}

// Connecting to Pinata
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

// Constructing Pinata options
const options = {
    pinataMetadata: {
        name: pinName,
    },
    pinataOptions: {
        cidVersion: 0,
        wrapWithDirectory: false
    }
};

// Function to unpin old hashes
function unpinHash(hashToUnpin) {
	pinata.unpin(hashToUnpin).then((result) => {
        if(verbose) {
            console.log(result);
        }
    }).catch((err) => {
        console.log(err);
    });
}

// Function to search for all old pins with the same name and unpin them if they are not the latest one
function removeOldPinsSaving(hash) {
	const metadataFilter = {
		name: pinName,
	};
	const filters = {
		status: "pinned",
		pageLimit: 1000,
		pageOffset: 0,
		metadata: metadataFilter,
	};
	pinata.pinList(filters).then((result) => {
            if(verbose) {
                console.log(result);
            }
			result.rows.forEach((element) => {
				if (element.ipfs_pin_hash != hash) {
					unpinHash(element.ipfs_pin_hash);
				}
			});
		}).catch((err) => {
            console.log(err);
        });
}

// Deploying (pining) to IPFS using Pinata from file system
pinata.pinFromFS(sourcePath, options).then((result) => {
    if(verbose) {
        console.log(result);
        console.log("HASH: " + result.IpfsHash);
    }

    if(removeOld) {
        removeOldPinsSaving(result.IpfsHash);
    }

    // Providing hash as output parameter of execution
    core.setOutput("hash", result.IpfsHash);
}).catch((err) => {
    console.log(err);
});

/*
API Key: 848c4b8dba99cf5ceb8b
API Secret: 3bfe3c367c855e5577a98a9354bbd45c4e0df99386f9ed86831c215370f8a616
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiN2Y3YmNhZS1lNjY3LTQzODQtYjhlNy0zYTg4MjBlNmUyMTkiLCJlbWFpbCI6InBhdWwuZXNjYWxpZXJAZWR1LmRldmluY2kuZnIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODQ4YzRiOGRiYTk5Y2Y1Y2ViOGIiLCJzY29wZWRLZXlTZWNyZXQiOiIzYmZlM2MzNjdjODU1ZTU1NzdhOThhOTM1NGJiZDQ1YzRlMGRmOTkzODZmOWVkODY4MzFjMjE1MzcwZjhhNjE2IiwiZXhwIjoxNzY5NDQzODc0fQ.YG4UFLtN2C_wznmcz6GTTfqBWfgiswJHMS_3U6vIp-4
 */