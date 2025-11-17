jest.mock("@/lib/schema", () => {
  const select = jest.fn();
  const del = jest.fn();
  const update = jest.fn();
  const insert = jest.fn();

  return {
    db: {
      select,
      delete: del,
      update,
      insert,
    },
    orders: {
      id: "orders.id",
      orderNumber: "orders.orderNumber",
      cartId: "orders.cartId",
      status: "orders.status",
    },
    orderItems: {
      orderId: "orderItems.orderId",
    },
  };
});

jest.mock("drizzle-orm", () => ({
  and: jest.fn(() => "and-condition"),
  eq: jest.fn(() => "eq-condition"),
}));

import { persistPendingOrder } from "@/lib/order-persistence";
import { db, orderItems, orders } from "@/lib/schema";

type MockedDb = typeof db & {
  select: jest.Mock;
  delete: jest.Mock;
  update: jest.Mock;
  insert: jest.Mock;
};

const mockedDb = db as MockedDb;

const buildSelectChain = (rows: unknown[]) => ({
  from: () => ({
    where: () => ({
      limit: () => Promise.resolve(rows),
    }),
  }),
});

describe("persistPendingOrder", () => {
  const baseArgs = {
    cartId: "cart_123",
    userId: "user_456",
    currency: "USD",
    discountTotal: 500,
    taxTotal: 0,
    totals: {
      subtotal: 10000,
      shipping: 0,
      total: 10000,
    },
    items: [
      {
        productId: "prod_1",
        productVariantId: "variant_1",
        title: "Product",
        description: "Desc",
        sku: "SKU-1",
        quantity: 1,
        unitPrice: 10000,
        lineTotal: 10000,
        productSlug: "product",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates an existing pending order and replaces items", async () => {
    const deleteWhere = jest.fn().mockResolvedValue(undefined);
    const updateWhere = jest.fn().mockResolvedValue(undefined);
    const updateSet = jest.fn(() => ({ where: updateWhere }));
    const itemValues = jest.fn().mockResolvedValue(undefined);

    mockedDb.select.mockReturnValueOnce(
      buildSelectChain([{ id: "order_existing", orderNumber: "KS-OLD" }]),
    );
    mockedDb.delete.mockReturnValueOnce({ where: deleteWhere });
    mockedDb.update.mockReturnValueOnce({ set: updateSet });
    mockedDb.insert.mockImplementation((table) => {
      if (table === orders) {
        return { values: jest.fn(() => ({ returning: jest.fn() })) };
      }
      if (table === orderItems) {
        return { values: itemValues };
      }
      throw new Error("Unexpected table");
    });

    const result = await persistPendingOrder(baseArgs);

    expect(result).toEqual({
      orderId: "order_existing",
      orderNumber: "KS-OLD",
    });
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: baseArgs.totals.subtotal }),
    );
    expect(itemValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          orderId: "order_existing",
          productId: "prod_1",
        }),
      ]),
    );
  });

  it("creates a new pending order when none exists", async () => {
    const orderReturning = jest.fn().mockResolvedValue([{ id: "order_new" }]);
    const orderValues = jest.fn(() => ({ returning: orderReturning }));
    const itemValues = jest.fn().mockResolvedValue(undefined);

    mockedDb.select.mockReturnValueOnce(buildSelectChain([]));
    mockedDb.update.mockReturnValueOnce({ set: jest.fn() });
    mockedDb.delete.mockReturnValueOnce({ where: jest.fn() });
    mockedDb.insert.mockImplementation((table) => {
      if (table === orders) {
        return { values: orderValues };
      }
      if (table === orderItems) {
        return { values: itemValues };
      }
      throw new Error("Unexpected table");
    });

    const result = await persistPendingOrder(baseArgs);

    expect(orderValues).toHaveBeenCalledWith(
      expect.objectContaining({ orderNumber: expect.stringMatching(/^KS-/) }),
    );
    expect(result).toEqual({
      orderId: "order_new",
      orderNumber: expect.any(String),
    });
    expect(itemValues).toHaveBeenCalledTimes(1);
  });
});
