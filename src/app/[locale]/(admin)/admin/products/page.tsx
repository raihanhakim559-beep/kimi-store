import { notFound } from "next/navigation";

import { AdminModuleTemplate } from "@/components/admin-module-template";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const AdminProductsPage = () => {
  const adminModule = getAdminModuleBySlug("products");

  if (!adminModule) {
    notFound();
  }

  return <AdminModuleTemplate module={adminModule} />;
};

export default AdminProductsPage;
