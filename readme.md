node-bird-routedump 
---

Dump RIB from BIRD (BIRD Internet Routing Daemon).


### Todo

- Support recursive route
- Support multipath

### Usage

```Javascript
var NBRD = require('node-bird-routedump');

async function dump_route () {
  var routes = await NBRD('/var/run/bird/bird6.ctl');
  console.log(routes);
}

dump_route();
``` 

### Output

```Javascript
[ { route: '2620:1d:a000::/48',
    via: '2001:470:17:24::1',
    dev: 'he-ipv6',
    peer: 'he',
    uptime: '15:49:54',
    types: [ 'BGP', 'unicast', 'univ' ],
    origin: 'IGP',
    as_path: [ 6939, ..., ... ],
    next_hop: [ '2001:470:17:24::1', 'fe80::d8da:dd02' ] },
    bgp_community: [ '65500:7000', '65500:1666' ],
    aggregator: { ip: '141.193.21.1', asn: 396303 }
   },
   ...
]
```

### Licenses

MIT
