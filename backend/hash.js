// hash.js
import bcrypt from 'bcrypt';

const password = 'qwerty';

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed password:', hash);
});
