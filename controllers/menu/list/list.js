/*
 * Create Menu List
 *
 *
 */

// Dependencies (NodeJS)
const fs = require('fs');
const path = require('path');
// Dependencies (Localhosts)
const config = require('../../../.config/config');
const _data = require('../../../lib/data');

// Main Container
var lib = function(data, callback) {
  const acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _menuList[data.method](data, callback);
  } else {
    callback(405, undefined, 'html');
  }
};

// Response Main Container
const _menuList = {};
// Menu List
_menuList.folder = 'menus';
// Index handler
_menuList.get = function(data, callback) {
  const templateData = {};
  templateData['head.title'] = 'Menu List';
  templateData['head.description'] = 'It is update menu.';
  templateData['body.class'] = 'menuList';

  // Read in a template as a string.
  _menuList.getTemplate('menuList', templateData, (err, str) => {
    if (!err && str) {
      // Add the universal header and footer.
      _menuList.addUniversalTemplate(str, templateData, (err, str) => {
        if ((!err, str)) {
          callback(200, str, 'html');
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(500, undefined, 'html');
    }
  });
  // callback(undefined, undefined, 'html');
};

// Get the string content of a template.
_menuList.getTemplate = (templateName, data, callback) => {
  templateName =
    typeof templateName == 'string' && templateName.length > 0
      ? templateName
      : false;
  if (templateName) {
    const templateDir = path.join(__dirname, './../../../template/');
    fs.readFile(templateDir + templateName + '.html', 'utf8', (err, str) => {
      if (!err && str && str.length > 0) {
        // Do interpolation on the data
        let finalString = _menuList.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No Template could be found.');
      }
    });
  } else {
    callback('A valid template name was not specified.');
  }
};

// Add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation.
_menuList.addUniversalTemplate = function(str, data, callback) {
  str = typeof str == 'string' && str.length > 0 ? str : '';
  data = typeof data == 'object' && data !== null ? data : {};
  // Get header
  _menuList.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      _menuList.getTemplate('_footer', data, (err, footerTemplate) => {
        if (!err && footerTemplate) {
          _menuList.getList((err, body) => {
            if (!err && body) {
              str = str.replace('{menuItem}', body);
            } else {
              str = str.replace('{menuItem}', 'Could not get the menu items');
            }
            let fullString = headerString + str + footerTemplate;
            callback(false, fullString);
          });
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template.');
    }
  });
};

// Take a given string and a data object and find/replace all the keys within it.
_menuList.interpolate = function(str, data) {
  str = typeof str == 'string' && str.length > 0 ? str : '';
  data = typeof data == 'object' && data !== null ? data : {};
  // Add the templateGlobal to the data object, prepending their key name with "global"
  for (let keyName in config.templateGlobal) {
    if (config.templateGlobal.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobal[keyName];
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder.
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] == 'string') {
      let replace = data[key];
      let find = `{${key}}`;
      str = str.replace(find, replace);
    }
  }

  // Return string
  return str;
};

_menuList.getList = function(callback) {
  _data.list(_menuList.folder, (err, list) => {
    if (!err && typeof list == 'object' && list.length > 0) {
      let temp = [];
      list.forEach(item => {
        _data.read(_menuList.folder, item, (err, fileInfo) => {
          if (!err && typeof fileInfo == 'object') {
            temp.push(`
              <tr>
                <td>${fileInfo.title}</td>
                <td>${fileInfo.ingredient}</td>
                <td>${fileInfo.price}</td>
                <td>${fileInfo.estimateTime}</td>
                <td>
                  <input type="number" class="txt-${
                    fileInfo.title
                  }" value="0" id="txt-${fileInfo.title}">
                  <button type="button" class="btn-${
                    fileInfo.title
                  }" onclick="app.addToCart('${fileInfo.title}')">
                    add
                  </button>
                </td>
              </tr>
            `);
            if (list.length === Object.keys(temp).length) {
              callback(false, temp.join());
            }
          }
        });
      });
    } else {
      callback(true);
    }
  });
};

// Export Module
module.exports = lib;
