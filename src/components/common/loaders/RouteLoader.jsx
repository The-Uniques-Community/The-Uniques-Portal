import { Suspense } from "react";

import CustomLoader from "./CustomLoader";

const index = (Component, hasFallback = true) => (props) =>
  hasFallback ? (
    <Suspense fallback={<CustomLoader />}>
      <Component {...props} />
    </Suspense>
  ) : (
    <Component {...props} />
  );

export default index;
