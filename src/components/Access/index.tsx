import type { AuthType } from "@/api/menu";
import { useLoaderData } from "react-router-dom";

interface AccessProps {
  children: React.ReactNode;
  code: string;
}

const Access = (props: AccessProps) => {
  const { children, code } = props;
  const loaderData = useLoaderData<{ authList: AuthType[] }>();
  const authList = loaderData?.authList ?? [];
  const hasAccess = authList?.map((item) => item.authMark === code);
  if (!hasAccess) {
    return null;
  }
  return children;
};

export default Access;
