const RSClient = require("./lib/rsclient");
//

//console.log(RSClient);
const client = new RSClient('http://localhost:3000/employees');
client.setBasicAuth("admin", "test");
client.get().then(
    (response)  => {
        console.log(response);
    },
    (err) => {
      console.log(err);
    }
);





const axiosCrud = require('./lib/axios');

// Set the base URL dynamically
axiosCrud.use('http://localhost:3000');

// Make a GET request
axiosCrud.get('/employees')
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });

 



