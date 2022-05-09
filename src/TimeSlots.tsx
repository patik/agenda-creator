import React, { ChangeEventHandler, KeyboardEventHandler, KeyboardEvent } from 'react'
import styled from 'styled-components'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Slot } from '.'

const StyledForm = styled.form``

const Row = styled.div`
    display: flex;
`

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

type TimeSlotItemProps = {
    slots: Slot[]
    timeslot: Slot
    i: number
    callWithRow: (row: number, callback: (row: number, val: string) => void) => ChangeEventHandler<HTMLInputElement>
    updateTime: (row: number, val: string) => void
    updateDesc: (row: number, val: string) => void
    removeSlot: (index: number) => void
    addSlot: (entry?: Partial<Slot>, doNotTrack?: boolean) => void
}

const TimeSlotItem = SortableElement<TimeSlotItemProps>(
    ({ timeslot, i, callWithRow, updateTime, updateDesc, removeSlot, addSlot }: TimeSlotItemProps) => {
        const addSlotOnEnter: KeyboardEventHandler<HTMLInputElement> = (evt: KeyboardEvent<HTMLInputElement>) =>
            evt.key === 'Enter' ? addSlot() : 0

        return (
            <Row className="timeslot-item mb-2 align-items-center form-floating row" key={`${timeslot.id}`}>
                <div className="col-auto">
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
                    <Label className="visually-hidden" htmlFor={`${timeslot.id}_time`}>
                        Duration in minutes
                    </Label>
                </div>
                <DescriptionColumn className="col-auto">
                    <Label className="visually-hidden" htmlFor={`${timeslot.id}_desc`}>
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
            </Row>
        )
    },
)

type TimeSlotListProps = Omit<TimeSlotItemProps, 'timeslot' | 'i'>

const TimeSlotList = SortableContainer<TimeSlotListProps>((props: TimeSlotListProps) => (
    <StyledForm>
        {props.slots.map((timeslot, index) => (
            <TimeSlotItem {...props} key={`item-${timeslot.id}`} timeslot={timeslot} index={index} i={index} />
        ))}
    </StyledForm>
))

type Indices = { oldIndex: number; newIndex: number }
type TimeSlotProps = {
    reorderSlots: (indices: Indices) => void
} & Omit<TimeSlotListProps, 'callWithRow'>

function TimeSlots(props: TimeSlotProps) {
    const callWithRow = (
        row: number,
        callback: (oldIndex: number, newIndex: string) => void,
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
