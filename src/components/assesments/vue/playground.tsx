'use client'
import React from 'react'

interface PlaygroundProps {
  starterCode: string
  testCode: string
}

const Playground = ({ starterCode, testCode }: PlaygroundProps) => {

  /**
   * The run test code is somewhat complicate because we need to handle the case where the user returns a component instead of exporting it.
   *
   * @param userCode The user's code.
   * @param testCode The test code.
   * @returns `true` if all tests pass, `false` otherwise.
   */
  return (
    <div className='bg-white h-screen flex flex-col'>
      <p>Vue Playground</p>
    </div>
  )
}

export default Playground
