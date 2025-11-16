import { notFound } from "next/navigation";

import { AdminModuleTemplate } from "@/components/admin-module-template";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const AdminCmsPage = () => {
  const adminModule = getAdminModuleBySlug("cms");

  if (!adminModule) {
    notFound();
  }

  return <AdminModuleTemplate module={adminModule} />;
};

export default AdminCmsPage;
