const LibP2P = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const KadDHT = require('libp2p-kad-dht')
const defaultsDeep = require('@nodeutils/defaults-deep')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')

//console.log(LibP2P, TCP, Mplex, SECIO, PeerInfo, KadDHT, defaultsDeep, waterfall, parallel)
debugger;

class MyBundle extends LibP2P {
    
    constructor(_options) {
        const defaults = {
            modules: {
                transport: [TCP],
                streamMuxer: [ Mplex ],
                connEncryption: [ SECIO ],
                dht: KadDHT,
            },
            config: {
                dht: {
                    kBucketSize: 20
                },
                EXPERIMENTAL: {
                    dht: true
                }
            }
    
        }
        let options = defaultsDeep(_options, defaults)        
        debugger 
        super(options)   
    }
}

function createNode(callback) {
    let node;

    waterfall([
        (cb) => PeerInfo.create(cb),
        (peerInfo, cb) => {
            peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
            node = new MyBundle({
                peerInfo
            })
            debugger;
            node.start(cb)
        }
    ], (err) => callback(err, node))
}

parallel([
    (cb) => createNode(cb),
    (cb) => createNode(cb),
    (cb) => createNode(cb),
], (err, nodes) => {
    console.log("----------------------------------")
    console.log(err)
    console.log("----------------------------------")
    if (err) throw err;

    const node1 = nodes[0]
    const node2 = nodes[1]
    const node3 = nodes[2]

    console.log('---------- Nodes created --------------')
    console.log(node1.peerInfo.id._B58String(), node2id._B58String(), node3id._B58String())
    console.log('---------- Nodes created --------------')

    parallel([
        (cb) => node1.dial(node2.peerInfo, cb),
        (cb) => node2.dial(node3.peerInfo, cb),
        (cb) => setTimeout(cb, 3000)

    ], (err) => {

        if (err) throw err;

        node1.peerRouting.findPeer(node3.peerInfo.id, (err, peer) => {

            if (err) {
                debugger
                console.log(err.message)    
                throw err
            } 
            console.log("Found it", peer)
            console.log(peer.multiaddrs.forEach((ma) => {
                console.log("MultiAddress: " + ma.toString())
            }))            
        })
    })
})