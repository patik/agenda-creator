/* global ga: true */
import * as React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import arrayMove from 'array-move'

import TimeSlots from './TimeSlots.js'
import Result from './Result.js'
import StartTime from './StartTime.js'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const getRandomInt = () => Math.floor(Math.random() * Math.floor(1000))

class App extends React.Component {
    state = {
        slots: [],
        start: '',
        elapsed: 0,
        results: [],
        prefs: {
            time: true,
            duration: false,
        },
    }

    componentDidMount() {
        // Set some initial values in order to make the output area display something sensible, otherwise we need to wait for some user change before any results will be calculated
        this.addSlot({ time: 10, desc: 'Intro' })
        this.updateStartTime('09:00')

        if (window.location.hash) {
            this.applyHash(decodeURIComponent(window.location.hash.replace(/^#/, '')))
        }
    }

    applyHash = hash => {
        try {
            const { slots, start } = JSON.parse(hash)
            const newState = { ...this.state, slots, start }

            // Re-add the data that was left out of the URL
            newState.slots.map(slot => ({
                id: getRandomInt(),
            }))

            this.setState(newState)
            ga('send', 'event', 'hash', 'applied')
        } catch (e) {
            if (window.debugAgendaCreator) {
                console.error('Applying the hash failed with error ', e, '\nCurrent state: ', { ...this.state })
            }
        }
    }

    copyToClipboard = str => {
        const el = document.createElement('textarea')
        el.value = str
        el.setAttribute('readonly', '')
        el.style.position = 'absolute'
        el.style.left = '-9999px'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
    }

    copyUrl = () => {
        try {
            const slimState = {
                slots: this.state.slots,
                start: this.state.start,
            }

            // Only keep the data we need (e.g. no IDs)
            slimState.slots.map(slot => ({
                time: slot.time,
                desc: slot.desc,
            }))

            const url = `${window.location.origin}/#${encodeURIComponent(JSON.stringify(slimState))}`

            this.copyToClipboard(url)
            ga('send', 'event', 'button', 'click', 'copy_url')
        } catch (e) {
            if (window.debugAgendaCreator) {
                console.error('Copying URL to clipboard failed with error ', e, '\nCurrent state: ', { ...this.state })
            }
        }
    }

    minToHourMin = total => {
        // Setting a default value above wouldn't take care of NaN
        if (isNaN(total)) {
            total = 0
        }

        const hours = Math.floor(total / 60)
        const mins = total % 60
        const minsText = `${mins} min${mins === 1 ? '' : 's'}`

        if (!hours) {
            return minsText
        }

        const hoursText = `${hours} hour${hours === 1 ? '' : 's'}`

        if (mins === 0) {
            return hoursText
        }

        return `${hoursText}, ${minsText}`
    }

    getEndTimeText = end => `-${end.format('HH:mm')}`

    // Arguments are optional
    getResults = (slots, prefs) => {
        if (!slots) {
            slots = this.state.slots
        }

        if (!prefs) {
            prefs = this.state.prefs
        }

        const { start } = this.state
        const { duration: showDuration, time: showTime } = prefs
        const startTime = moment(`2000-01-01T${start ? start : '09:00'}:00`)

        const results = []
        let elapsed = 0

        slots.forEach(entry => {
            const begin = moment(startTime).add(elapsed, 'minutes')
            const end = moment(begin).add(entry.time, 'minutes')
            const key = `result_${entry.id}`
            let text = entry.desc

            // Alter the text based on prefs
            // Only show the end time if it's different than the begin time
            if (showDuration && showTime) {
                text = `${begin.format('HH:mm')}${entry.time > 0 ? this.getEndTimeText(end) : ''} (${this.minToHourMin(
                    entry.time,
                )}) ${entry.desc}`
            } else if (showDuration) {
                text = `${this.minToHourMin(entry.time)} — ${entry.desc}`
            } else if (showTime) {
                text = `${begin.format('HH:mm')}${entry.time > 0 ? this.getEndTimeText(end) : ''} ${entry.desc}`
            }

            results.push({
                text,
                key,
                // For Confluence output:
                begin,
                end,
                desc: entry.desc,
                time: entry.time,
            })

            elapsed += entry.time
        })

        return { results, elapsed }
    }

    getResultsAsText = results => results.map(result => result.text).join('\n')

    getResultsAsConfluence = results => {
        const {
            prefs: { duration: showDuration, time: showTime },
        } = this.state
        let headerRow = '||'

        if (showTime) {
            headerRow += 'Time||'
        }

        if (showDuration) {
            headerRow += 'Duration||'
        }

        headerRow += 'Description||Person||'

        let bodyRows = []

        results.forEach(result => {
            let rowText = '|'

            if (showTime) {
                rowText += `${result.begin.format('HH:mm')}${result.time > 0 ? this.getEndTimeText(result.end) : ''}|`
            }

            if (showDuration) {
                rowText += `${this.minToHourMin(result.time)}|`
            }

            rowText += `${result.desc ? result.desc : ' '}|`

            bodyRows.push(rowText)
        })

        return `${headerRow}\n${bodyRows.join('\n')}`
    }

    updateStartTime = val => {
        const newState = {
            ...this.state,
        }

        newState.start = val.trim()

        const { results, elapsed } = this.getResults()

        newState.results = results
        newState.elapsed = elapsed

        this.setState(newState)
    }

    updateSlotValue = (row, name, val) => {
        const newState = {
            ...this.state,
        }

        if (window.debugAgendaCreator) {
            console.log(`Updating slots[${row}].${name} from ${newState.slots[row][name]} to ${val}`)
        }

        newState.slots[row][name] = val

        const { results, elapsed } = this.getResults()

        newState.results = results
        newState.elapsed = elapsed

        this.setState(newState)
    }

    updateSlotTime = (row, val) => {
        this.updateSlotValue(row, 'time', parseInt(val, 10))
    }

    updateSlotDesc = (row, val) => {
        this.updateSlotValue(row, 'desc', val)
    }

    addSlot = (entry = {}, doNotTrack = false) => {
        const newState = {
            ...this.state,
        }

        if (!entry.time) {
            entry.time = 0
        }

        if (!entry.desc) {
            entry.desc = ''
        }

        newState.slots.push({
            ...entry,
            id: getRandomInt(),
        })

        const { results, elapsed } = this.getResults(newState.slots)

        newState.results = results
        newState.elapsed = elapsed

        this.setState(newState)

        if (!doNotTrack) {
            try {
                ga('send', 'event', 'add_slot', 'click', 'empty_slot')
            } catch (e) {
                console.error('Google Analytics error: ', e)
            }
        }
    }

    removeSlot = index => {
        const newState = {
            ...this.state,
        }

        newState.slots.splice(index, 1)

        const { results, elapsed } = this.getResults(newState.slots)

        newState.results = results
        newState.elapsed = elapsed

        this.setState(newState)
    }

    addBreak = () => {
        const time = 5

        this.addSlot({ time, desc: 'Break' }, true)

        try {
            ga('send', 'event', 'add_slot', 'click', 'break', time)
        } catch (e) {
            console.error('Google Analytics error: ', e)
        }
    }

    reorderSlots = ({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
            this.setState(({ slots }) => {
                const newOrder = arrayMove(slots, oldIndex, newIndex)

                return {
                    slots: newOrder,
                    results: this.getResults(newOrder).results,
                }
            })
        }
    }

    updatePref = (name, evt) => {
        const newState = { ...this.state }

        newState.prefs[name] = evt.target.checked

        // Get a fresh set of results with the preferences applied
        newState.results = this.getResults(newState.slots).results

        this.setState(newState)

        try {
            ga('send', 'event', 'preference', 'change', name, evt.target.checked ? 1 : 0)
        } catch (e) {
            console.error('Google Analytics error: ', e)
        }
    }

    render() {
        const { slots, results, elapsed, start, prefs } = this.state

        return (
            <div className="container">
                <h1>
                    <a href="https://agenda-creator.netlify.com/">Agenda Creator</a>
                </h1>
                <p>
                    <em>Generate meeting agendas and itineraries</em>
                </p>

                <h2>Start Time</h2>
                <StartTime time={start} updateTime={this.updateStartTime} />

                <h2>Time Slots</h2>
                <p>Enter the length of each time slot in minutes. Drag and drop to reorder them.</p>
                <TimeSlots
                    slots={slots}
                    updateTime={this.updateSlotTime}
                    updateDesc={this.updateSlotDesc}
                    elapsed={elapsed}
                    removeSlot={this.removeSlot}
                    reorderSlots={this.reorderSlots}
                    addSlot={this.addSlot}
                />

                <p>Total: {this.minToHourMin(elapsed)}</p>

                {/* Here we need to call addSlot like this so we don't pass the click event to it as an argument */}
                <button type="button" className="btn btn-primary" onClick={() => this.addSlot()}>
                    Add time slot
                </button>
                <button type="button" className="btn btn-outline-primary" onClick={this.addBreak}>
                    Add break
                </button>

                <h2 className="mt-4">Result</h2>
                <Result start={start} results={results} />

                <div className="container" style={{ marginBottom: '1em' }}>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="pref-time"
                            defaultChecked={prefs.time}
                            onChange={evt => {
                                this.updatePref('time', evt)
                            }}
                        />
                        <label className="form-check-label" htmlFor="pref-time">
                            Show start and end times
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="pref-duration"
                            defaultChecked={prefs.duration}
                            onChange={evt => {
                                this.updatePref('duration', evt)
                            }}
                        />
                        <label className="form-check-label" htmlFor="pref-duration">
                            Show durations
                        </label>
                    </div>
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                    <div className="col">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => {
                                this.copyToClipboard(this.getResultsAsText(results))
                                ga('send', 'event', 'button', 'click', 'plain_text')
                            }}
                        >
                            Copy as plain text (Outlook)
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                this.copyToClipboard(this.getResultsAsConfluence(results))
                                ga('send', 'event', 'button', 'click', 'confluence_table')
                            }}
                        >
                            Copy as Confluence table
                        </button>
                        <button type="button" className="btn btn-outline-success" onClick={this.copyUrl}>
                            Copy link
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p>
                            <a href="https://github.com/patik/agenda-creator/issues/new">Report an issue</a>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

const rootElement = document.getElementById('root')

ReactDOM.render(<App />, rootElement)
