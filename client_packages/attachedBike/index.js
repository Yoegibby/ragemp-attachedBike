var player,
    bicycle,
    state;

init();

function init() {
    player = mp.players.local;
    bicycle = null;
    state = false;
    initEvents();
}

function initEvents() {
    mp.keys.bind(0x47, true, function () {
        if (player.vehicle) return;
        if (mp.gui.cursor.visible) return;
        process();
    });
}

function process() {
    if (state == true) {
        state = false;
        if (bicycle == null) return;
        mp.events.callRemote('SyncDetachBikeProcess', bicycle.remoteId);

        player.detach(true, false);
        player.position.x = bicycle.position.x + 1;
        player.position.y = bicycle.position.y + 1;
        player.position.z = bicycle.position.z;

        bicycle = null;
    } else {
        bicycle = null;

        let vehicle = getNearestVehicle(player, 2);
        if (!vehicle) return;

        let vehClass = vehicle.getClass();
        if (vehClass != 13) return; // return when not a bike   

        switch (vehicle.model) {
            case mp.game.joaat('cruiser'):
                bicycle = vehicle;
                break;
            case mp.game.joaat('bmx'):
                bicycle = vehicle;
                break;
            default:
                return;
        }

        if (bicycle != null) {
            mp.events.callRemote('SyncAttachBikeProcess', bicycle.remoteId);
        }
    }
}

function getNearestVehicle(player, range) {
    var currentTarget = null;

    mp.vehicles.forEachInStreamRange((_vehicle) => {
        let distance = calcDist(player.position, _vehicle.position);
        if (distance > range) return;
        if (!currentTarget) currentTarget = _vehicle;
        else if (distance < calcDist(player.position, currentTarget.position)) currentTarget = _vehicle;
    });
    return currentTarget;
}

function calcDist(v1, v2) {
    return mp.game.system.vdist(
        v1.x,
        v1.y,
        v1.z,
        v2.x,
        v2.y,
        v2.z
    );
}

// Server sync
mp.events.add('SyncAttachBikeProcessClient', (id, vehicleId) => {
    var target = mp.players.atRemoteId(id);
    if (!target) return;
    var targetVeh = mp.vehicles.atRemoteId(vehicleId);
    if (!targetVeh) return;

    if (id == player.remoteId) state = true;

    switch (targetVeh.model) {
        case mp.game.joaat('cruiser'):
            target.attachTo(targetVeh.handle, 0, 0, -0.7, 0.2, -10, 0, 0, true, false, false, true, 0, true);
            break;
        case mp.game.joaat('bmx'):
            target.attachTo(targetVeh.handle, 0, 0, 0.2, 0.6, 0, 0, 0, true, false, false, false, 0, true);
            break;
    }
});

// Server sync
mp.events.add('SyncDetachBikeProcessClient', (id) => {
    var target = mp.players.atRemoteId(id);
    if (!target) return;
    target.detach(true, false);
});
