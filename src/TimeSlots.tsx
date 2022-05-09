import React, { ChangeEventHandler, KeyboardEventHandler, KeyboardEvent } from 'react'
import styled from 'styled-components'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Slot } from '.'

const Wrapper = styled.form``

const Label = styled.label`
    margin-right: 0.5em;
    margin-left: 1em;
`

const NumberInput = styled.input`
    max-width: 5em;
`

const DescriptionColumn = styled.div`
    /* Override .col-auto */
    flex-grow: 1 !important;
`

const DescInput = styled.input``

type Props = {
    slots: Slot[]
    timeslot: Slot
    i: number
    callWithRow: (row: number, callback: () => void) => ChangeEventHandler<HTMLInputElement>
    updateTime: () => void
    updateDesc: () => void
    removeSlot: (index: number) => void
    addSlot: () => void
}

const TimeSlotItem = SortableElement<Props>(
    ({ timeslot, i, callWithRow, updateTime, updateDesc, removeSlot, addSlot }: Props) => {
        const addSlotOnEnter: KeyboardEventHandler<HTMLInputElement> = (evt: KeyboardEvent<HTMLInputElement>) =>
            evt.which === 13 ? addSlot() : 0

        return (
            <div className="timeslot-item form-row mb-2 align-items-center form-group" key={`${timeslot.id}`}>
                <div className="col-auto">
                    <Label className="sr-only" htmlFor={`${timeslot.id}_time`}>
                        Duration in minutes
                    </Label>
                    <NumberInput
                        type="number"
                        className="form-control mb-2"
                        id={`${timeslot.id}_time`}
                        onChange={callWithRow(i, updateTime)}
                        onKeyUp={addSlotOnEnter}
                        value={timeslot.time ? timeslot.time : 0}
                        size={4}
                        placeholder="Length (min)"
                        min="0"
                        step="5"
                    />
                </div>
                <DescriptionColumn className="col-auto">
                    <Label className="sr-only" htmlFor={`${timeslot.id}_desc`}>
                        Description
                    </Label>
                    <DescInput
                        type="text"
                        className="form-control mb-2"
                        id={`${timeslot.id}_desc`}
                        onChange={callWithRow(i, updateDesc)}
                        onKeyUp={addSlotOnEnter}
                        value={timeslot.desc}
                        placeholder="Description"
                    />
                </DescriptionColumn>
                <div className="col-auto">
                    <button className="btn btn-outline-danger btn-sm mb-2" type="button" onClick={() => removeSlot(i)}>
                        Remove
                    </button>
                </div>
            </div>
        )
    },
)

const TimeSlotList = SortableContainer<Props>((props: Props) => (
    <Wrapper>
        {props.slots.map((timeslot, index) => (
            <TimeSlotItem {...props} key={`item-${timeslot.id}`} timeslot={timeslot} index={index} i={index} />
        ))}
    </Wrapper>
))

type Indices = { oldIndex: number; newIndex: number }

function TimeSlots(props: { reorderSlots: (indices: Indices) => void } & Props) {
    const callWithRow = (
        row: number,
        callback: (oldIndex: number, newIndex: number | string) => void,
    ): ChangeEventHandler<HTMLInputElement> => (evt) => {
        callback(row, evt.target.value)
    }

    const onSortEnd = ({ oldIndex, newIndex }: Indices) => {
        const { reorderSlots } = props

        reorderSlots({ oldIndex, newIndex })
    }

    return <TimeSlotList {...props} onSortEnd={onSortEnd} callWithRow={callWithRow} />
}

export default TimeSlots
