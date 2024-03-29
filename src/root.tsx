// @refresh reload
import { Suspense } from "solid-js";
import { A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Route, Scripts, Title, Navigate } from "solid-start";
import "./root.css";

import App, { AppData } from "./routes/index";
import Error from "./routes/[...404]";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Disco</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <Route path="/" component={() => <Navigate href="/app" />} />
              <Route path="/app/" component={() => <Navigate href="@me" />} />
              <Route path="/app/*" data={AppData} component={App} />

              <Route path="/*404" component={Error} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
