var vcard = require('vcard-json');
var moment = require('moment');
const fs = require('fs');
var file = './data/test.json'; // Our output file
var arr = {customers:{}};

// Parse the data from here:
vcard.parseVcardFile('./data/test.vcf', function(err, data){
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

      // Split the notes into a semi-readable format vs the blob in Contacts.
      $notes = element.note.split("\\n").join("\n").split("\\").join("");

      // Battery Age MUST be a number in Firestore so we can check the age
      // and notify the client if it's over 4 years old. So, we have to go through 
      // a bunch of logic for various options found in old client data.
      $battery = element.battery;
      // Seaches for '/' in the battery string.
      $numSlashes = $battery.match(new RegExp("/", "g")) || [];
      // Converts year to 4-digit if only 2-digit e.g. 17 to 2017.
      if ($numSlashes && $numSlashes.length == 1) {
        // Assuming anything before '/' is the month.
        $month = $battery.split('/')[0];
        // Assuming anything after '/' is the year.
        $year = $battery.split('/')[1];
        if ($year.length < 4) {
          console.log('Converting 2 digit year');
          $newDate = $month + '/01/20' + $year;
          console.log($newDate);
          $battery = $newDate;
        }
      }

      // Check if the battery age is a valid DateTime string.
      try {
        var parsedDate = Date.parse($battery);
        // Check again for !isNaN(parsedDate) here because Dates can be converted
        // to numbers, but a failed Date parse will not.
        if (!isNaN(parsedDate)) {
          // Returns our milliseconds if successfully parsed from un-altered value.
          $battery = parsedDate;
        }
      } catch (e) {
        // If we can't figure out a date from the endless list of possible values entered
        // then throw an error and pass the garbage string along.
        console.log('Error: cannot parse:', $battery);
      }

      // Create the new customer array.
      arr.customers[element.fullname] = {
        'firstName': $firstName,
        'lastName': $lastName,
        'service': element.service,
        'due': element.due,
        'amount': element.amount,
        'email': element.email[0] ? element.email[0].value : '',
        'main': element.phone[0] ? element.phone[0].value : '',
        'mobile': element.cell,
        'notes': $notes,
        'payment': element.payment,
        'locations': {
          'hack': '',
          'primary': {
              'name': 'home',
              'address': element.addr[0] ? element.addr[0].street : '',
              'city': element.addr[0] ? element.addr[0].city : '',
              'state': element.addr[0] ? element.addr[0].region : '',
              'zipcode': element.addr[0] ? element.addr[0].zip : '',
              'area': element.addr[0] ? element.addr[0].locality : '',
              'generator': {
                'generator': element.generator ? element.generator : element.nickname,
                'model': element.model,
                'serial': element.serial,
                'battery age': $battery,
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
            },
          billing,
        },
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