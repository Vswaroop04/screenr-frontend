'use client'
import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { LiveProvider, LivePreview, LiveError } from 'react-live'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Babel from '@babel/standalone'

interface PlaygroundProps {
  starterCode: string
  testCode: string
}

const Playground = ({ starterCode, testCode }: PlaygroundProps) => {
  const [code, setCode] = useState(starterCode)
  const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle')
  const t = useTranslations('AssesmentsPage')

  /**
   * The run test code is somewhat complicate because we need to handle the case where the user returns a component instead of exporting it.
   *
   * @param userCode The user's code.
   * @param testCode The test code.
   * @returns `true` if all tests pass, `false` otherwise.
   */
  /**
   * Executes user + test code in a sandboxed iframe.
   * Resolves to `true` if tests pass, `false` otherwise.
   */
  async function runTests (
    userCode: string,
    testCode: string
  ): Promise<boolean> {
    try {
      const hasExport = /export\s+default/.test(userCode)
      const wrapped = hasExport
        ? userCode
        : `exports.default = (${userCode.trim()});`

      const userJS = Babel.transform(wrapped, {
        presets: [['react', { runtime: 'classic' }]]
      }).code!
      const testJS = testCode

      /* build sandbox page */
      const html = `
<!doctype html><html><body>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <script>
    const exports = {};
    /* user component */
    (function (exports, require, React, ReactDOM) {
      ${userJS}
    })(exports, null, React, ReactDOM);

    /* run tests */
     (async function (exports, require, React, ReactDOM) {
    try {
      const result = await (function (exports, require, React, ReactDOM) {
        return ${testJS};        /*  <-- added “return”  */
      })(exports, null, React, ReactDOM);

      parent.postMessage({ pass: !!result }, '*');
    } catch (_) {
      parent.postMessage({ pass: false }, '*');
    }
  })(exports, null, React, ReactDOM);
  </script>
</body></html>`

      /* create hidden iframe */
      return await new Promise<boolean>(resolve => {
        console.log(html)
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.sandbox.add('allow-scripts')
        iframe.srcdoc = html

        const listener = (e: MessageEvent) => {
          resolve(!!e.data.pass)
          window.removeEventListener('message', listener)
          iframe.remove()
        }

        window.addEventListener('message', listener)
        document.body.appendChild(iframe)
      })
    } catch (err) {
      toast.error('Something went wrong')
      console.error('Iframe test run failed', err)
      return false
    }
  }

  function handleOnChange (value?: string) {
    setCode(value || '')
  }

  return (
    <div className='bg-white h-screen flex flex-col'>
      {/* Top bar / heading (optional) */}
      <div className='p-4 text-xl font-semibold border-b'>{t('react_playground')}</div>

      {/* Main 2-column layout */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Monaco Editor - left */}
        <div className='w-1/2 h-full'>
          <Editor
            height='100%'
            defaultLanguage='javascript'
            value={code}
            theme='vs-dark'
            onChange={handleOnChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              contextmenu: false,
              scrollBeyondLastLine: false
            }}
          />
        </div>

        {/* Live Preview / Success message */}
        {status !== 'passed' ? (
          <div className='w-1/2 bg-gray-50 p-6 overflow-auto'>
            <LiveProvider code={code} scope={{ React }}>
              <LivePreview />
              <LiveError />
            </LiveProvider>
          </div>
        ) : (
          <div className='w-1/2 flex flex-col items-center justify-center text-center gap-2 p-6'>
            <p className='text-green-600 font-semibold text-lg'>✅ {t('submissionSuccess')}</p>
            <p className='text-green-800'>{t('allTestsPassed')}</p>
          </div>
        )}
      </div>

      {/* Submit button fixed at bottom right */}
      <div className='flex flex-col items-end p-4 border-t gap-2'>
        {status === 'failed' && (
          <span className='text-destructive font-medium'>❌ {t('testCasesFailed')}</span>
        )}
        <Button
          variant='default'
          disabled={status === 'running' || status === 'passed'}
          className='cursor-pointer min-w-[120px] flex items-center justify-center'
          onClick={async () => {
            setStatus('running')
            const passed = await runTests(code, testCode)
            setStatus(passed ? 'passed' : 'failed')
          }}
        >
          {status === 'running' ? <span className='animate-pulse'>{t('loading')}</span> : status === 'passed' ? t('submitted') : t('Submit') }
        </Button>
      </div>
    </div>
  )
}

export default Playground
