# Node.js import script to map Apple Contacts vcf to JSON then push to Firestore

1. Converts VCF to JSON
2. Maps data to required Firestore fields
3. Writes to Firestore
4. Additionally, once data is uploaded to Firestore, the included cloud functions createGeoPoint() create a geohash from the contacts address and write to the customer location document.