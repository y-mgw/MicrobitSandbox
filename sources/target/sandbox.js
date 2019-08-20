devices.onGamepadButton(MesDpadButtonInfo.BDown, function () {
    inputSpeed = 0
    inputLeftSpeed = 0
    inputRightSpeed = 0
})
devices.onGamepadButton(MesDpadButtonInfo._3Up, function () {
    inputLeftSpeed = 0
    inputRightSpeed = 0
})
devices.onGamepadButton(MesDpadButtonInfo.CUp, function () {
    inputSpeed = 0
})
devices.onGamepadButton(MesDpadButtonInfo.ADown, function () {
    inputSpeed = speed
})
devices.onGamepadButton(MesDpadButtonInfo._3Down, function () {
    inputLeftSpeed = turnSpeed
    inputRightSpeed = 0
})
devices.onGamepadButton(MesDpadButtonInfo._4Down, function () {
    inputLeftSpeed = 0
    inputRightSpeed = turnSpeed
})
function setBreakCore(value: number) {
    pins.digitalWritePin(DigitalPin.P15, value)
    pins.digitalWritePin(DigitalPin.P16, value)
}
devices.onGamepadButton(MesDpadButtonInfo.CDown, function () {
    inputSpeed = backSpeed
})
function setBreak(value: boolean) {
    setBreakCore(value ? 1 : 0)
}
function setSpeed(leftSpeed: number, rightSpeed: number) {
    if (1 < leftSpeed) {
        pins.analogWritePin(AnalogPin.P13, 1023)
    } else if (-1 > leftSpeed) {
        pins.analogWritePin(AnalogPin.P13, 0)
    } else {
        pins.analogWritePin(AnalogPin.P13, leftSpeed * 511 + 511)
    }
    if (1 < rightSpeed) {
        pins.analogWritePin(AnalogPin.P14, 1023)
    } else if (-1 > rightSpeed) {
        pins.analogWritePin(AnalogPin.P14, 0)
    } else {
        pins.analogWritePin(AnalogPin.P14, rightSpeed * 511 + 511)
    }
}
devices.onGamepadButton(MesDpadButtonInfo._4Up, function () {
    inputLeftSpeed = 0
    inputRightSpeed = 0
})
devices.onGamepadButton(MesDpadButtonInfo.AUp, function () {
    inputSpeed = 0
})
let actualRightSpeed = 0
let actualLeftSpeed = 0
let newActualRightSpeed = 0
let newActualLeftSpeed = 0
let inputSpeed = 0
let inputLeftSpeed = 0
let inputRightSpeed = 0
let turnSpeed = 0
let backSpeed = 0
let speed = 0
speed = 0.8
backSpeed = -0.8
turnSpeed = 0.5
inputRightSpeed = 0
inputLeftSpeed = 0
inputSpeed = 0
pins.analogWritePin(AnalogPin.P13, 511)
pins.analogWritePin(AnalogPin.P14, 511)
pins.analogSetPeriod(AnalogPin.P13, 1000)
pins.analogSetPeriod(AnalogPin.P14, 1000)
basic.forever(function () {
    if (inputSpeed < 0) {
        newActualLeftSpeed = (Math.abs(inputSpeed) + inputLeftSpeed - inputRightSpeed) * -1
        newActualRightSpeed = (Math.abs(inputSpeed) - inputLeftSpeed + inputRightSpeed) * -1
    } else {
        newActualLeftSpeed = inputSpeed + inputLeftSpeed - inputRightSpeed
        newActualRightSpeed = inputSpeed - inputLeftSpeed + inputRightSpeed
    }
    if (actualLeftSpeed != newActualLeftSpeed || actualRightSpeed != newActualRightSpeed) {
        setBreak(true)
        setSpeed(newActualLeftSpeed, newActualRightSpeed)
        actualLeftSpeed = newActualLeftSpeed
        actualRightSpeed = newActualRightSpeed
        setBreak(actualLeftSpeed == 0 && actualRightSpeed == 0)
    }
})
