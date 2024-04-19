import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BorrowDAPPModule = buildModule("BorrowDAPPModule", (m) => {
  const borrowDAPP = m.contract("BorrowDAPP", [], {});
  return { borrowDAPP };
});

export default BorrowDAPPModule;
