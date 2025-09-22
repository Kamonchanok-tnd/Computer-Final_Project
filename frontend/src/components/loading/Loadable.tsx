import { Suspense, ComponentType } from "react";
import Loader from "./Loader";
const Loadable =
  <P extends object>(Component: ComponentType<P>): ComponentType<P> =>
  (props: P) =>
    (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
export default Loadable;



// import React, { Suspense} from "react";
// import { Spin, Space } from "antd";

// const LoadingFallback: React.FC = () => (
//   <div
//     style={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "100vh",
//     }}
//   >
//     <Space size="middle" align="center">
//       <Spin size="small" />
//       <Spin />
//       <Spin size="large" />
//     </Space>
//   </div>
// );

// const Loadable = (Component: React.LazyExoticComponent<any>) => (props: any) =>
//   (
//     <Suspense fallback={<LoadingFallback />}>
//       <Component {...props} />
//     </Suspense>
//   );

// export default Loadable;
