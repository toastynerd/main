/**
  This script should be used with care because it makes
  changes to data/players.

  Usage: (from project root, ie not this dir)
  node util/correct-player-names.js [change_file]

  change_file should be a CSV in format:
  old_name,email,[confirmed?],ifpa_number,ifpa_name
*/

'use strict';

const fs = require('fs');
require('dotenv').load();
const DATA_FOLDER = process.env.DATA_FOLDER;

const { makeKey } = require('../model/players');

const changeFile = process.argv[2] || DATA_FOLDER + '/player-accounts-appended.csv';

const data = fs.readFileSync(changeFile)
  .toString()
  .split('\n')
  .map(line => line.trim().split(','))
  .filter(row => row.length > 4)
  .map(row => ({
    acc_name:  row[0],
    ifpa_name: row[4],
    acc_key:  makeKey(row[0]),
    ifpa_key: makeKey(row[4])
  }));

data
  .filter(p => p.ifpa_name.length > 0)
  .filter(p => p.acc_key != p.ifpa_key)
  .forEach(p => {
    console.log(p.acc_name, '->', p.ifpa_name);
    try {
      const oldFilename = DATA_FOLDER + `/players/${p.acc_key}`;
      const account = JSON.parse(fs.readFileSync(oldFilename));
      account.key = p.ifpa_key;
      account.name = p.ifpa_name;

      const newFilename = DATA_FOLDER + `/players/${p.ifpa_key}`;
      fs.writeFileSync(newFilename, JSON.stringify(account, null, 2));
      fs.unlinkSync(oldFilename);
    } catch (err) {
      console.log('Could not find file for ', p.acc_name);
    }
  });
