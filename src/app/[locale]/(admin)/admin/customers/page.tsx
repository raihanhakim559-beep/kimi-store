import { notFound } from "next/navigation";

import { AdminModuleTemplate } from "@/components/admin-module-template";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const AdminCustomersPage = () => {
  const adminModule = getAdminModuleBySlug("customers");

  if (!adminModule) {
    notFound();
  }

  return <AdminModuleTemplate module={adminModule} />;
};

export default AdminCustomersPage;
