const BUTTON_A_INDEX     = 0;
const BUTTON_B_INDEX     = 1;
const BUTTON_X_INDEX     = 2;
const BUTTON_Y_INDEX     = 3;
const BUTTON_LB_INDEX    = 4;
const BUTTON_RB_INDEX    = 5;
const BUTTON_LT_INDEX    = 6;
const BUTTON_RT_INDEX    = 7;
const BUTTON_BACK_INDEX  = 8;
const BUTTON_START_INDEX = 9;
const BUTTON_L3_INDEX    = 10;
const BUTTON_R3_INDEX    = 11;
const BUTTON_UP_INDEX    = 12;
const BUTTON_DOWN_INDEX  = 13;
const BUTTON_LEFT_INDEX  = 14;
const BUTTON_RIGHT_INDEX = 15;
const BUTTON_HOME_INDEX  = 16;

//micro:bit BLE UUID
const EVENT_SERVICE_UUID                 = 'e95d93af-251d-470a-a062-fa1922dfa9a8';
const EVENT_SERVICE_MICROBIT_EVENT_UUID  = 'e95d9775-251d-470a-a062-fa1922dfa9a8';
const EVENT_SERVICE_CLIENT_REQUIRE_UUID  = 'e95d23c4-251d-470a-a062-fa1922dfa9a8';
const EVENT_SERVICE_CLIENT_EVENT_UUID    = 'e95d5404-251d-470a-a062-fa1922dfa9a8';

const MES_DPAD_CONTROLLER_ID = 1104;
const MES_DPAD_BUTTON_A_DOWN = 1;  // MES_DPAD_BUTTON_A_DOWN
const MES_DPAD_BUTTON_A_UP = 2;  // MES_DPAD_BUTTON_A_UP
const MES_DPAD_BUTTON_B_DOWN = 3;  // MES_DPAD_BUTTON_B_DOWN
const MES_DPAD_BUTTON_B_UP = 4;  // MES_DPAD_BUTTON_B_UP
const MES_DPAD_BUTTON_C_DOWN = 5;  // MES_DPAD_BUTTON_C_DOWN
const MES_DPAD_BUTTON_C_UP = 6;  // MES_DPAD_BUTTON_C_UP
const MES_DPAD_BUTTON_D_DOWN = 7;  // MES_DPAD_BUTTON_D_DOWN
const MES_DPAD_BUTTON_D_UP = 8;  // MES_DPAD_BUTTON_D_UP
const MES_DPAD_BUTTON_1_DOWN = 9;  // MES_DPAD_BUTTON_1_DOWN
const MES_DPAD_BUTTON_1_UP = 10;  // MES_DPAD_BUTTON_1_UP
const MES_DPAD_BUTTON_2_DOWN = 11;  // MES_DPAD_BUTTON_2_DOWN
const MES_DPAD_BUTTON_2_UP = 12;  // MES_DPAD_BUTTON_2_UP
const MES_DPAD_BUTTON_3_DOWN = 13;  // MES_DPAD_BUTTON_3_DOWN
const MES_DPAD_BUTTON_3_UP = 14;  // MES_DPAD_BUTTON_3_UP
const MES_DPAD_BUTTON_4_DOWN = 15;  // MES_DPAD_BUTTON_4_DOWN
const MES_DPAD_BUTTON_4_UP = 16;  // MES_DPAD_BUTTON_4_UP

var device;
var server;
var client_requirement_characteristic;
var client_event_characteristic;
var xboxPadIndex;
var stdPadIndex;
var lastGamePadButtonPressed;

function event(server)
{
    return server.getPrimaryService(EVENT_SERVICE_UUID)
        .then(service => Promise.all(
            [
                clientRequirement(service),
                clientEvent(service)
            ])
        )
        .then(_ => {
            return writeCharacteristicValue(
                client_requirement_characteristic,
                MES_DPAD_CONTROLLER_ID,
                0);
        });
}

function clientRequirement(service)
{
    return service.getCharacteristic(EVENT_SERVICE_CLIENT_REQUIRE_UUID)
        .then(chara => client_requirement_characteristic = chara);
}

function clientEvent(service)
{
    return service.getCharacteristic(EVENT_SERVICE_CLIENT_EVENT_UUID)
        .then(chara => client_event_characteristic = chara);
}

function writeCharacteristicValue(characteristic, type, value)
{
    var buffer = new ArrayBuffer(2 + 2);
    var view = new DataView(buffer);
    view.setUint16(0, type, true);
    view.setUint16(2, value, true);

    return characteristic.writeValue(buffer);
}

function onPressA()
{
    sendDpadControllerEvent(MES_DPAD_BUTTON_A_DOWN);
}

function onReleaseA()
{
    sendDpadControllerEvent(MES_DPAD_BUTTON_A_UP);
}

function onPressB()
{
    sendDpadControllerEvent(MES_DPAD_BUTTON_B_DOWN);
}

function onReleaseB()
{
    sendDpadControllerEvent(MES_DPAD_BUTTON_B_UP);
}

function sendDpadControllerEvent(value)
{
    if (!client_event_characteristic) return;

    writeCharacteristicValue(
        client_event_characteristic, MES_DPAD_CONTROLLER_ID, value)
        .catch(error => console.log(error.message));
}

function connect()
{
    navigator.bluetooth.requestDevice({
    filters: [{
      namePrefix: 'BBC micro:bit',
    }],
    optionalServices: [
        EVENT_SERVICE_UUID,
        ]
  })
  .then(x => {
    device = x;
    return device.gatt.connect();
  })
  .then(x => {
      server = x;
      return Promise.all(
        [
            event(server),
        ]);
  })
  .then(_ => writeConnectionInfo("BLE接続が完了しました。"))
  .catch(error => {
    writeConnectionError("BLE接続に失敗しました。もう一度試してみてください。");
    console.log(error.message);
  });    
}

