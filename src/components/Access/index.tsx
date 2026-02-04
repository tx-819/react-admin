import type { RouteMeta } from "@/api/menu";
import { useLoaderData } from "react-router-dom";

interface AccessProps {
  children: React.ReactNode;
  code: string;
}

const Access = (props: AccessProps) => {
  const { children, code } = props;
  const loaderData = useLoaderData<{ meta: RouteMeta }>();
  const { authList } = loaderData?.meta ?? {};
  const hasAccess = authList?.some((item) => item.authMark === code);
  if (!hasAccess) {
    return null;
  }
  return children;
};

export default Access;
