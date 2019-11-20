import * as React from 'react'
import styled from 'styled-components'

const StyledLabel = styled.label`
    margin-right: 0.5em;
`

const StyledInput = styled.input`
    width: 80px;
`

class StartTime extends React.Component {
    updateTime = val => {
        const { updateTime } = this.props

        updateTime(val)
    }

    // The time input doesn't fire as many change events as we'd like,
    // so manually check it whenever there's action on its container
    onCheckTime = () => {
        this.updateTime(document.getElementById('startTime').value)
    }

    render() {
        const { time } = this.props

        return (
            <form className="form-inline" onKeyUp={this.onCheckTime} onClick={this.onCheckTime}>
                <StyledLabel htmlFor="startTime">Start time:</StyledLabel>
                <StyledInput
                    type="time"
                    className="form-control form-control-inline"
                    value={time}
                    id="startTime"
                    onChange={evt => this.updateTime(evt.target.value)}
                />
            </form>
        )
    }
}

export default StartTime
