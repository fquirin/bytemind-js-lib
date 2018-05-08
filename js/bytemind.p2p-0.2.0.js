//required: simplewebrtc, jQuery
ByteMind.p2p = bytemind_build_p2p();

//WEBSERVICE connectors
function bytemind_build_p2p(){
    var P2p = {};

    P2p.debug = true;

    //SimpleWebRTC setup
    P2p.signalingServer = "https://sandbox.simplewebrtc.com";
    P2p.meetingRoom = "ByteMind-P2P-Connect-01";
    P2p.dataChannel = "publicChannel";
    
    P2p.webRTC = "";
    P2p.getPeerId = function(){
        return myPeerId;
    }
    var myPeerId = "";
    P2p.getPeerList = function(){
        return peerList;
    }
    var peerList = {};

    //Broadcasting - TODO: make even more general
    function broadcaster(callbacks, ...args){
        for(var i=0; i<callbacks.length; i++){
            callbacks[i](...args);
        }
    }
    var peerJoinedCallbacks = [];
    P2p.callOnPeerJoined = function(callback){
        peerJoinedCallbacks.push(callback);
    }
    var peerLeftCallbacks = [];
    P2p.callOnPeerLeft = function(callback){
        peerLeftCallbacks.push(callback);
    }
    var networkConnectedCallbacks = [];
    P2p.callOnNetworkConnected = function(callback){
        networkConnectedCallbacks.push(callback);
    };
    /*
    P2p.onReadyToJoin = function(){};
    */
    var roomJoinedCallbacks = [];
    P2p.callOnRoomJoined = function(callback){
        roomJoinedCallbacks.push(callback);
    };
    var roomLeftCallbacks = [];
    P2p.callOnRoomLeft = function(callback){
        roomLeftCallbacks.push(callback);
    };
    //Message handlers
    var peerMessageCallbacks = [];
    P2p.callOnPeerMessage = function(callback){
        peerMessageCallbacks.push(callback);
    };
    var peerChatMessageCallbacks = [];
    P2p.callOnPeerChatMessage = function(callback){
        peerChatMessageCallbacks.push(callback);
    };
    var networkMessageCallbacks = [];
    P2p.callOnNetworkMessage = function(callback){
        networkMessageCallbacks.push(callback);
    };
    
    //Control
    P2p.connectToNetwork = function(){
        P2p.webRTC = new SimpleWebRTC({
            debug : false,
            url : P2p.signalingServer,
            enableDataChannels : true,
            autoRequestMedia : false,
            localVideoEl: '',
            remoteVideosEl: '',
            receiveMedia : {
                offerToReceiveAudio: false, 
                offerToReceiveVideo: false
            }
        });
        startListeners();
    }
    P2p.disconnectFromNetwork = function(){
        P2p.webRTC.disconnect();
    }

    //Network Rooms
    P2p.createRoom = function(name){
        if (!name){
            name = P2p.meetingRoom;
        }
        P2p.webRTC.createRoom(name, function(){
            debugInfo('Created room: ' + name);
            broadcaster(roomJoinedCallbacks, name);
        });
    }
    P2p.joinRoom = function(name){
        if (!name){
            name = P2p.meetingRoom;
        }
        P2p.webRTC.joinRoom(name, function(){
            debugInfo('Joined room: ' + name);
            broadcaster(roomJoinedCallbacks, name);
        });
    }
    P2p.leaveRoom = function(){
        P2p.webRTC.leaveRoom();
    }

    //Data transfer

    //Direct connection to peers
    P2p.broadcastToPeers = function(channel, type, payload){
        //TODO: requires connected state (network and room?)
        if (!channel){
            channel = P2p.dataChannel;
        }
        if (!type){
            type = "chat";
        }
        if (payload){
            P2p.webRTC.sendDirectlyToAll(channel, type, payload);
        }
    }
    P2p.broadcastToPeersChat = function(channel, msg){
        P2p.broadcastToPeers(channel, 'chat', msg);
    }
    //Websocket connection to signaling server
    P2p.broadcastToNetwork = function(type, payload){
        //TODO: requires connected state (network only?)
        if (!type){
            type = "data";
        }
        if (payload){
            P2p.webRTC.sendToAll(type, payload);
        }
    }
    
    //Events
    function startListeners(){
        P2p.webRTC.off();

        P2p.webRTC.on('connectionReady', function(peerId) {
            debugInfo('Connection ready, my id: ' + peerId);
            myPeerId = peerId;
            broadcaster(networkConnectedCallbacks, peerId);
        });
        //TODO: what is the difference?
        /*
        P2p.webRTC.on('readyToCall', function () {
            debugInfo('Redy to join room.');
            P2p.onReadyToJoin();
        });
        */

        P2p.webRTC.on('createdPeer', function(peer){
            debugInfo('Peer joined: ' + peer.id);
            peerList[peer.id] = {id: peer.id};
            broadcaster(peerJoinedCallbacks, peer);
        });

        P2p.webRTC.on('peerStreamRemoved', function(peer){
            debugInfo('Peer left: ' + peer.id);
            delete peerList[peer.id];
            broadcaster(peerLeftCallbacks, peer);
        });

        P2p.webRTC.on('leftRoom', function(roomName){
            debugInfo('Left room: ' + roomName);
            broadcaster(roomLeftCallbacks, roomName);
        });

        P2p.webRTC.on('message', function(data){
            //debugInfo('Received network message: ' + JSON.stringify(data);
            debugInfo('Received network message');
            broadcaster(networkMessageCallbacks, data);
        });
        P2p.webRTC.on('channelMessage', function(peer, channel, data){
            debugInfo('Received peer message from: ' + peer.id + " on channel: " + channel);
            //Chat
            if (data && data.type === "chat"){
                broadcaster(peerChatMessageCallbacks, peer, channel, data);
            //Data
            }else{
                broadcaster(peerMessageCallbacks, peer, channel, data);
            }
        });
    }

    //DEBUG - TODO: use ByteMind debugger
    debugLog = function(msg){
        if (P2p.debug){
            console.log('ByteMind.p2p - LOG - ' + msg);
        }
    }
    debugError = function(msg){
        if (P2p.debug){
            console.error('ByteMind.p2p - ERROR - ' + msg);
        }
    }
    debugInfo = function(msg){
        if (P2p.debug){
            console.log('ByteMind.p2p - INFO - ' + msg);
        }
    }
    
    return P2p;
}