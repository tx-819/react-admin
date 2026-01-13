import { useLoaderData } from "react-router";

const Console = () => {
  const loaderData = useLoaderData();
  console.log(loaderData);
  return <div>控制台页面</div>;
};

export default Console;
