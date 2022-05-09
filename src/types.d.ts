import { Moment } from 'moment'

// type Json = string | number | boolean | null | { [property: string]: Json } | Json[]

declare global {
    interface Window {
        debugAgendaCreator: any
    }
}

type Slot = {
    id: number
    time: number
    desc: string
}

type Result = {
    text: string
    key: string
    // For Confluence output:
    begin: Moment
    end: Moment
    desc: string
    time: number
}

type Prefs = { duration: boolean; time: boolean }

type State = {
    slots: Slot[]
    start: string
    elapsed: number
    results: any[]
    prefs: {
        time: true
        duration: false
    }
}
