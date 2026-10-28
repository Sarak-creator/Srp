const fs = require('fs');

if (process.platform === 'win32') {
  const normalizeErr = (err, p) => {
    if (err && err.code === 'EISDIR') {
      const e = new Error(`EINVAL: invalid argument, readlink '${p}'`);
      e.code = 'EINVAL';
      e.errno = -4071;
      return e;
    }
    return err;
  };

  const origReadlink = fs.readlink;
  fs.readlink = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origReadlink.call(fs, path, options, (err, linkString) => {
      return callback(normalizeErr(err, path), linkString);
    });
  };

  const origReadlinkSync = fs.readlinkSync;
  fs.readlinkSync = function (path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      throw normalizeErr(err, path);
    }
  };

  if (fs.promises) {
    const origPromisesReadlink = fs.promises.readlink;
    fs.promises.readlink = async function (path, options) {
      try {
        return await origPromisesReadlink.call(fs.promises, path, options);
      } catch (err) {
        throw normalizeErr(err, path);
      }
    };
  }
}

