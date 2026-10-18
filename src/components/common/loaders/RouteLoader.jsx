import { Suspense } from "react";
import { PageSkeleton } from "@/components/common/skeletons";

const index = (Component, hasFallback = true, FallbackComponent = PageSkeleton) => (props) =>
  hasFallback ? (
    <Suspense fallback={<FallbackComponent />}>
      <Component {...props} />
    </Suspense>
  ) : (
    <Component {...props} />
  );

export default index;
