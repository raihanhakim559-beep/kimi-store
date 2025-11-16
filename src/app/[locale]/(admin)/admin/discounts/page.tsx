import { notFound } from "next/navigation";

import { AdminModuleTemplate } from "@/components/admin-module-template";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const AdminDiscountsPage = () => {
  const adminModule = getAdminModuleBySlug("discounts");

  if (!adminModule) {
    notFound();
  }

  return <AdminModuleTemplate module={adminModule} />;
};

export default AdminDiscountsPage;
