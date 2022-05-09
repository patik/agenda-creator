import * as React from 'react'
import styled from 'styled-components'

const StyledLabel = styled.label`
    margin-right: 0.5em;
`

const StyledInput = styled.input``

function StartTime(props: { time: string; updateTime: (val: string) => void }) {
    const updateTime = (val: string) => {
        const { updateTime } = props

        updateTime(val)
    }

    // The time input doesn't fire as many change events as we'd like,
    // so manually check it whenever there's action on its container
    const onCheckTime = () => {
        if (document) {
            const elem = document.getElementById('startTime')

            if (elem) {
                // @ts-ignore
                updateTime(elem.value)
            }
        }
    }

    const { time } = props

    return (
        <form className="form-inline" onKeyUp={onCheckTime} onClick={onCheckTime}>
            <StyledLabel htmlFor="startTime">Start time:</StyledLabel>
            <StyledInput
                type="time"
                className="form-control-inline"
                value={time}
                id="startTime"
                onChange={(evt) => updateTime(evt.target.value)}
            />
        </form>
    )
}

export default StartTime
