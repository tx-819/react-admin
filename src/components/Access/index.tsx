import type { AuthType } from "@/api/permission";
import { useLoaderData } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

interface AccessProps {
  children: React.ReactNode;
  code: string;
}

const Access = (props: AccessProps) => {
  const { children, code } = props;
  const user = useUserStore();
  const loaderData = useLoaderData<{ authList: AuthType[] }>();
  const authList = loaderData?.authList ?? [];
  const hasAccess = authList?.map((item) => item.code === code);
  if (user.isSuper) {
    return children;
  }
  if (!hasAccess) {
    return null;
  }
  return children;
};

export default Access;
