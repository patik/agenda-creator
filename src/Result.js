import * as React from 'react'
import styled from 'styled-components'

const StyledOutput = styled.div`
    font-family: dm, Menlo, Monaco, 'Courier New', monospace;
    padding: 1em;
    margin: 1em;
    margin-left: 0 !important;
`

const Result = ({ results }) => (
    <StyledOutput className="rounded border border-info">
        {results.map(result => (
            <div key={result.key}>{result.text}</div>
        ))}
    </StyledOutput>
)

Result.defaultProps = {
    count: 1,
}

export default Result
