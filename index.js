
var request = require('request');

function getVeikkausOptions(path) {
  return {
    url: 'https://www.veikkaus.fi' + path,
    headers: {
      'X-ESA-API-Key': 'ROBOT',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    gzip: true
  };
}

function getVakio() {
  var options = getVeikkausOptions('/api/v1/sport-games/draws?game-names=SPORT');
  request(options, function(error, response, body) {
    if (!error) {
      getPopularity(JSON.parse(body).draws);
    }
  });
}

function getPopularity(draws) {
  for (let i=0; i<draws.length; i++) {
    getDraw(draws[i]);
  }
}

function getDraw(draw) {
  if (draw.status !== 'OPEN') {
    console.log("Draw", draw.id, "is not OPEN -- ignoring")
    return;
  }
  var options = getVeikkausOptions('/api/v1/sport-games/draws/SPORT/' + draw.id + '/popularity');
  request(options, function(error, response, body) {
    if (!error) {
      console.log("Peliprosentit kohteelle", draw.id, draw.name);
      let pops = JSON.parse(body).resultPopularityDTOs;
      let prs = getPeliprosentit(pops);
      for (let i=0; i<prs.length; i++) {
        console.log(i, prs[i]);
      }
    }
  });
}

function getPeliprosentit(pops) {
  let prosentit = [];
  for (let i=0; i<pops.length; i++) {
    let p = pops[i];
    let k = prosentit[p.eventId];
     if (!k) {
       k = [null, null, null];
       prosentit[p.eventId] = k;
     }
     if (p.home) {
       k[0] = p.percentage;
     }
     else if (p.tie) {
       k[1] = p.percentage;
     }
     else if (p.away) {
       k[2] = p.percentage;
     }
  }
  return prosentit;
}

getVakio();
