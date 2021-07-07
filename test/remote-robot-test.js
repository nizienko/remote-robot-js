const {Keyboard} = require("../src/keyboard");
const {RemoteRobot, click, rightClick, equals} = require("../src/remote-robot.js");
const {WelcomeFrame, Dialog, IdeaFrame} = require("./myFixtures/IdeaFixtures");

const remoteRobot = new RemoteRobot("http://127.0.0.1:8580/");
const keyboard = new Keyboard(remoteRobot)

describe('UI tests', function () {
    this.timeout(60_000)
    it('Create New Project', async function () {
        await remoteRobot.find("//div[@class='FlatWelcomeFrame']", WelcomeFrame)
            .then(frame => frame.clickNewProject())
        const dialog = await remoteRobot.find("//*[contains(@title.key, 'title.new.project')]", Dialog)
        await dialog.clickNext()
        await dialog.clickNext()
        await dialog.clickFinish()

        await remoteRobot.find("//div[@class='IdeFrameImpl']", IdeaFrame).then(async frame => {
            await frame.waitSmartMode()
            await frame.closeTipsOfTheDay()
            await frame.projectViewTree().then(async tree => {
                await tree.findText(equals('src'))
                    .then(await rightClick)
            })
            await frame.heavyWeightWindow().then(async popup => {
                await popup.findText(equals('New')).then(click)
            })
            await frame.heavyWeightWindow('Java Class').then(async popup => {
                await popup.findText(equals('Java Class')).then(click)
            })
        })
        await keyboard.enterText('App')
        await keyboard.enter()
    });
})