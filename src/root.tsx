// @refresh reload
import { Suspense } from "solid-js";
import { A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Route, Scripts, Title } from "solid-start";
import "./root.css";
import index from "./routes/index";

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
              <Route path="/" component={index} />
              <Route path="/:channelCollection" component={index} />
              <Route path="/:channelCollection/:channel" component={index} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
