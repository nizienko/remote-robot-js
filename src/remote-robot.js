const fixtures = require('./fixtures.js')

class RemoteRobot {
    constructor(url) {
        const protocol = url.split("://")[0]
        this.host = url.split("://")[1].split(":")[0]
        this.port = url.split("://")[1].split(":")[1].replace("/", "")
        this.url = `${protocol}://${this.host}:${this.port}`
        this.fetch = require('node-fetch');
    }

    async hierarchy() {
        const response = await this.fetch(`${this.url}`)
        return response.text()
    }

    async find(xpath, type, timeout, fixture) {
        if (!timeout) {
            timeout = 2000
        }
        let components = await this.findAll(xpath, type, fixture)
        if (components.length !== 1) {
            const startTime = Date.now()
            while ((Date.now() - startTime) < timeout) {
                components = await this.findAll(xpath, type, fixture)
                if (components.length === 1) {
                    break
                }
            }
        }
        if (components.length === 1) {
            return components[0]
        }
        if (components.length === 0) {
            throw `Can't find ${xpath} in ${timeout}ms`
        }
        if (components.length > 0) {
            throw `Found ${components.length} with ${xpath} in ${timeout}ms`
        }
    }

    async findAll(xpath, type, fixture) {
        let url
        if (fixture) {
            url = `${this.url}/xpath/${fixture.data.id}/components`
        } else {
            url = `${this.url}/xpath/components`
        }
        const response = await this.fetch(url, {
            method: 'post',
            body: JSON.stringify({xpath: xpath}),
            headers: {'Content-Type': 'application/json'}
        })
        if (!type) {
            type = fixtures.Container
        }
        return this.#requireSuccess(JSON.parse(await response.text())).elementList
            .map(e => Reflect.construct(type, [this, e]))
    }

    async runJs(script, runInEdt = false, fixture) {
        let url
        if (fixture) {
            url = `${this.url}/${fixture.data.id}/js/execute`
        } else {
            url = `${this.url}/js/execute`
        }
        const response = await this.fetch(url, {
            method: 'post',
            body: JSON.stringify({script: script, runInEdt: runInEdt}),
            headers: {'Content-Type': 'application/json'}
        })
        this.#requireSuccess(JSON.parse(await response.text()))
    }

    async callJs(script, returnObject, runInEdt = false, fixture) {
        let url
        if (fixture) {
            url = `${this.url}/${fixture.data.id}/js/retrieveAny`
        } else {
            url = `${this.url}/js/retrieveAny`
        }
        const fullScript = `
            ${script}
            ${this.#javaToJson(returnObject)}
        `
        const response = await this.fetch(url, {
            method: 'post',
            body: JSON.stringify({script: fullScript, runInEdt: false}),
            headers: {'Content-Type': 'application/json'}
        })
        const result = this.#requireSuccess(JSON.parse(await response.text()))
        const rawData = String.fromCharCode.apply(null, result.bytes.slice(7, result.bytes.size))
        return JSON.parse(rawData)
    }

    async componentData(id) {
        // /{componentId}/data
        const response = await this.fetch(`${this.url}/${id}/data`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'}
        })
        return this.#requireSuccess(JSON.parse(await response.text())).componentData
    }

    #javaToJson(obj) {
        return "new com.google.gson.Gson().toJson(" + obj + ")"
    }

    #requireSuccess(response) {
        if (response.log.length > 0) {
            console.log(response.log)
        }
        if (response.status === "SUCCESS") {
            return response
        }
        throw response.message
    }
}

exports.RemoteRobot = RemoteRobot

async function click(clickable) {
    await clickable.click()
}

exports.click = click

async function rightClick(clickable) {
    await clickable.rightClick()
}

exports.rightClick = rightClick

async function waitFor(predicate, timout = 2000) {
    const startTime = Date.now();
    while (true) {
        const result = await predicate()
        if (result === true) {
            return
        }
        if ((Date.now() - startTime) > timout) {
            throw `Timout waiting ${predicate}`
        }
    }
}

exports.waitFor = waitFor

function equals(text) {
    return (it) => it === text;
}

exports.equals = equals