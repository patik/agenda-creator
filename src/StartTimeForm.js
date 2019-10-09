import * as React from 'react'
import styled from 'styled-components'

const StyledLabel = styled.label`
    margin-right: 0.5em;
`

const StyledInput = styled.input`
    width: 80px;
`

class StartTimeForm extends React.Component {
    updateTime = val => {
        const { updateTime } = this.props

        updateTime(val)
    }

    render() {
        const { time } = this.props

        return (
            <form className="form-inline">
                <StyledLabel htmlFor="startTime">Start time:</StyledLabel>
                <StyledInput
                    type="time"
                    className="form-control form-control-inline"
                    value={time}
                    onChange={evt => this.updateTime(evt.target.value)}
                />
            </form>
        )
    }
}

export default StartTimeForm
