var attachedVeh = [];       // Array with all attached vehicles for occupied check
var anim = {};
anim.animDict = 'amb@prop_human_seat_chair_mp@male@generic@base';
anim.animName = 'base';
anim.speed = 2;
anim.flag = 1;

// Attach players on Join / client needs timeout for loading vehicles
mp.events.add('playerReady', (player) => {
    setTimeout(() => {
        if (!mp.players.exists(player)) return;
        mp.players.forEach(target => {
            if (typeof target.attachedBike == 'number') {
                player.call('SyncAttachBikeProcessClient', [target.id, target.attachedBike]);
            }
        });
    }, 1500);
});

// Attach player 4 mp.playerss
mp.events.add('SyncAttachBikeProcess', (player, handle) => {
    if (attachedVeh.includes(handle)) {
        // Bike occupied
        return;
    } else {
        attachedVeh.push(handle);
        player.attachedBike = handle;
    }

    player.playAnimation(anim.animDict, anim.animName, anim.speed, anim.flag);
    mp.players.call('SyncAttachBikeProcessClient', [player.id, handle]);
});

// Unattach player 4 mp.players
mp.events.add('SyncDetachBikeProcess', (player, handle) => {
    if (attachedVeh.includes(handle) && player.attachedBike == handle) {
        player.attachedBike = false;
        deleteHandle(handle);
        mp.players.call('SyncDetachBikeProcessClient', [player.id]);
        player.stopAnimation();
    }
});

function deleteHandle(handle) {
    for (var i = attachedVeh.length - 1; i >= 0; i--) {
        if (attachedVeh[i] === handle) {
            attachedVeh.splice(i, 1);
        }
    }
}

// Remove player from Array on quit
mp.events.add('playerQuit', (player) => {
    if (typeof player.attachedBike == 'number') {
        deleteHandle(player.attachedBike);
    }
});

// Test command
mp.events.addCommand('bike', (player, _, veh = 'cruiser') => {
    let pos = player.position;
    let name = mp.joaat(veh);

    veh = mp.vehicles.new(name, pos);
    veh.setColor(134, 147);
    player.putIntoVehicle(veh, 0);
});

