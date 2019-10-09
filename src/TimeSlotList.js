import * as React from 'react'
import styled from 'styled-components'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

const Wrapper = styled.form``

const Label = styled.label`
    margin-right: 0.5em;
    margin-left: 1em;
`

const NumberInput = styled.input`
    max-width: 5em;
`

const DescInput = styled.input``

const TimeSlotItem = SortableElement(({ timeslot, i, callWithRow, updateTime, updateDesc, removeSlot, addSlot }) => {
    const addSlotOnEnter = evt => (evt.which === 13 ? addSlot() : 0)

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
            <div className="col-auto">
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
            </div>
            <div className="col-auto">
                <button className="btn btn-outline-danger btn-sm mb-2" type="button" onClick={() => removeSlot(i)}>
                    Remove
                </button>
            </div>
        </div>
    )
})

const SortableList = SortableContainer(props => (
    <Wrapper>
        {props.slots.map((timeslot, index) => (
            <TimeSlotItem {...props} key={`item-${timeslot.id}`} timeslot={timeslot} index={index} i={index} />
        ))}
    </Wrapper>
))

class TimeSlotList extends React.Component {
    callWithRow = (row, callback) => evt => {
        callback(row, evt.target.value)
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        const { reorderSlots } = this.props

        reorderSlots({ oldIndex, newIndex })
    }

    render() {
        return <SortableList onSortEnd={this.onSortEnd} callWithRow={this.callWithRow} {...this.props} />
    }
}

export default TimeSlotList
