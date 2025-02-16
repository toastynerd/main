const fs = require('fs');
const makeKey = require('../lib/make-key');
const IPR = require('../model/ratings');
const season = require('../model/seasons').get();
const {ROOT} = require('../constants');
require('dotenv').load();
const DATA_FOLDER = process.env.DATA_FOLDER;

const {teams} = season;
const players = Object.keys(teams)
  .map(tk => {
    return teams[tk].roster.map(({name}) => ({
      name,
      team: tk
    }));
  })
  .reduce((map, team) => {
    team.forEach(p => {
      map[p.name.toLowerCase()] = p.team;
    });
    return map;
  }, {});

// The readdir assumes this is running from the project root.
const DIR = DATA_FOLDER + '/players';
const files = fs.readdirSync(DIR);

files.forEach(fn => {
  if(fn === ROOT) return;

  const p = JSON.parse(fs.readFileSync(`${DIR}/${fn}`));


  const line = [
    fn,
    p.name,
    fn === makeKey(p.name) || 'BAD_KEY',
    IPR.forName(p.name)    || 'UNK_IPR',
    fn === makeKey(p.name) && !!IPR.forName(p.name)
  ];

  if(!line[4]) console.log(line.join(','));
});
