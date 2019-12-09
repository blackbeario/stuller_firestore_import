var vcard = require('vcard-json');
const fs = require('fs');
var file = './data/StullerContacts.json';
var arr = {customers:{}};

vcard.parseVcardFile('./data/StullerContacts.vcf', function(err, data){
  // Add logic here to setup json fields correctly.
  try {
    data.forEach(element => {
      // Setup the firstName and lastName from fullname.
      $firstName = element.fullname.substr(0,element.fullname.indexOf(' '));
      $lastName = element.fullname.substr(element.fullname.indexOf(' ')+1);
      
      // If there's a billing address, create a location for it in Firestore.
      if (element.billing[0]) {
        billing = {
          'address': element.billing[0].street,
          'city': element.billing[0].city,
          'state': element.billing[0].region,
          'zipcode': element.billing[0].zip
        }
      }
      // An empty object will not create an address in Firestore.
      else billing = {};

      $notes = element.note.split("\\n").join("\n").split("\\").join("");

      // Create the new customer array.
      arr.customers[element.fullname] = {
        'firstName': $firstName,
        'lastName': $lastName,
        'email': element.email[0] ? element.email[0].value : '',
        'main': element.phone[0] ? element.phone[0].value : '',
        'mobile': element.cell,
        'notes': $notes,
        'payment': element.payment,
        'locations': {
          billing,
          'primary': {
            'name': 'home',
            'address': element.addr[0] ? element.addr[0].street : '',
            'city': element.addr[0] ? element.addr[0].city : '',
            'state': element.addr[0] ? element.addr[0].region : '',
            'zipcode': element.addr[0] ? element.addr[0].zip : '',
            'area': element.addr[0] ? element.addr[0].locality : '',
            'generators': {
              'gen': {
                'generator': element.generator ? element.generator : element.nickname,
                'model': element.model,
                'serial': element.serial,
                'battery age': element.battery,
                'xfer location': element.xferLocation,
                'xfer serial': element.xferSerial,
                'spark plugs': element.sparkPlugs,
                'exercise time': element.exercise,
                'oil filter': element.oilFilter,
                'air filter': element.airFilter,
                'warranty': element.warranty,
                'location': element.location,
                'wifi': element.wifi
              }
            }
          }
        }
      };
    });

    // Write the array to a new json file.
    fs.writeFileSync(file, JSON.stringify(arr))
    $date = new Date();
    console.log('finished', $date);
  } catch (err) {
    console.error(err)
  }
});