const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const Bootstrap = require('libp2p-railing')
const waterfall = require('async/waterfall')
const defaultsDeep = require('@nodeutils/defaults-deep')

const bootstrapNodes = [
    '/ip4/192.168.0.102/tcp/4000/ipfs/QmWNy2YfKgjR7bd2XqRthMcPB8RP6aDz2L2Y6QKQAoP3KR'
]

class MyBundle extends libp2p {
    constructor (_options) {
        const defaults = {
            modules: {
                transport: [ TCP ],
                streamMuxer: [ Mplex ],
                connEncryption: [ SECIO ],
                peerDiscovery: [ Bootstrap ]
            },
            config: {
                peerDiscovery: {
                    bootstrap: {
                        interval: 2000,
                        enabled: true,
                        list: bootstrapNodes
                    }
                }
            }
        }

        super(defaultsDeep(_options, defaults))
    }
}

let node

waterfall([
    (cb) => PeerInfo.create(cb),
    (peerInfo, cb) => {
        let multiaddr = '/ip4/0.0.0.0/tcp/' + process.env.PORT
        console.log('address of this node is')
        peerInfo.multiaddrs.add(multiaddr)
        node = new MyBundle({
            peerInfo
        })
        node.start(cb)
    }
], (err) => {

    if (err) { throw err; }

    console.log('node has started (true/false):', node.isStarted())
    // And we can print the now listening addresses.
    // If you are familiar with TCP, you might have noticed
    // that we specified the node to listen in 0.0.0.0 and port
    // 0, which means "listen in any network interface and pick
    // a port for me
    console.log('listening on:')
    node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))


    console.log("Launching peer discovery...")
    node.on('peer:discovery', (peer) => {

        debugger;
        console.log('Discovered: ', peer.id.toB58String())
        node.dial(peer, (err, conn) => {

            debugger;
            console.log(err)
            console.log("Connection established", conn)
        })
    })

    node.on('peer:connect', (peer) => {
        console.log('Connection established to:', peer.id.toB58String())
    })


})



