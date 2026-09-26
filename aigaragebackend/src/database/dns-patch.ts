import * as dns from 'dns';

// Ensure public reliable DNS servers are configured
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const origLookup = dns.lookup.bind(dns);

// Monkey-patch dns.lookup so libuv getaddrinfo falls back to c-ares DNS resolver
// when local network/ISP DNS fails to resolve cloud domains
(dns as any).lookup = (
  hostname: string,
  options: any,
  callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      if (options && options.all) {
        return callback(
          null,
          addresses.map((addr) => ({ address: addr, family: 4 }))
        );
      }
      return callback(null, addresses[0], 4);
    }
    return origLookup(hostname, options, callback);
  });
};
