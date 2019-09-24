const firebaseAdmin = require('firebase-admin');
var vcard = require('vcard-json');
const fs = require('fs');
var file = './test.json';
var arr = {customers:{}};

vcard.parseVcardFile('./test.vcf', function(err, data){
  // Add logic here to setup json fields correctly.
  try {
    data.forEach(element => {
      // console.log(element);
      // Setup the firstName and lastName from fullname.
      $firstName = element.fullname.substr(0,element.fullname.indexOf(' '));
      $lastName = element.fullname.substr(element.fullname.indexOf(' ')+1);

      // Create the loc/lat for the geopoint.
      // $position = new firebaseAdmin.firestore.GeoPoint(35.6416958, -82.254216)

      // Create the new customer array.
      arr.customers[element.fullname] = {
        'firstName': $firstName,
        'lastName': $lastName,
        'email': element.email[0].value,
        'main': element.phone[0].value,
        'notes': element.note,
        'locations': {
          'primary': { 
            'name': 'home',
            'address': element.addr[0].street,
            'city': element.addr[0].city,
            'state': element.addr[0].region,
            'zipcode': element.addr[0].zip,
            'area': element.addr[0].locality,
            'billing': element.billing,
            'generators': {
              'gen': {
                'model': element.generator,
                'serial': element.serial
              }
            }
          }
        }
      };
    });

    // console.log(arr);

    // Write the array to a new json file.
    fs.writeFileSync(file, JSON.stringify(arr))
  } catch (err) {
    console.error(err)
  }
});