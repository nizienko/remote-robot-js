class Keyboard {
    constructor(remoteRobot) {
        this.remoteRobor = remoteRobot
    }

    async enterText(text) {
        await this.remoteRobor.runJs(`
            const text = '${text}'
            for (let c of text) {
                robot.type(c)
            }
        `)
    }
    async enter() {
        await this.remoteRobor.runJs('robot.pressAndReleaseKey(java.awt.event.KeyEvent.VK_ENTER)')
    }
}

exports.Keyboard = Keyboard