# Node.js import script to map Apple Contacts vcf to JSON then push to Firestore

1. Converts VCF to JSON
2. Maps data to required Firestore fields
3. Writes to Firestore
4. Additionally, once data is uploaded to Firestore, the included cloud functions createGeoPoint() create a geohash from the contacts address and write to the customer location document.


# Requirements 
1. Node
2. vcard-json `npm install vcard-json`
3. firebase-admin `npm install vcard-json`

# Optional
4. geohash `npm install geohash` (Only needed for cloud firestore functions)

First, you need to setup a node application in Firestore and get the required `serviceAccount` information. Store this in a serviceAccount.json file. It will be required in import.js.

Then, you have to map your vcf data to your expected JSON output in vcardToJson.js, then run `node vcardToJson.js`. If successful, you will see a "finished" log and a timestamp.

Once the JSON looks like you need it in your Firestore collection(s), simply run `node import.js`. This script will attempt to connect to Firestore using your credentials and populate your collection.