function disconnect()
{
  if (!device || !device.gatt.connected) return;
  device.gatt.disconnect();
  writeConnectionError("BLE接続を切断しました。");
}

function writeConnectionInfo(message)
{
    var infoElement = document.getElementById("connection_info");
    var errorElement = document.getElementById("connection_error");
    infoElement.innerHTML = message;
    infoElement.style.visibility = "visible";
    errorElement.style.visibility = "collapse";

    console.log(message);
}

function writeConnectionError(message)
{
    var infoElement = document.getElementById("connection_info");
    var errorElement = document.getElementById("connection_error");
    errorElement.innerHTML = message;
    errorElement.style.visibility = "visible";
    infoElement.style.visibility = "collapse";

    console.log(message);
}

function isButtonPress(gamepad, id)
{
    return gamepad.buttons[id].pressed && lastGamePadButtonPressed[id] != true;
}

function isButtonRelease(gamepad, id)
{
    return !gamepad.buttons[id].pressed && lastGamePadButtonPressed[id] == true;
}

function RedirectButtonEvent(gamepad, srcButtonId, destButtonDownEvent, destButtonUpEvent)
{
    if (isButtonPress(gamepad, srcButtonId))
    {
        //console.log(`redirect button down event ${srcButtonId} -> ${destButtonDownEvent}`);
        sendDpadControllerEvent(destButtonDownEvent);
    }
    else if (isButtonRelease(gamepad, srcButtonId))
    {
        //console.log(`redirect button up   event ${srcButtonId} -> ${destButtonUpEvent}`);
        sendDpadControllerEvent(destButtonUpEvent);
    }
}

function gameLoop()
{
    var gamepads = navigator.getGamepads();
    if (!gamepads) return;

    var gamepad = null;

    if (0 < xboxPadIndex && xboxPadIndex < gamepads.length)
    {
        gamepad = gamepads[xboxPadIndex];
    }
    else if (0 < stdPadIndex && stdPadIndex < gamepads.length)
    {
        gamepad = gamepads[stdPadIndex];
    }
    else
    {
        retun;
    }

    RedirectButtonEvent(gamepad, BUTTON_A_INDEX, MES_DPAD_BUTTON_A_DOWN, MES_DPAD_BUTTON_A_UP);
    RedirectButtonEvent(gamepad, BUTTON_B_INDEX, MES_DPAD_BUTTON_B_DOWN, MES_DPAD_BUTTON_B_UP);
    RedirectButtonEvent(gamepad, BUTTON_X_INDEX, MES_DPAD_BUTTON_C_DOWN, MES_DPAD_BUTTON_C_UP);
    RedirectButtonEvent(gamepad, BUTTON_Y_INDEX, MES_DPAD_BUTTON_D_DOWN, MES_DPAD_BUTTON_D_UP);
    RedirectButtonEvent(gamepad, BUTTON_UP_INDEX, MES_DPAD_BUTTON_1_DOWN, MES_DPAD_BUTTON_1_UP)
    RedirectButtonEvent(gamepad, BUTTON_DOWN_INDEX, MES_DPAD_BUTTON_2_DOWN, MES_DPAD_BUTTON_2_UP)
    RedirectButtonEvent(gamepad, BUTTON_LEFT_INDEX, MES_DPAD_BUTTON_3_DOWN, MES_DPAD_BUTTON_3_UP)
    RedirectButtonEvent(gamepad, BUTTON_RIGHT_INDEX, MES_DPAD_BUTTON_4_DOWN, MES_DPAD_BUTTON_4_UP);

    for (var i=0; i<lastGamePadButtonPressed.length; i++)
    {
        lastGamePadButtonPressed[i] = gamepad.buttons[i].pressed;
    }

    //console.log(`A:${lastGamePadButtonPressed[BUTTON_A_INDEX]}, B:${lastGamePadButtonPressed[BUTTON_B_INDEX]}, L:${lastGamePadButtonPressed[BUTTON_LEFT_INDEX]}, R:${lastGamePadButtonPressed[BUTTON_RIGHT_INDEX]}`);

    start = requestAnimationFrame(gameLoop);
}

window.addEventListener("gamepadconnected", e => {
    if (e.gamepad.id.includes("Xbox"))
    {
        xboxPadIndex = e.gamepad.index;
        document.getElementById("xboxPadIndex").value = e.gamepad.index;
        document.getElementById("xboxPadId").value = e.gamepad.id;
    }
    else if (e.gamepad.id.includes("STANDARD"))
    {
        stdPadIndex = e.gamepad.index;
        document.getElementById("stdPadIndex").value = e.gamepad.index;
        document.getElementById("stdPadId").value = e.gamepad.id;
    }
    else
    {
        return;
    }

    lastGamePadButtonPressed = new Array(e.gamepad.buttons.length);
    gameLoop();
});

window.addEventListener("gamepaddisconnected", e => {
    if (e.gamepad.id.includes("Xbox"))
    {
        xboxPadIndex = null;
        document.js.xboxPadIndex.value = "";
        document.js.xboxPadId.value = "";
    }
    else if (e.gamepad.id.includes("STANDARD"))
    {
        stdPadIndex = null;
        document.js.stdPadIndex.value = "";
        document.js.stdPadId.value = "";
    }
    else
    {
        return;
    }

    cancelAnimationFrame(start);
});
