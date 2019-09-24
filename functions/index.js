const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBUNmZEFi3bDSRujxQdsm7ASUfmYuD98Oc',
  Promise: Promise
});

// Triggers must always point to a document, not a collection.
exports.createGeoPoint = functions.firestore
  .document('customers/{customerID}/locations/primary')
  .onUpdate( async (change) => {
    const afterData = change.after.data();
    const previousData = change.before.data();

    // We'll only update if the geopoint has changed.
    // This is crucial to prevent infinite loops.
    if (afterData.address === previousData.address) return null;
    var geo = {};
    
    // Use these fields to compute the latitude/longitude.
    const $address = afterData.address + ', ' + afterData.city + ', ' + afterData.state;

    await googleMapsClient.geocode({address: $address}) 
    .asPromise()
    .then((response) => {
      let latitude = response.json.results[0].geometry.location.lat;
      let longitude = response.json.results[0].geometry.location.lng;
      geo.lat = latitude;
      geo.lng = longitude;
      return geo;
    })
    .catch((err) => {
      console.log(err);
    });

    // Then return a promise of a set operation to update the geopoint.
    return change.after.ref.set({
      updated: new Date(),
      // Add the computed lat/long to add a geopoint field.
      geopoint: new admin.firestore.GeoPoint(geo.lat, geo.lng)
    }, {merge: true});
  });