import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ErrorBoundary } from "react-error-boundary";

function MyFallbackComponent({ error, resetErrorBoundary }) {
  console.log(error, resetErrorBoundary);
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={MyFallbackComponent}>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </ErrorBoundary>
  );
}
