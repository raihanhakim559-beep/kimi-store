import { notFound } from "next/navigation";

import { AdminModuleTemplate } from "@/components/admin-module-template";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const AdminOrdersPage = () => {
  const adminModule = getAdminModuleBySlug("orders");

  if (!adminModule) {
    notFound();
  }

  return <AdminModuleTemplate module={adminModule} />;
};

export default AdminOrdersPage;
