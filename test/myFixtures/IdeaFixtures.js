const {equals} = require("../../src/remote-robot");
const {waitFor, click} = require("../../src/remote-robot");
const {Container} = require("../../src/fixtures");


class WelcomeFrame extends Container {
    constructor(remoteRobot, data) {
        super(remoteRobot, data);
    }

    async clickNewProject() {
        return this.find("//div[@visible_text='New Project']").then(it => it.click())
    }

    async clickOpenProject() {
        return this.find("//div[@visible_text='Open']").then(it => it.click())
    }
}

exports.WelcomeFrame = WelcomeFrame

class Dialog extends Container {
    constructor(remoteRobot, data) {
        super(remoteRobot, data);
    }

    async clickNext() {
        return this.find("//div[contains(@text.key, 'button.wizard.next')]").then(click)
    }

    async clickFinish() {
        return this.find("//div[@text.key='button.finish']").then(click)
    }
}

exports.Dialog = Dialog

class IdeaFrame extends Container {
    constructor(remoteRobot, data) {
        super(remoteRobot, data);
    }

    async waitSmartMode() {
        const startTime = Date.now()
        await waitFor(async () => !(await this.isDumbMode()), 12_000)
        console.log(`Smart mode: ${(Date.now() - startTime) / 1000}s`)
    }

    async closeTipsOfTheDay() {
        const dialog = (await this.findAll("//*[@title.key='title.tip.of.the.day']"))[0]
        if (dialog) {
            await dialog.find("//div[@text.key='button.close']").then(click)
        }
    }

    async isDumbMode() {
        return await this.callJs('', 'com.intellij.openapi.project.DumbService.isDumb(component.project)', true)
    }

    async projectViewTree() {
        return await this.find("//div[@class='ProjectViewTree']")
    }

    async heavyWeightWindow(text) {
        const locator = "//div[@class='HeavyWeightWindow']"
        await waitFor(async ()=> (await this.findAll(locator)).length > 0)
        if (text) {
            const found = []
            for (const it of await this.findAll(locator)) {
                const texts = (await it.findAllText(equals(text))).length
                if (texts>0) {
                    found.push(it)
                }
            }
            if (found[0]) { return found[0]}
            throw `Can't find HeavyWeightWindow with '${text}'`
        }
        return await this.find(locator)
    }
}

exports.IdeaFrame = IdeaFrame