var net = require("net"), exec = require('child_process').exec;

var parse_route = function (route) {
  var routes = [];
  var isFieldHead = line => /^(\d{4})-/.test(line);
  var robj = {};

  route.split('\n').forEach(line => {
    line = line.replace(/\s+/g, ' ');
    if (isFieldHead(line)) {
      var fid = Number.parseInt(line.substring(0, 4));
      var rline = line.substring(5);
      switch (fid) {
        case 1007:
          var rinfo = rline.split(' ');
          if (robj.route) routes.push(robj);
          var last = robj;
          robj = {};
          robj.route = rinfo[0] == '' ? last.route : rinfo[0];
          robj.via = rinfo[2];
          robj.dev = rinfo[4];
          robj.peer = rinfo[5].substring(1);
          robj.uptime = rinfo[6].slice(0, -1);
          break;
        case 1008:
          robj.types = rline.split(' ').slice(2);
          break;
        case 1012:
          robj.origin = rline.split(' ')[2];
      }
    } else {
      var rbase = line.split(' ').slice(1);
      switch (rbase[0]) {
        case 'BGP.as_path:':
          robj.as_path = rbase.slice(1).map(n => Number.parseInt(n));
          break;
        case 'BGP.next_hop:':
          robj.next_hop = rbase.slice(1);
          break;
        case 'BGP.local_pref':
          robj.local_pref = Number.parseInt(rbase.slice(1)[0]);
          break;
        case 'BGP.community:':
          robj.bgp_community = rbase.slice(1).map(s => s.replace(/[\(\)]/g, '').replace(',', ':'));
          break;
        case 'BGP.aggregator:':
          var aggr_ = rbase.slice(1);
          var aggr = {};
          aggr.ip = aggr_[0];
          aggr.asn = Number.parseInt(aggr_[1].replace('AS', ''));
          robj.aggregator = aggr;
      }
    }
  });

  return routes;
};

var routeDump = function ({ctrl_soc, cmd}) {  
  return new Promise((res, rej) => {  
    if (ctrl_soc) {  
      var buf = '';  
      var client = net.createConnection(ctrl_soc, () => { client.write('show route all\n'); });  
      client.on('data', data => {  
        buf += data;

        // fix: to fetch all data let's wait for magic sequence at the end
        const l = data.length;
        if (    data[l-1] === 0x0a && // "\n"
                data[l-2] === 0x20 && // " "
                data[l-3] === 0x30 && // "0"
                data[l-4] === 0x30 && // "0"
                data[l-5] === 0x30 && // "0"
                data[l-6] === 0x30) { // "0"
                client.end();
        }

        client.end();  
      });  
      client.on('error', err => rej(err));  
      client.on('end', () => res(parse_route(buf)));  
    } else {  
      exec(cmd + " -v 'show route all'", {maxBuffer: 1024 * 102400}, (err, stdout, stderr) => {  
        if(err) rej(err);
        else res(parse_route(stdout));
      });
    };
  });
};

module.exports = routeDump;
