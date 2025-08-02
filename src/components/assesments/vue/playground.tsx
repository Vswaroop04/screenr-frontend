"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
// import { LiveProvider, LivePreview, LiveError } from "react-live";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface PlaygroundProps {
  starterCode: string;
  testCode: string;
}

const Playground = ({ starterCode, testCode }: PlaygroundProps) => {
  const [code, setCode] = useState(starterCode);
  const [status, setStatus] = useState<
    "idle" | "running" | "passed" | "failed"
  >("idle");
  const t = useTranslations("AssesmentsPage");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /**
   * The run test code is somewhat complicate because we need to handle the case where the user returns a component instead of exporting it.
   *
   * @param userCode The user's code.
   * @param testCode The test code.
   * @returns `true` if all tests pass, `false` otherwise.
   */
  /** Generates full HTML to be used in iframe for preview */

  function parseCode(userCode: string): string {
    let trimmedCode = userCode.trim();
    if (trimmedCode.endsWith(";")) {
      trimmedCode = trimmedCode.slice(0, -1);
    }
    const finalCode = trimmedCode + `.mount('#app');`;
    return finalCode;
  }

  function generatePreviewHtml(userCode: string) {
    const finalCode = parseCode(userCode);
    return `
  <!DOCTYPE html>
  <html lang="en">
  <body>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
      <div id="app"></div>
      <script type="module">
        const { createApp, ref, onMounted, computed, reactive, watch, watchEffect } = Vue;
        ${finalCode}
      </script>
    </body>
  </html>`;
  }

  /** Generates HTML that runs both the user code and testCode, sends result via postMessage */
  function generateTestHtml(userCode: string, testCode: string): string {
    const finalCode = parseCode(userCode)
    return `
      <!DOCTYPE html>
      <html>
        <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
      <body>
        <div id="app"></div>
        <script type="module">
          const { createApp, ref, reactive, computed, watch, watchEffect, onMounted, nextTick } = Vue;
          
          // Global test context to store app instance and expose data
          window.testContext = {};
          
          try {
            // Execute user code and capture the app
            const app = ${finalCode};
          
            // Store app instance for testing
            window.testContext.app = app;
            
            // Wait for Vue to finish mounting and then run tests
            nextTick().then(() => {
              try {
                // Execute test code
                ${testCode}
                
                // Run the actual test function
                const passed = testFunction();
                window.parent.postMessage({ pass: !!passed }, '*');
              } catch (err) {
                console.error('Test execution error:', err);
                window.parent.postMessage({ pass: false, error: err.message }, '*');
              }
            });
            
          } catch (err) {
            console.error('Setup error:', err);
            window.parent.postMessage({ pass: false, error: err.message }, '*');
          }
        </script>
      </body>
      </html>
    `;
  }

  /** Live preview renderer */
  useEffect(() => {
    const container = iframeRef.current;
    if (!container) return;
    container.innerHTML = ""; // Clear previous
    const iframe = document.createElement("iframe");
    iframe.title = "Vue Renderer";
    iframe.sandbox.add("allow-scripts");
    iframe.srcdoc = generatePreviewHtml(code);
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";

    container.appendChild(iframe);
  }, [code]);


  async function runTests(
    userCode: string,
    testCode: string
  ): Promise<boolean> {
    try {
      const html = generateTestHtml(userCode, testCode);
      return await new Promise<boolean>((resolve) => {
        const testFrame = document.createElement("iframe");
        testFrame.style.display = "none";
        testFrame.sandbox.add("allow-scripts");
        testFrame.srcdoc = html;

        const listener = (e: MessageEvent) => {
          resolve(!!e.data.pass);
          window.removeEventListener("message", listener);
          testFrame.remove();
        };

        window.addEventListener("message", listener);
        document.body.appendChild(testFrame);
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  function handleOnChange(value?: string) {
    setCode(value || "");
  }

  return (
    <div className="bg-white h-screen flex flex-col">
      {/* Top bar / heading (optional) */}
      <div className="p-4 text-xl font-semibold border-b">
        {t("vue_playground")}
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Editor - left */}
        <div className="w-1/2 h-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            theme="vs-dark"
            onChange={handleOnChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              contextmenu: false,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Live Preview / Success message */}
        {status !== "passed" ? (
          <div className="w-1/2 bg-gray-50 p-6 overflow-auto">
            {/* <LiveProvider code={code}>
              <LivePreview />
              <LiveError />
            </LiveProvider> */}
            <div ref={iframeRef} />
          </div>
        ) : (
          <div className="w-1/2 flex flex-col items-center justify-center text-center gap-2 p-6">
            <p className="text-green-600 font-semibold text-lg">
              ✅ {t("submissionSuccess")}
            </p>
            <p className="text-green-800">{t("allTestsPassed")}</p>
          </div>
        )}
      </div>

      {/* Submit button fixed at bottom right */}
      <div className="flex flex-col items-end p-4 border-t gap-2">
        {status === "failed" && (
          <span className="text-destructive font-medium">
            ❌ {t("testCasesFailed")}
          </span>
        )}
        <Button
          variant="default"
          disabled={status === "running" || status === "passed"}
          className="cursor-pointer min-w-[120px] flex items-center justify-center"
          onClick={async () => {
            setStatus("running");
            const passed = await runTests(code, testCode);
            setStatus(passed ? "passed" : "failed");
          }}
        >
          {status === "running" ? (
            <span className="animate-pulse">{t("loading")}</span>
          ) : status === "passed" ? (
            t("submitted")
          ) : (
            t("Submit")
          )}
        </Button>
      </div>
    </div>
  );
};

export default Playground;
