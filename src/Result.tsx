import * as React from 'react'
import styled from 'styled-components'
import { Result } from './types'

const StyledOutput = styled.div`
    font-family: dm, Menlo, Monaco, 'Courier New', monospace;
    padding: 1em;
    margin: 1em;
    margin-left: 0 !important;
`

const DisplayResult = ({ results }: { results: Result[] }) => (
    <StyledOutput className="rounded border border-info">
        {results.map((result) => (
            <div key={result.key}>{result.text}</div>
        ))}
    </StyledOutput>
)

DisplayResult.defaultProps = {
    count: 1,
}

export default DisplayResult
