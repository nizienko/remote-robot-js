class Component {
    constructor(remoteRobot, data) {
        this.remoteRobot = remoteRobot
        this.data = data
    }

    async runJs(script, runOnEdt = false) {
        return this.remoteRobot.runJs(script, runOnEdt, this)
    }

    async callJs(script, returnObject, runOnEdt = false) {
        return this.remoteRobot.callJs(script, returnObject, runOnEdt, this)
    }

    async click(point, button = 'MouseButton.LEFT_BUTTON', times = 1) {
        if (point) {
            await this.runJs(`robot.click(component, new Point(${point.x}, ${point.y}), ${button}, ${times})`)
        } else {
            await this.runJs(`robot.click(component, ${button}, ${times})`)
        }
    }

    async rightClick(point) {
        await this.click(point, 'MouseButton.RIGHT_BUTTON', 1)
    }

    async doubleClick(point) {
        await this.click(point, 'MouseButton.LEFT_BUTTON', 2)
    }

    async moveMouse(point) {
        if (point) {
            await this.runJs(`robot.moveMouse(component, new Point(${point.x}, ${point.y}))`)
        } else {
            await this.runJs(`robot.moveMouse(component)`)
        }
    }

    async locationOnScreen() {
        return this.callJs('', 'component.getLocationOnScreen()')
    }

    async componentHashCode() {
        return this.callJs('', 'component.hashCode()')
    }

    async hasFocus() {
        return this.callJs('', 'component.hasFocus()', true)
    }

    async isShowing() {
        return this.callJs('', 'component.isShowing()', true)
    }

    async isFocusOwner() {
        return this.callJs('', 'component.isFocusOwner()', true)
    }

    async #findAllText() {
        const data = await this.remoteRobot.componentData(this.data.id)
        return data.textDataList.map(data => new TextData(this, data))
    }

    async findText(textMatcher) {
        const allText = await this.#findAllText()
        const filtered = allText.filter(textData => textMatcher(textData.text()))
        if (filtered.length === 0) {
            throw `${this} doesn't contain text ${textMatcher}: ${allText.map(t => t.text()).join(', ')}`
        }
        if (filtered.length > 1) {
            throw `Found ${filtered.length} texts with ${textMatcher}: ${filtered.map(t => t.text()).join(', ')}`
        }
        return filtered[0]
    }

    async findAllText(textMatcher) {
        const allText = await this.#findAllText()
        return allText.filter(textData => textMatcher(textData.text()))
    }
}

exports.Component = Component

class Container extends Component {
    constructor(remoteRobot, data) {
        super(remoteRobot, data)
    }

    async find(xpath, type, timeout) {
        return this.remoteRobot.find(xpath, type, timeout, this)
    }

    async findAll(xpath, type) {
        return this.remoteRobot.findAll(xpath, type, this)
    }
}

exports.Container = Container

class TextData {
    constructor(component, textData) {
        this.component = component
        this.textData = textData
    }

    async click() {
        await this.component.click(this.textData.point)
    }
    async rightClick() {
        await this.component.rightClick(this.textData.point)
    }

    async moveMouse() {
        await this.component.moveMouse(this.textData.point)
    }

    text() {
        return this.textData.text
    }

    point() {
        return this.textData.point
    }

    bundleKey() {
        return this.textData.bundleKey
    }
}

