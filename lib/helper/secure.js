'use babel';

var crypto = require('crypto');

export const decrypt = function (password, text) {
  try {
    var decipher = crypto.createDecipher('aes-256-ctr', password);
    var dec = decipher.update(text, 'hex', 'utf8');
    return dec;
  } catch (e) {
    return null;
  }
};

export const encrypt = function (password, text) {
  try {
    var cipher = crypto.createCipher('aes-256-ctr', password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  } catch (e) {
    return null;
  }
};

export const checkPasswordExists = function () {
  const self = this;

  let passwordHash = atom.config.get('ftp-remote-edit.password');
  if (passwordHash) return true;

  let config = atom.config.get('ftp-remote-edit.config');
  if (config) return true;

  return false;
};

export const checkPassword = function (password) {
  let passwordHash = atom.config.get('ftp-remote-edit.password');
  if (!passwordHash) return true;

  if (decrypt(password, passwordHash) !== password) {
    return false;
  }

  return true;
};

export const setPassword = function (password) {
  const self = this;

  let promise = new Promise((resolve, reject) => {
    let passwordHash = encrypt(password, password);

    // Store in atom config
    atom.config.set('ftp-remote-edit.password', passwordHash);

    resolve(true);
  });

  return promise;
}

export const changePassword = function (oldPassword, newPassword) {
  const self = this;

  let promise = new Promise((resolve, reject) => {
    let passwordHash = encrypt(newPassword, newPassword);
    // Store in atom config
    atom.config.set('ftp-remote-edit.password', passwordHash);

    let configHash = atom.config.get('ftp-remote-edit.config');
    if (configHash) {
      let oldconfig = decrypt(oldPassword, configHash);
      let newconfig = encrypt(newPassword, oldconfig);
      // Store in atom config
      atom.config.set('ftp-remote-edit.config', newconfig);
    }

    resolve(true);
  });

  return promise;
}
