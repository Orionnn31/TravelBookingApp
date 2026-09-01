const bcrypt = require('bcrypt');

const password = 'agent123'; // pick any password you want
bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});